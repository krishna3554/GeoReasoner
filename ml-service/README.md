# GeoReasoner ML service

```bash
cd ml-service
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

The checkpoint is loaded from `models/damage_model_best.pt`. The Node backend
proxies `/api/ml/*` to this service; set `ML_SERVICE_URL` if it is not on port
8000. OSMnx routing uses OpenStreetMap when available and returns a deterministic
direct-distance fallback when map data cannot be fetched.
