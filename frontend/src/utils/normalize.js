const pretty = (s = "") => s.replace(/_/g, " ").trim();

function split(className = "") {
  if (!className) return { crop: "Unknown", disease: "Unknown" };
  const [crop = "Unknown", disease = "Unknown"] = className.split("___");
  return { crop: pretty(crop), disease: pretty(disease) };
}

export function normalizeResult(data) {
  if (!data) return null;

  // Handle top prediction from either format
  const topRaw = data.top_prediction || data.prediction || {};
  const label = topRaw.label || topRaw.class_name || "";
  const fallback = split(label);

  const crop = topRaw.crop || fallback.crop || "Unknown Plant";
  const disease = topRaw.disease || fallback.disease || "Unknown Condition";
  const isHealthy =
    Boolean(topRaw.is_healthy) ||
    /healthy/i.test(label) ||
    /healthy/i.test(disease);

  const rawConf = topRaw.confidence ?? 0;
  const confidence = Math.min(Math.max(Number(rawConf) || 0, 0), 1);

  // Predictions list (top 3)
  const rawList = data.predictions || topRaw.top_predictions || [];
  const topList = rawList.map((item) => {
    const itemLabel = item.label || item.class_name || "";
    const itemFallback = split(itemLabel);
    return {
      label: itemLabel,
      crop: item.crop || itemFallback.crop,
      disease: item.disease || itemFallback.disease,
      isHealthy: Boolean(item.is_healthy) || /healthy/i.test(itemLabel),
      confidence: Math.min(Math.max(Number(item.confidence) || 0, 0), 1),
    };
  });

  // Guidance / Advice normalization
  const g = data.guidance || {};
  const adv = data.advice || {};

  const summary =
    g.summary ||
    adv.summary ||
    (isHealthy
      ? `The ${crop} plant appears healthy with no visible signs of known diseases.`
      : `Possible symptoms of ${disease} observed on ${crop}.`);

  const visibleSymptoms =
    g.visible_symptoms || adv.symptoms || [];

  const safeNextSteps =
    g.safe_next_steps ||
    [...(adv.treatment || []), ...(adv.prevention || [])];

  const whenToSeekExpert =
    g.when_to_seek_expert ||
    "Please confirm with a local agricultural extension officer or certified agronomist.";

  return {
    label,
    crop,
    disease,
    isHealthy,
    confidence,
    confidenceLevel: data.confidence_level || (confidence >= 0.8 ? "high" : confidence >= 0.5 ? "medium" : "low"),
    mockMode: Boolean(data.mock_mode),
    warnings: data.warnings || [],
    disclaimer: data.disclaimer || "This is an automated AI estimate, not a confirmed diagnosis. Always consult a local agricultural extension officer.",
    topList,
    guidance: {
      summary,
      visibleSymptoms,
      safeNextSteps,
      whenToSeekExpert,
      source: g.source || "gemini",
      fallbackReason: g.fallback_reason || null,
    },
  };
}
