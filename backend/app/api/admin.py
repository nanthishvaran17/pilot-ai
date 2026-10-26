from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.database import get_db
from app.db.models import Template, Section, Question, Project, User, Blueprint, AuditLog
from app.schemas.questionnaire import TemplateOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/admin", tags=["Administration & Templates"])

@router.get("/templates")
def list_templates(db: Session = Depends(get_db)):
    templates = db.query(Template).all()
    results = []
    for t in templates:
        results.append({
            "id": t.id,
            "key": t.key,
            "name": t.name,
            "description": t.description,
            "version": t.version,
            "is_default": t.is_default,
            "sections_count": len(t.sections),
            "questions_count": sum(len(s.questions) for s in t.sections)
        })
    return results

@router.get("/templates/{template_id}")
def get_template(template_id: str, db: Session = Depends(get_db)):
    t = db.query(Template).filter((Template.id == template_id) | (Template.key == template_id)).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    
    sections_data = []
    for s in t.sections:
        sections_data.append({
            "id": s.id,
            "key": s.key,
            "title": s.title,
            "description": s.description,
            "order_index": s.order_index,
            "questions": [{
                "id": q.id,
                "key": q.key,
                "label": q.label,
                "type": q.question_type,
                "is_required": q.is_required,
                "options": q.options,
                "conditional_rule": q.conditional_rule
            } for q in s.questions]
        })

    return {
        "id": t.id,
        "key": t.key,
        "name": t.name,
        "description": t.description,
        "version": t.version,
        "sections": sections_data
    }

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [{
        "id": l.id,
        "user_id": l.user_id,
        "action": l.action,
        "resource_type": l.resource_type,
        "resource_id": l.resource_id,
        "created_at": l.created_at.isoformat()
    } for l in logs]

@router.get("/stats")
def get_system_stats(db: Session = Depends(get_db)):
    return {
        "total_users": db.query(User).count(),
        "total_projects": db.query(Project).count(),
        "total_templates": db.query(Template).count(),
        "total_blueprints": db.query(Blueprint).count()
    }
