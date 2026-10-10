"""Calibration on validation split per Section 12.2."""
import json
from pathlib import Path
from typing import Dict, List, Tuple
import numpy as np


def calibrate_threshold(
    val_probs: np.ndarray,
    val_labels: np.ndarray,
    target_accuracy: float = 0.95,
    min_coverage: float = 0.80,
    min_margin: float = 0.10,
) -> Dict[str, float]:
    """Sweeps thresholds from 0.30 to 0.99 in steps of 0.01."""
    top1_probs = np.max(val_probs, axis=1)
    sorted_probs = np.sort(val_probs, axis=1)[:, ::-1]
    margins = sorted_probs[:, 0] - sorted_probs[:, 1]
    predictions = np.argmax(val_probs, axis=1)
    correct = predictions == val_labels
    total = len(val_labels)

    best_thresh = 0.70
    threshold_found = False

    for thresh in np.arange(0.30, 0.991, 0.01):
        accepted = (top1_probs >= thresh) & (margins >= min_margin)
        coverage = np.sum(accepted) / total
        if np.sum(accepted) == 0:
            continue
        acc = np.sum(correct[accepted]) / np.sum(accepted)

        if acc >= target_accuracy and coverage >= min_coverage:
            best_thresh = round(float(thresh), 2)
            threshold_found = True
            break

    return {
        "confidence_threshold": best_thresh,
        "min_margin": min_margin,
        "threshold_calibrated": threshold_found,
    }
