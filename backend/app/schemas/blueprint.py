from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class BlueprintContent(BaseModel):
    executive_summary: str
    problem_statement: str
    project_goals: List[str]
    target_users: List[Dict[str, Any]]
    confirmed_functional_requirements: List[Dict[str, Any]]
    user_roles_and_permissions: List[Dict[str, Any]]
    page_by_page_ui_plan: List[Dict[str, Any]]
    detailed_user_journeys: List[Dict[str, Any]]
    workflow_diagrams_mermaid: str
    automation_rules: List[Dict[str, Any]]
    database_entities_and_relationships: Dict[str, Any]
    database_er_mermaid: str
    api_requirements: List[Dict[str, Any]]
    ai_architecture: Dict[str, Any]
    security_requirements: List[str]
    integration_requirements: List[str]
    validation_rules: List[Dict[str, Any]]
    error_handling_strategy: List[str]
    testing_strategy: List[Dict[str, Any]]
    mvp_scope: List[str]
    future_development_phases: List[Dict[str, Any]]
    acceptance_criteria: List[str]
    unresolved_decisions: List[Dict[str, Any]]
    assumptions_requiring_approval: List[Dict[str, Any]]

class BlueprintOut(BaseModel):
    id: str
    project_id: str
    version: int
    title: str
    content_json: Dict[str, Any]
    markdown_content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ExportRequest(BaseModel):
    export_format: str # pdf, docx, md, json, csv

class ExportJobOut(BaseModel):
    id: str
    project_id: str
    export_format: str
    file_name: str
    file_size: int
    download_url: str
    created_at: datetime

    class Config:
        from_attributes = True
