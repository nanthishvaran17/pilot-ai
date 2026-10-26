from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Project, Question, Response, AuditLog
from app.schemas.questionnaire import (
    QuestionnaireStateOut, ResponseSubmit, BatchResponseSubmit
)
from app.services.engine import QuestionnaireEngine
from app.api.deps import get_current_user

router = APIRouter(prefix="/questions", tags=["Questionnaire Engine"])

@router.get("/state/{project_id}", response_model=QuestionnaireStateOut)
def get_questionnaire_state(
    project_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return QuestionnaireEngine.compute_state(project, db)

@router.post("/autosave/{project_id}", response_model=QuestionnaireStateOut)
def autosave_response(
    project_id: str,
    payload: ResponseSubmit,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Locate question metadata
    question = db.query(Question).filter(Question.key == payload.question_key).first()

    # Find existing response or create new
    existing_resp = db.query(Response).filter(
        Response.project_id == project_id,
        Response.question_key == payload.question_key
    ).first()

    if existing_resp:
        existing_resp.value = payload.value
        existing_resp.is_confirmed = payload.is_confirmed
        existing_resp.is_inferred = payload.is_inferred
        existing_resp.is_skipped = payload.is_skipped
        existing_resp.is_undecided = payload.is_undecided
        if question:
            existing_resp.question_id = question.id
        db.add(existing_resp)
    else:
        new_resp = Response(
            project_id=project_id,
            question_id=question.id if question else None,
            question_key=payload.question_key,
            value=payload.value,
            is_confirmed=payload.is_confirmed,
            is_inferred=payload.is_inferred,
            is_skipped=payload.is_skipped,
            is_undecided=payload.is_undecided
        )
        db.add(new_resp)

    db.commit()

    # Recompute and return dynamic state
    return QuestionnaireEngine.compute_state(project, db)

@router.post("/batch/{project_id}", response_model=QuestionnaireStateOut)
def batch_save_responses(
    project_id: str,
    payload: BatchResponseSubmit,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for item in payload.responses:
        q = db.query(Question).filter(Question.key == item.question_key).first()
        r = db.query(Response).filter(
            Response.project_id == project_id,
            Response.question_key == item.question_key
        ).first()

        if r:
            r.value = item.value
            r.is_confirmed = item.is_confirmed
            r.is_inferred = item.is_inferred
            r.is_skipped = item.is_skipped
            r.is_undecided = item.is_undecided
            if q:
                r.question_id = q.id
            db.add(r)
        else:
            db.add(Response(
                project_id=project_id,
                question_id=q.id if q else None,
                question_key=item.question_key,
                value=item.value,
                is_confirmed=item.is_confirmed,
                is_inferred=item.is_inferred,
                is_skipped=item.is_skipped,
                is_undecided=item.is_undecided
            ))

    db.commit()
    return QuestionnaireEngine.compute_state(project, db)
