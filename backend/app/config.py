from pathlib import Path
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv

# Load environment variables if .env exists
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings(BaseModel):
    PROJECT_NAME: str = "AI Power BI Dashboard Generator"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Upload and generated artifacts directories
    UPLOAD_DIR: Path = Field(default_factory=lambda: BASE_DIR / "uploads")
    GENERATED_DIR: Path = Field(default_factory=lambda: BASE_DIR / "generated")
    
    # File limits
    MAX_FILE_SIZE_BYTES: int = 100 * 1024 * 1024  # 100 MB
    ALLOWED_EXTENSIONS: set[str] = {".csv", ".xlsx"}

    def setup_directories(self) -> None:
        """Ensure necessary runtime directories exist."""
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.GENERATED_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.setup_directories()
