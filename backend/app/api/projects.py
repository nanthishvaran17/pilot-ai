from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.database import get_db
from app.db.models import (
    User, Project, Template, Response, Requirement, 
    Assumption, UnresolvedDecision, AuditLog
)
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectOut, RequirementCreate, 
    RequirementOut, IdeaAnalysisRequest, IdeaAnalysisResponse, 
    LiveRequirementsSummaryOut
)
from app.services.idea_extractor import IdeaExtractor
from app.api.deps import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/analyze-idea", response_model=IdeaAnalysisResponse)
def analyze_idea(payload: IdeaAnalysisRequest):
    if not payload.description.strip():
        raise HTTPException(status_code=400, detail="Idea description cannot be empty")
    return IdeaExtractor.analyze_idea(payload.description)

@router.get("", response_model=List[ProjectOut])
def list_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.id, Project.is_archived == False)
        .order_by(Project.updated_at.desc())
        .all()
    )
    return [ProjectOut.model_validate(p) for p in projects]

@router.post("", response_model=ProjectOut)
def create_project(
    payload: ProjectCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Select template: provided ID, or match key, or default template
    template = None
    if payload.template_id:
        template = db.query(Template).filter(
            (Template.id == payload.template_id) | (Template.key == payload.template_id)
        ).first()

    if not template:
        template = db.query(Template).filter(Template.is_default == True).first()
        if not template:
            template = db.query(Template).first()

    if not template:
        raise HTTPException(status_code=500, detail="No active project template configured")

    # If raw idea is provided, extract initial objective/modules
    extracted_obj = None
    if payload.raw_idea:
        analysis = IdeaExtractor.analyze_idea(payload.raw_idea)
        extracted_obj = analysis.objective

    project = Project(
        user_id=current_user.id,
        template_id=template.id,
        name=payload.name,
        raw_idea=payload.raw_idea,
        objective=extracted_obj,
        target_audience=payload.target_audience,
        status="in_progress",
        mode=payload.mode or "beginner",
        depth=payload.depth or "basic",
        completeness_score=0.0
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # If raw_idea was analyzed, auto-populate inferred responses
    if payload.raw_idea:
        analysis = IdeaExtractor.analyze_idea(payload.raw_idea)
        for q_key, val in analysis.extracted_answers.items():
            resp = Response(
                project_id=project.id,
                question_key=q_key,
                value=val,
                is_confirmed=False,
                is_inferred=True
            )
            db.add(resp)
        
        # Populate initial suggested requirements
        for mod in analysis.suggested_modules:
            req = Requirement(
                project_id=project.id,
                title=mod,
                description=f"Core architectural module derived from initial project idea.",
                category="Functional",
                moscow_priority="must_have",
                importance=4,
                is_mvp=True,
                source="ai_inferred"
            )
            db.add(req)

        db.commit()

    # Log audit
    audit = AuditLog(
        user_id=current_user.id, 
        action="CREATE_PROJECT", 
        resource_type="Project", 
        resource_id=project.id
    )
    db.add(audit)
    db.commit()

    return ProjectOut.model_validate(project)

@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: str, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")
    return ProjectOut.model_validate(project)

@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(project, k, v)

    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectOut.model_validate(project)

@router.post("/{project_id}/duplicate", response_model=ProjectOut)
def duplicate_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    source = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source project not found")

    new_project = Project(
        user_id=current_user.id,
        template_id=source.template_id,
        name=f"{source.name} (Copy)",
        raw_idea=source.raw_idea,
        objective=source.objective,
        target_audience=source.target_audience,
        status="draft",
        mode=source.mode,
        depth=source.depth,
        completeness_score=source.completeness_score
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Copy responses
    for r in source.responses:
        db.add(Response(
            project_id=new_project.id,
            question_id=r.question_id,
            question_key=r.question_key,
            value=r.value,
            is_confirmed=r.is_confirmed,
            is_inferred=r.is_inferred,
            is_skipped=r.is_skipped,
            is_undecided=r.is_undecided
        ))

    # Copy requirements
    for req in source.requirements:
        db.add(Requirement(
            project_id=new_project.id,
            title=req.title,
            description=req.description,
            category=req.category,
            moscow_priority=req.moscow_priority,
            importance=req.importance,
            time_savings=req.time_savings,
            users_affected=req.users_affected,
            complexity=req.complexity,
            dependencies=req.dependencies,
            is_mvp=req.is_mvp,
            source=req.source
        ))

    db.commit()
    return ProjectOut.model_validate(new_project)

@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"message": "Project successfully deleted"}

@router.get("/{project_id}/summary", response_model=LiveRequirementsSummaryOut)
def get_live_summary(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    responses = db.query(Response).filter(Response.project_id == project.id).all()
    confirmed = {r.question_key: r.value for r in responses if r.is_confirmed and not r.is_skipped and not r.is_undecided}
    inferred = {r.question_key: r.value for r in responses if r.is_inferred and not r.is_confirmed}

    reqs = db.query(Requirement).filter(Requirement.project_id == project.id).all()
    moscow = {
        "must_have": [RequirementOut.model_validate(r) for r in reqs if r.moscow_priority == "must_have"],
        "should_have": [RequirementOut.model_validate(r) for r in reqs if r.moscow_priority == "should_have"],
        "could_have": [RequirementOut.model_validate(r) for r in reqs if r.moscow_priority == "could_have"],
        "future_consideration": [RequirementOut.model_validate(r) for r in reqs if r.moscow_priority == "future_consideration"]
    }
    mvp_list = [r.title for r in reqs if r.is_mvp]

    return LiveRequirementsSummaryOut(
        project_id=project.id,
        project_name=project.name,
        objective=project.objective,
        target_audience=project.target_audience,
        status=project.status,
        completeness_score=project.completeness_score,
        confirmed_answers=confirmed,
        inferred_suggestions=inferred,
        unanswered_questions=[],
        moscow_summary=moscow,
        mvp_features=mvp_list,
        assumptions=[a for a in project.assumptions],
        unresolved_decisions=[d for d in project.unresolved_decisions]
    )

@router.get("/{project_id}/requirements", response_model=List[RequirementOut])
def list_requirements(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reqs = db.query(Requirement).filter(Requirement.project_id == project_id).all()
    return [RequirementOut.model_validate(r) for r in reqs]

@router.post("/{project_id}/requirements", response_model=RequirementOut)
def create_requirement(
    project_id: str,
    payload: RequirementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    req = Requirement(
        project_id=project.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        moscow_priority=payload.moscow_priority,
        importance=payload.importance,
        time_savings=payload.time_savings,
        users_affected=payload.users_affected,
        complexity=payload.complexity,
        dependencies=payload.dependencies,
        is_mvp=payload.is_mvp,
        source=payload.source or "user_confirmed"
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return RequirementOut.model_validate(req)

@router.put("/{project_id}/requirements/{req_id}", response_model=RequirementOut)
def update_requirement(
    project_id: str,
    req_id: str,
    payload: RequirementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(Requirement).filter(Requirement.id == req_id, Requirement.project_id == project_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    for k, v in payload.model_dump().items():
        setattr(req, k, v)

    db.add(req)
    db.commit()
    db.refresh(req)
    return RequirementOut.model_validate(req)

@router.delete("/{project_id}/requirements/{req_id}")
def delete_requirement(
    project_id: str,
    req_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(Requirement).filter(Requirement.id == req_id, Requirement.project_id == project_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    db.delete(req)
    db.commit()
    return {"message": "Requirement deleted"}
