from typing import List, Dict, Any, Optional, Literal, Union
from pydantic import BaseModel, Field
from enum import Enum

# --- Domain & Taxonomies ---

class ProjectDomain(str, Enum):
    AUTOMOTIVE = "automotive"
    MARINE = "marine"
    STRUCTURAL = "structural"
    INDUSTRIAL = "industrial"
    WOODWORKING = "woodworking"
    GENERAL = "general"

class ConfidenceLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class InferredValue(BaseModel):
    value: Any
    confidence: ConfidenceLevel
    source: str

class ProjectContext(BaseModel):
    project_domain: Optional[ProjectDomain] = None
    project_type: Optional[str] = None
    subtype: Optional[str] = None
    goals: List[str] = Field(default_factory=list)

class KnowledgeGaps(BaseModel):
    critical: List[str] = Field(default_factory=list)
    important: List[str] = Field(default_factory=list)
    optional: List[str] = Field(default_factory=list)

class KnowledgeState(BaseModel):
    project_context: ProjectContext = Field(default_factory=ProjectContext)
    confirmed: Dict[str, Any] = Field(default_factory=dict)
    inferred: Dict[str, InferredValue] = Field(default_factory=dict)
    gaps: KnowledgeGaps = Field(default_factory=KnowledgeGaps)

# --- Chat & API Schemas ---

class SolutionStep(BaseModel):
    order: int
    title: str
    description: str
    proTips: List[str] = Field(default_factory=list, alias="tips")
    warnings: List[str] = Field(default_factory=list)
    products: List[str] = Field(default_factory=list, description="Shopify product handles")

    class Config:
        populate_by_name = True

class Solution(BaseModel):
    id: str
    title: str
    projectType: Optional[str] = None
    difficulty: str
    estimatedTime: str
    steps: List[SolutionStep] = Field(default_factory=list)
    totalPrice: float = 0.0
    totalProducts: int = 0
    assumptions: List[str] = Field(default_factory=list)

class ExpertChatRequest(BaseModel):
    message: str = Field(description="The user's message or question about a painting project.")
    history: List[Dict[str, str]] = Field(description="Previous chat history", default_factory=list)
    state: Optional[KnowledgeState] = Field(description="Current knowledge state of the user's project", default=None)

class ExpertQuestionOption(BaseModel):
    id: str = Field(description="Unique ID for the option (used as React key).")
    label: str = Field(description="The display text for the option in Greek.")
    value: str = Field(description="The technical value to be sent back if selected.")

class ExpertQuestion(BaseModel):
    id: str = Field(description="The identifier of the gap being asked about contextually.")
    text: str = Field(description="The actual question to ask the user in Greek.")
    type: Literal["multiple-choice", "text", "boolean", "image"] = "text"
    options: Optional[List[ExpertQuestionOption]] = Field(description="Structured options if multiple choice.", default=None)

class ExpertChatResponse(BaseModel):
    answer: str = Field(description="The expert's advice, acknowledgment, or analysis of what was just said.")
    question: Optional[ExpertQuestion] = Field(description="Optional follow-up question if there are still critical gaps.", default=None)
    suggested_products: List[Dict[str, Any]] = Field(description="List of specific Shopify products included in the advice.", default_factory=list)
    step_by_step_recipe: List[str] = Field(description="Deprecated simple recipe list.", default_factory=list)
    solution: Optional[Solution] = Field(description="The structured repair plan/blueprint.", default=None)
    safety_warnings: List[str] = Field(description="Critical safety warnings for the identified products.", default_factory=list)
    proposed_action: Optional[Dict[str, Any]] = Field(description="Optional technical action like ADD_TO_CART.", default=None)
    state: Optional[Dict[str, Any]] = Field(description="The continuously updated KnowledgeState dict to return to the client.", default=None)
    ready_for_solution: bool = Field(description="True if all critical gaps are filled.", default=False)

# Tool Input Schemas
class SearchTechnicalProductsInput(BaseModel):
    category: Optional[str] = None
    chemical_base: Optional[str] = None
    surfaces: Optional[List[str]] = None
    query: Optional[str] = None
    limit: int = 5
