import os
from enum import Enum

class ModelName(Enum):
    SIMPLE = "gemini-2.5-flash-lite"
    COMPLEX = "gemini-3.1-flash-lite-preview"
    EMBEDDING = "text-embedding-004"

class LLMConfig:
    PROJECT_ID = "oinos-33896"
    REGION = "global"

    @classmethod
    def get_model_name(cls, complex: bool = False, simple: bool = False) -> str:
        if complex:
            return ModelName.COMPLEX.value
        if simple:
            return ModelName.SIMPLE.value
            
        # Default to simple if nothing is specified to strictly enforce the two bounds
        return ModelName.SIMPLE.value

    @classmethod
    def get_embedding_model_name(cls) -> str:
        return ModelName.EMBEDDING.value

    @classmethod
    def get_client(cls):
        """Returns a google-genai Client configured for Vertex AI."""
        from google import genai
        return genai.Client(
            vertexai=True,
            project=cls.PROJECT_ID,
            location=cls.REGION
        )
