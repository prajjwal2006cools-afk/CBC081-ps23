"""Model architecture definition and fine-tuning logic."""
from typing import Optional
import tensorflow as tf


def build_model(
    num_classes: int,
    dropout: float = 0.2,
    input_shape=(224, 224, 3),
    weights: Optional[str] = "imagenet",
) -> tf.keras.Model:
    """Builds MobileNetV2 transfer learning model with integrated Rescaling layer."""
    inputs = tf.keras.Input(shape=input_shape, dtype="float32", name="image_input")
    # Rescaling layer inside the model guarantees exact [-1, 1] scaling
    x = tf.keras.layers.Rescaling(scale=1.0 / 127.5, offset=-1.0, name="rescaling")(inputs)

    base_model = tf.keras.applications.MobileNetV2(
        include_top=False,
        weights=weights,
        input_shape=input_shape,
    )
    base_model.trainable = False

    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = tf.keras.layers.Dropout(dropout, name="dropout")(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="crop_disease_mobilenetv2")
    return model


def unfreeze_top_layers(model: tf.keras.Model, num_layers: int = 30) -> tf.keras.Model:
    """Unfreezes top N layers of the MobileNetV2 base while keeping BatchNormalization layers frozen."""
    base_model = None
    for layer in model.layers:
        if isinstance(layer, tf.keras.Model) or "mobilenetv2" in layer.name.lower():
            base_model = layer
            break

    if base_model is None:
        return model

    base_model.trainable = True
    # Freeze all layers except the last num_layers
    for layer in base_model.layers[:-num_layers]:
        layer.trainable = False

    # Keep all BatchNormalization layers frozen for stable fine-tuning
    for layer in base_model.layers[-num_layers:]:
        if isinstance(layer, tf.keras.layers.BatchNormalization):
            layer.trainable = False

    return model
