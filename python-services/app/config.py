# Configuration file for AI service
import os

class Config:
    MODEL_PATH = os.getenv("MODEL_PATH", "models/")
    SECRET_KEY = os.getenv("SECRET_KEY", "secret")
    SPACY_MODEL = "en_core_web_sm"

config = Config()