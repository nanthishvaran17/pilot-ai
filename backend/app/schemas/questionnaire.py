from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class QuestionOption(BaseModel):
    label: str
    value: Any
    hint: Optional[str] = None

class ConditionalRule(BaseModel):
    parent_key: str
    operator: str # "equals", "not_equals", "contains", "in", "is_not_empty"
    value: Any

class QuestionOut(BaseModel):
    id: str
    section_id: str
    key: str
    label: str
    explanation: Optional[str] = None
    question_type: str
    options: List[Dict[str, Any]] = []
    default_value: Optional[Any] = None
    is_required: bool = False
    help_text: Optional[str] = None
    recommendation: Optional[str] = None
    order_index: int = 0
    validation_rules: Dict[str, Any] = {}
    conditional_rule: Optional[Dict[str, Any]] = None
    
    # Dynamic runtime evaluation fields
    is_visible: bool = True
    current_response: Optional[Any] = None
    is_confirmed: bool = False
    is_inferred: bool = False
    is_skipped: bool = False
    is_undecided: bool = False

    class Config:
        from_attributes = True

class SectionOut(BaseModel):
    id: str
    key: str
    title: str
    description: Optional[str] = None
    order_index: int = 0
    icon: str = "Folder"
    is_required: bool = True
    questions: List[QuestionOut] = []
    is_completed: bool = False
    answered_count: int = 0
    required_count: int = 0

    class Config:
        from_attributes = True

class TemplateOut(BaseModel):
    id: str
    key: str
    name: str
    description: Optional[str] = None
    version: str
    is_default: bool
    sections: List[SectionOut] = []

    class Config:
        from_attributes = True

class ResponseSubmit(BaseModel):
    question_key: str
    value: Any
    is_confirmed: bool = True
    is_inferred: bool = False
    is_skipped: bool = False
    is_undecided: bool = False

class BatchResponseSubmit(BaseModel):
    responses: List[ResponseSubmit]

class ContradictionItem(BaseModel):
    id: str
    severity: str # "warning", "conflict"
    title: str
    description: str
    conflicting_keys: List[str]
    suggested_resolution: str

class MissingRequirementItem(BaseModel):
    id: str
    category: str
    label: str
    importance: str # "critical", "recommended"
    reason: str
    quick_fix_question_key: Optional[str] = None

class QuestionnaireStateOut(BaseModel):
    project_id: str
    project_name: str
    mode: str # beginner, advanced
    depth: str # basic, detailed, advanced
    completeness_score: float # 0.0 to 100.0
    sections: List[SectionOut]
    total_questions: int
    visible_questions: int
    answered_questions: int
    contradictions: List[ContradictionItem] = []
    missing_requirements: List[MissingRequirementItem] = []
