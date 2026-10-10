"""One error type for the whole backend. The frontend always gets the same error shape."""


class AppError(Exception):
    """An expected problem. `message` is safe and friendly to show to a farmer."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
