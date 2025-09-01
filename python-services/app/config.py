"""
Configuration settings for InsurAI AI Services
"""
import os
from typing import Optional

class Settings:
    """Application settings"""
    
    def __init__(self):
        # API Configuration
        self.api_title = "InsurAI AI Services"
        self.api_version = "1.0.0"
        self.api_description = "Comprehensive AI services for insurance automation"
        
        # Server Configuration
        self.host = os.getenv("HOST", "0.0.0.0")
        self.port = int(os.getenv("PORT", 8000))
        self.debug = os.getenv("DEBUG", "true").lower() == "true"
        
        # Database Configuration (if needed)
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./test.db")
        
        # AI Service Configuration
        self.ocr_enabled = True
        self.nlp_enabled = True
        self.risk_assessment_enabled = True
        self.fraud_detection_enabled = True
        self.chatbot_enabled = True
        
        # External API Configuration
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.azure_cognitive_key = os.getenv("AZURE_COGNITIVE_KEY")
        
        # Security
        self.secret_key = os.getenv("SECRET_KEY", "your-secret-key-here")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        
        # CORS Settings
        self.allowed_origins = [
            "http://localhost:3000",
            "http://localhost:8080",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8080"
        ]

# Global settings instance
_settings = None

def get_settings() -> Settings:
    """Get application settings (singleton pattern)"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings