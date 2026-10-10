"""Evaluation reporting on held-out test split and PlantDoc per Section 9."""
import json
from pathlib import Path
from typing import Dict, List, Optional
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix


def evaluate_split(
    y_true: np.ndarray,
    y_pred_probs: np.ndarray,
    class_names: List[str],
    output_dir: str | Path,
) -> dict:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    y_pred = np.argmax(y_pred_probs, axis=1)
    acc = float(np.mean(y_pred == y_true))

    # Top 3 accuracy
    top3_preds = np.argsort(-y_pred_probs, axis=1)[:, :3]
    top3_acc = float(np.mean([y_true[i] in top3_preds[i] for i in range(len(y_true))]))

    metrics = {
        "overall_accuracy": round(acc, 4),
        "top_3_accuracy": round(top3_acc, 4),
        "total_samples": len(y_true),
        "num_classes": len(class_names),
    }

    with open(out / "test_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    report_dict = classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        output_dict=True,
        zero_division=0,
    )
    pd.DataFrame(report_dict).transpose().to_csv(out / "classification_report.csv")

    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(class_names))))
    pd.DataFrame(cm, index=class_names, columns=class_names).to_csv(out / "confusion_matrix.csv")

    return metrics
