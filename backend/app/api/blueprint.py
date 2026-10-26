import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import Project, Blueprint, ExportJob, AuditLog
from app.schemas.blueprint import BlueprintOut, ExportRequest, ExportJobOut
from app.services.blueprint_generator import BlueprintGenerator
from app.services.exporter import ExportEngine
from app.api.deps import get_current_user

router = APIRouter(prefix="/blueprint", tags=["Blueprint & Exports"])

@router.post("/{project_id}/generate", response_model=BlueprintOut)
def generate_blueprint(
    project_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    bp = BlueprintGenerator.generate(project, db)

    audit = AuditLog(
        user_id=current_user.id,
        action="GENERATE_BLUEPRINT",
        resource_type="Blueprint",
        resource_id=bp.id
    )
    db.add(audit)
    db.commit()

    return BlueprintOut.model_validate(bp)

@router.get("/{project_id}", response_model=BlueprintOut)
def get_blueprint(
    project_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    bp = db.query(Blueprint).filter(Blueprint.project_id == project_id).order_by(Blueprint.version.desc()).first()
    if not bp:
        bp = BlueprintGenerator.generate(project, db)

    return BlueprintOut.model_validate(bp)

@router.post("/{project_id}/export", response_model=ExportJobOut)
def export_blueprint(
    project_id: str,
    payload: ExportRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    job = ExportEngine.generate_export(project, payload.export_format, db)

    audit = AuditLog(
        user_id=current_user.id,
        action=f"EXPORT_{payload.export_format.upper()}",
        resource_type="ExportJob",
        resource_id=job.id
    )
    db.add(audit)
    db.commit()

    return ExportJobOut(
        id=job.id,
        project_id=job.project_id,
        export_format=job.export_format,
        file_name=job.file_name,
        file_size=job.file_size,
        download_url=f"/api/v1/blueprint/download/{job.id}",
        created_at=job.created_at
    )

@router.get("/download/{job_id}")
def download_export_file(
    job_id: str,
    db: Session = Depends(get_db)
):
    job = db.query(ExportJob).filter(ExportJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Export job not found")

    if not os.path.exists(job.file_path):
        raise HTTPException(status_code=404, detail="Exported file missing on server")

    media_types = {
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "json": "application/json",
        "csv": "text/csv",
        "md": "text/markdown"
    }
    media_type = media_types.get(job.export_format.lower(), "application/octet-stream")

    return FileResponse(
        path=job.file_path,
        media_type=media_type,
        filename=job.file_name
    )

@router.get("/{project_id}/exports", response_model=List[ExportJobOut])
def get_export_history(
    project_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    jobs = db.query(ExportJob).filter(ExportJob.project_id == project_id).order_by(ExportJob.created_at.desc()).all()
    return [
        ExportJobOut(
            id=j.id,
            project_id=j.project_id,
            export_format=j.export_format,
            file_name=j.file_name,
            file_size=j.file_size,
            download_url=f"/api/v1/blueprint/download/{j.id}",
            created_at=j.created_at
        ) for j in jobs
    ]
