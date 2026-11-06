"""Deterministic GeoReasoner inference and operations service."""
import base64
import io
import json
import math
import os
from pathlib import Path
from typing import Any

import networkx as nx
import torch
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from PIL import Image
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "models" / "damage_model_best.pt"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class BiTemporalDamageNet(torch.nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        self.encoder = resnet18_encoder()
        self.classifier = torch.nn.Sequential(
            torch.nn.Linear(1024, 256), torch.nn.ReLU(), torch.nn.Dropout(0.3),
            torch.nn.Linear(256, num_classes)
        )

    def forward(self, pre, post):
        pre_features = torch.flatten(self.encoder(pre), 1)
        post_features = torch.flatten(self.encoder(post), 1)
        return self.classifier(torch.cat([pre_features, post_features], dim=1))


class BasicBlock(torch.nn.Module):
    expansion = 1
    def __init__(self, inplanes, planes, stride=1, downsample=None):
        super().__init__()
        self.conv1 = torch.nn.Conv2d(inplanes, planes, 3, stride, 1, bias=False)
        self.bn1 = torch.nn.BatchNorm2d(planes)
        self.relu = torch.nn.ReLU(inplace=True)
        self.conv2 = torch.nn.Conv2d(planes, planes, 3, 1, 1, bias=False)
        self.bn2 = torch.nn.BatchNorm2d(planes)
        self.downsample, self.stride = downsample, stride
    def forward(self, x):
        identity = x
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        if self.downsample is not None: identity = self.downsample(x)
        return self.relu(out + identity)


def resnet18_encoder():
    def layer(inplanes, planes, blocks, stride):
        downsample = torch.nn.Sequential(torch.nn.Conv2d(inplanes, planes, 1, stride, bias=False), torch.nn.BatchNorm2d(planes)) if stride != 1 or inplanes != planes else None
        items = [BasicBlock(inplanes, planes, stride, downsample)]
        items += [BasicBlock(planes, planes) for _ in range(blocks - 1)]
        return torch.nn.Sequential(*items)
    return torch.nn.Sequential(
        torch.nn.Conv2d(3, 64, 7, 2, 3, bias=False), torch.nn.BatchNorm2d(64), torch.nn.ReLU(inplace=True),
        torch.nn.MaxPool2d(3, 2, 1), layer(64, 64, 2, 1), layer(64, 128, 2, 2),
        layer(128, 256, 2, 2), layer(256, 512, 2, 2), torch.nn.AdaptiveAvgPool2d((1, 1))
    )


def load_model():
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Missing model checkpoint: {MODEL_PATH}")
    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)
    names = checkpoint["class_names"]
    model = BiTemporalDamageNet(num_classes=len(names))
    model.load_state_dict(checkpoint["model_state"])
    return model.to(DEVICE).eval(), names


MODEL, CLASS_NAMES = load_model()
def preprocess(image):
    image = image.convert("RGB").resize((256, 256))
    tensor = torch.from_numpy(np.asarray(image, dtype=np.float32).transpose(2, 0, 1) / 255.0)
    return (tensor - torch.tensor([0.485, 0.456, 0.406])[:, None, None]) / torch.tensor([0.229, 0.224, 0.225])[:, None, None]


def certainty(confidence: float) -> str:
    return "confirmed" if confidence >= 0.75 else "likely" if confidence >= 0.45 else "unknown"


def classify(pre: Image.Image, post: Image.Image) -> dict[str, Any]:
    with torch.inference_mode():
        logits = MODEL(preprocess(pre).unsqueeze(0).to(DEVICE), preprocess(post).unsqueeze(0).to(DEVICE))
        probabilities = torch.softmax(logits, dim=1)[0].cpu().tolist()
    index = max(range(len(probabilities)), key=probabilities.__getitem__)
    confidence_value = float(probabilities[index])
    return {
        "damage_class": CLASS_NAMES[index], "confidence": round(confidence_value, 4),
        "certainty": certainty(confidence_value),
        "class_probabilities": {name: round(float(prob), 4) for name, prob in zip(CLASS_NAMES, probabilities)},
    }


def decode_image(value: str) -> Image.Image:
    if value.startswith("data:"):
        value = value.split(",", 1)[1]
    try:
        return Image.open(io.BytesIO(base64.b64decode(value)))
    except Exception as exc:
        raise HTTPException(400, "Invalid base64 image") from exc


app = FastAPI(title="GeoReasoner ML Service", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": True, "classes": CLASS_NAMES}


@app.post("/damage-analysis")
async def damage_analysis(request: Request, pre_image: UploadFile | None = File(default=None),
                          post_image: UploadFile | None = File(default=None),
                          pre_image_base64: str | None = Form(default=None),
                          post_image_base64: str | None = Form(default=None)):
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        if pre_image and post_image:
            pre, post = Image.open(io.BytesIO(await pre_image.read())), Image.open(io.BytesIO(await post_image.read()))
        elif pre_image_base64 and post_image_base64:
            pre, post = decode_image(pre_image_base64), decode_image(post_image_base64)
        else:
            raise HTTPException(400, "Provide pre_image and post_image")
    else:
        body = await request.json()
        pre, post = decode_image(body["pre_image_base64"]), decode_image(body["post_image_base64"])
    return classify(pre, post)


class RescueRequest(BaseModel):
    damage_class: str
    hazard_type: str = "unknown"
    confidence: float = Field(default=0.0, ge=0, le=1)
    certainty: str | None = None


@app.post("/rescue-plan")
def rescue_plan(payload: RescueRequest):
    rules = json.loads((ROOT / "rescue_rules.json").read_text())
    result = rules.get(f"{payload.damage_class}:{payload.hazard_type}", rules["default"])
    level = payload.certainty or certainty(payload.confidence)
    return {**result, "damage_class": payload.damage_class, "hazard_type": payload.hazard_type,
            "confidence": payload.confidence, "certainty": level}


class RouteRequest(BaseModel):
    start: list[float] = Field(min_length=2, max_length=2, description="[latitude, longitude]")
    end: list[float] = Field(min_length=2, max_length=2, description="[latitude, longitude]")
    hazards: list[dict[str, Any]] = []
    bbox: list[float] | None = None


def haversine(a, b):
    lat1, lon1, lat2, lon2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    return 6371000 * 2 * math.asin(math.sqrt(math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2))


@app.post("/route")
def route(payload: RouteRequest):
    # OSMnx is used when installed; the direct-edge fallback keeps local development deterministic/offline.
    try:
        import osmnx as ox
        if payload.bbox:
            north, south, east, west = payload.bbox
        else:
            north, south = max(payload.start[0], payload.end[0]) + .02, min(payload.start[0], payload.end[0]) - .02
            east, west = max(payload.start[1], payload.end[1]) + .02, min(payload.start[1], payload.end[1]) - .02
        graph = ox.graph_from_bbox((west, south, east, north), network_type="drive")
        start = ox.distance.nearest_nodes(graph, payload.start[1], payload.start[0])
        end = ox.distance.nearest_nodes(graph, payload.end[1], payload.end[0])
        path = nx.shortest_path(graph, start, end, weight="length")
        coords = [[graph.nodes[n]["y"], graph.nodes[n]["x"]] for n in path]
        distance = sum(haversine(coords[i], coords[i + 1]) for i in range(len(coords) - 1))
        source = "osm"
    except Exception:
        distance, coords, source = haversine(payload.start, payload.end), [payload.start, payload.end], "direct-fallback"
    known = [h.get("certainty") for h in payload.hazards if h.get("certainty")]
    level = "unknown" if "unknown" in known else "likely" if "likely" in known else "confirmed" if known else "unknown"
    blocked = any(h.get("damage_class") == "destroyed" and h.get("certainty") == "confirmed" for h in payload.hazards)
    multiplier = 3.0 if level == "likely" else 1.0 if level == "confirmed" else 1.25
    return {"coordinates": coords, "distance_m": round(distance * multiplier, 1), "base_distance_m": round(distance, 1),
            "blocked": blocked, "certainty": level, "source": source}


class AllocateRequest(BaseModel):
    units: list[dict[str, Any]]
    incidents: list[dict[str, Any]]


@app.post("/allocate")
def allocate(payload: AllocateRequest):
    if not payload.units or not payload.incidents:
        return {"assignments": [], "certainty": "unknown", "method": "hungarian"}
    try:
        from scipy.optimize import linear_sum_assignment
        cost = [[haversine(unit["location"], incident["location"]) / max(float(incident.get("priority", 1)), 1)
                 for incident in payload.incidents] for unit in payload.units]
        unit_indexes, incident_indexes = linear_sum_assignment(cost)
        assignments = [{"unit_id": payload.units[u].get("id"), "incident_id": payload.incidents[i].get("id"),
                        "distance_m": round(cost[u][i], 1), "certainty": "likely"}
                       for u, i in zip(unit_indexes, incident_indexes)]
        return {"assignments": assignments, "certainty": "likely", "method": "hungarian"}
    except ImportError:
        # Keep the service usable in a minimal install; production requirements include SciPy.
        available = list(payload.units)
        assignments = []
        for incident in sorted(payload.incidents, key=lambda x: x.get("priority", 0), reverse=True):
            if not available: break
            chosen = min(available, key=lambda unit: haversine(unit["location"], incident["location"]))
            available.remove(chosen)
            assignments.append({"unit_id": chosen.get("id"), "incident_id": incident.get("id"), "certainty": "likely"})
        return {"assignments": assignments, "certainty": "likely", "method": "greedy-distance-fallback"}
