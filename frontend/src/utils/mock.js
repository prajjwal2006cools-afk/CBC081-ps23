export const mockPredict = async () => {
  await new Promise((r) => setTimeout(r, 1200));
  return {
    success: true,
    mock_mode: true,
    top_prediction: {
      label: "Tomato___Late_blight",
      crop: "Tomato",
      disease: "Late blight",
      is_healthy: false,
      is_background: false,
      confidence: 0.9421,
    },
    predictions: [
      {
        label: "Tomato___Late_blight",
        crop: "Tomato",
        disease: "Late blight",
        is_healthy: false,
        is_background: false,
        confidence: 0.9421,
      },
      {
        label: "Tomato___Early_blight",
        crop: "Tomato",
        disease: "Early blight",
        is_healthy: false,
        is_background: false,
        confidence: 0.039,
      },
      {
        label: "Tomato___Leaf_Mold",
        crop: "Tomato",
        disease: "Leaf Mold",
        is_healthy: false,
        is_background: false,
        confidence: 0.0102,
      },
    ],
    confidence_level: "high",
    guidance: {
      summary: "Late blight is a fast-spreading fungal disease that causes dark patches on leaves.",
      visible_symptoms: [
        "Dark, water-soaked spots on leaves",
        "White fuzzy growth under leaves in humid weather",
        "Rapid browning and wilting of affected foliage",
      ],
      safe_next_steps: [
        "Remove and safely destroy badly affected leaves",
        "Avoid overhead watering and water directly at the base",
        "Improve spacing between plants to maximize airflow",
      ],
      when_to_seek_expert: "Confirm with a local agricultural extension officer before applying treatment.",
      source: "gemini",
      fallback_reason: null,
    },
    warnings: ["DEMO MODE: Simulated offline results."],
    disclaimer: "This is an AI-generated suggestion, not a confirmed diagnosis. Please confirm with a local agricultural expert.",
  };
};

export const mockChat = async (message) => {
  await new Promise((r) => setTimeout(r, 800));
  return {
    success: true,
    reply: `(Mock Agronomist Assistant) Regarding "${message}": Ensure good soil drainage and avoid wetting the plant leaves in humid periods. For certified treatments, always consult your local agricultural department representative.`,
  };
};
