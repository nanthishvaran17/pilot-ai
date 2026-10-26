from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str
    raw_idea: Optional[str] = None
    target_audience: Optional[str] = None
    template_id: Optional[str] = None
    mode: Optional[str] = "beginner" # beginner, advanced
    depth: Optional[str] = "basic" # basic, detailed, advanced

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    raw_idea: Optional[str] = None
    objective: Optional[str] = None
    target_audience: Optional[str] = None
    status: Optional[str] = None
    mode: Optional[str] = None
    depth: Optional[str] = None
    is_archived: Optional[bool] = None

class RequirementCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "Functional"
    moscow_priority: str = "must_have" # must_have, should_have, could_have, future_consideration
    importance: int = 3
    time_savings: Optional[str] = None
    users_affected: Optional[str] = None
    complexity: Optional[str] = "Medium"
    dependencies: List[str] = []
    is_mvp: bool = True
    source: Optional[str] = "user_confirmed"

class RequirementOut(RequirementCreate):
    id: str
    project_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class AssumptionOut(BaseModel):
    id: str
    project_id: str
    statement: str
    category: str
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class UnresolvedDecisionOut(BaseModel):
    id: str
    project_id: str
    topic: str
    description: Optional[str] = None
    options: List[str] = []
    impact: str
    status: str

    class Config:
        from_attributes = True

class ProjectOut(BaseModel):
    id: str
    user_id: str
    template_id: str
    name: str
    raw_idea: Optional[str] = None
    objective: Optional[str] = None
    target_audience: Optional[str] = None
    status: str
    mode: str
    depth: str
    completeness_score: float
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class IdeaAnalysisRequest(BaseModel):
    description: str

class IdeaAnalysisResponse(BaseModel):
    detected_project_name: Optional[str] = None
    objective: str
    target_audience: str
    core_problem: str
    expected_outcomes: List[str]
    suggested_modules: List[str]
    recommended_template_key: str
    detected_constraints: List[str]
    missing_critical_info: List[str]
    extracted_answers: Dict[str, Any]

class LiveRequirementsSummaryOut(BaseModel):
    project_id: str
    project_name: str
    objective: Optional[str] = None
    target_audience: Optional[str] = None
    status: str
    completeness_score: float
    confirmed_answers: Dict[str, Any]
    inferred_suggestions: Dict[str, Any]
    unanswered_questions: List[Dict[str, Any]]
    moscow_summary: Dict[str, List[RequirementOut]]
    mvp_features: List[str]
    assumptions: List[AssumptionOut]
    unresolved_decisions: List[UnresolvedDecisionOut]
