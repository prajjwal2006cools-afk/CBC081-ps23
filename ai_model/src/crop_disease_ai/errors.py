"""Exception hierarchy for crop_disease_ai module per specification Section 13."""


class CropDiseaseAIError(Exception):
    """Base exception for all AI model errors."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


class ModelNotFoundError(CropDiseaseAIError):
    def __init__(self, message: str = "crop_disease_model.keras missing"):
        super().__init__("MODEL_NOT_FOUND", message)


class ModelLoadError(CropDiseaseAIError):
    def __init__(self, message: str = "Model load failed"):
        super().__init__("MODEL_LOAD_FAILED", message)


class ClassMappingError(CropDiseaseAIError):
    def __init__(self, message: str = "class_names.json missing or invalid"):
        super().__init__("CLASS_MAPPING_INVALID", message)


class InvalidImageError(CropDiseaseAIError):
    def __init__(self, message: str = "Image invalid or corrupt"):
        super().__init__("INVALID_IMAGE", message)


class ImageTooLargeError(CropDiseaseAIError):
    def __init__(self, message: str = "Image exceeds size limits"):
        super().__init__("IMAGE_TOO_LARGE", message)


class UnsupportedInputError(CropDiseaseAIError):
    def __init__(self, message: str = "Unsupported input format or array type"):
        super().__init__("UNSUPPORTED_INPUT", message)


class InferenceError(CropDiseaseAIError):
    def __init__(self, message: str = "Inference execution failed"):
        super().__init__("INFERENCE_FAILED", message)


class DatasetNotFoundError(CropDiseaseAIError):
    def __init__(self, message: str = "Dataset directory not found"):
        super().__init__("DATASET_NOT_FOUND", message)


class DatasetValidationError(CropDiseaseAIError):
    def __init__(self, message: str = "Dataset validation failed"):
        super().__init__("DATASET_VALIDATION_ERROR", message)
