import os
from enum import Enum

class ModelName(Enum):
    SIMPLE = "gemini-2.5-flash-lite"
    COMPLEX = "gemini-3.1-flash-lite-preview"
    DEFAULT = "gemini-2.5-flash-lite"

class LLMConfig:
    PROJECT_ID = "oinos-33896"
    REGION = "global"

    @classmethod
    def get_model_name(cls, complex: bool = False, simple: bool = False) -> str:
        if complex:
            return ModelName.COMPLEX.value
        if simple:
            return ModelName.SIMPLE.value
        return ModelName.DEFAULT.value

    @classmethod
    def get_client(cls):
        """Returns a google-genai Client configured for Vertex AI."""
        from google import genai
        return genai.Client(
            vertexai=True,
            project=cls.PROJECT_ID,
            location=cls.REGION
        )
