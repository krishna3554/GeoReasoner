const { callMl } = require("../services/mlService");

const proxy = (path) => async (req, res) => {
  try {
    const result = await callMl(path, req.body);
    res.json(result);
  } catch (error) {
    console.error(`ML proxy ${path} error:`, error.message);
    res.status(error.status || 502).json({ message: error.message, certainty: "unknown" });
  }
};

module.exports = {
  damageAnalysis: proxy("/damage-analysis"),
  rescuePlan: proxy("/rescue-plan"),
  route: proxy("/route"),
  allocate: proxy("/allocate"),
};
