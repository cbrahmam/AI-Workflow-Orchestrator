import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Settings:
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", str(BASE_DIR / "workflow_data" / "workflows.db"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

settings = Settings()
