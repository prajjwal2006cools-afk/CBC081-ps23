# Crop Disease AI / ML Component

Standalone AI pipeline conforming to the **AI_MODEL.md** specification.

## Directory Structure
- `src/crop_disease_ai/`: Modular Python library containing preprocessing, model building, inference, labels, and training logic.
- `configs/default.yaml`: Training and inference hyperparameter configuration.
- `requirements.txt`: Environment dependencies.
- `tests/`: Automated unit and integration tests.

## Inference Usage
```python
from crop_disease_ai import get_predictor

predictor = get_predictor()
result = predictor.predict("path/to/leaf.jpg")
print(result["status"], result["crop"], result["condition"], result["confidence"])
```
