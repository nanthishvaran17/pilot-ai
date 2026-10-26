import os
import pytest
from app.db.database import SessionLocal
from app.db.models import Project, Template, User
from app.services.exporter import ExportEngine
from app.services.blueprint_generator import BlueprintGenerator

def test_real_exports_generation():
    with SessionLocal() as db:
        user = db.query(User).first()
        template = db.query(Template).first()
        
        # Create test project
        project = Project(
            user_id=user.id,
            template_id=template.id,
            name="Automated Test Project",
            objective="Ensure export pipelines generate real downloadable files.",
            status="in_progress"
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        # 1. Blueprint generation
        bp = BlueprintGenerator.generate(project, db)
        assert bp is not None
        assert len(bp.content_json["project_goals"]) > 0

        # 2. PDF Export
        pdf_job = ExportEngine.generate_export(project, "pdf", db)
        assert os.path.exists(pdf_job.file_path)
        assert pdf_job.file_size > 500 # Valid non-empty PDF binary

        # 3. DOCX Export
        docx_job = ExportEngine.generate_export(project, "docx", db)
        assert os.path.exists(docx_job.file_path)
        assert docx_job.file_size > 500 # Valid DOCX binary

        # 4. JSON Export
        json_job = ExportEngine.generate_export(project, "json", db)
        assert os.path.exists(json_job.file_path)
        assert json_job.file_size > 100

        # 5. CSV Export
        csv_job = ExportEngine.generate_export(project, "csv", db)
        assert os.path.exists(csv_job.file_path)

        # 6. Markdown Export
        md_job = ExportEngine.generate_export(project, "md", db)
        assert os.path.exists(md_job.file_path)
        assert md_job.file_size > 200
