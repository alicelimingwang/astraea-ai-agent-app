"""
Astraea AI - Configuration & Secret Manager Service
Implements secure environment variable loading, secret manager fallbacks, and runtime safety config.
"""

import os
from typing import Optional
from pydantic import BaseModel, Field


class AppConfig(BaseModel):
    app_name: str = Field(default="Astraea AI Destiny Engine", description="Application display name")
    version: str = Field(default="3.0.0", description="System release version")
    environment: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    debug: bool = Field(default_factory=lambda: os.getenv("DEBUG", "true").lower() in ("true", "1", "yes"))
    
    # Gemini API Key with Secret Manager Fallback
    gemini_api_key: Optional[str] = Field(
        default_factory=lambda: os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"),
        description="Google Gemini LLM API Key"
    )
    
    # Database configuration
    database_url: str = Field(
        default_factory=lambda: os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./astraea_memory.db"),
        description="Async database connection string"
    )
    
    # Observability
    otel_service_name: str = Field(default="astraea-ai-backend", description="OpenTelemetry service name")
    log_level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))
    pii_redaction_enabled: bool = Field(default=True, description="Enable automatic PII masking in logs/traces")
    
    # HITL and Guardrails
    hitl_required_for_reports: bool = Field(default=True, description="Require user confirmation before deep synthesis")
    max_history_turns: int = Field(default=10, description="Max conversation turns before history compaction")


def get_secret_from_gcp(secret_id: str, project_id: Optional[str] = None) -> Optional[str]:
    """
    Attempts to retrieve a secret from Google Cloud Secret Manager securely.
    Returns None if Secret Manager client is not available or secret doesn't exist.
    """
    try:
        from google.cloud import secretmanager
        client = secretmanager.SecretManagerServiceClient()
        project = project_id or os.getenv("GCP_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT")
        if not project:
            return None
        name = f"projects/{project}/secrets/{secret_id}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8").strip()
    except Exception:
        return None


def load_config() -> AppConfig:
    config = AppConfig()
    
    # Try fetching GEMINI_API_KEY from Cloud Secret Manager if not present in env
    if not config.gemini_api_key:
        gcp_secret = get_secret_from_gcp("GEMINI_API_KEY")
        if gcp_secret:
            config.gemini_api_key = gcp_secret
            
    return config


config = load_config()
