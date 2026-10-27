import os
import pytest
from app.db.database import SessionLocal
from app.services.academic_service import AcademicService
from app.db.models import AcademicEvent

def test_generate_question_paper_and_exports():
    with SessionLocal() as db:
        # 1. Generate Question paper
        qp = AcademicService.generate_question_paper(
            subject_code="CS3401",
            subject_name="Design and Analysis of Algorithms",
            topic_or_syllabus="Asymptotic notations, Divide and Conquer, Dynamic Programming, Greedy Algorithms",
            semester="Semester IV",
            max_marks=100,
            db=db
        )
        assert qp.id is not None
        assert len(qp.content_json["part_a"]) == 5
        assert len(qp.content_json["part_b"]) == 3
        assert len(qp.content_json["mcqs"]) == 5

        # 2. Export Word .docx
        docx_path = os.path.join("storage", "exports", "test_algo_paper.docx")
        AcademicService.export_question_paper_docx(qp, docx_path)
        assert os.path.exists(docx_path)
        assert os.path.getsize(docx_path) > 500

        # 3. Export PDF
        pdf_path = os.path.join("storage", "exports", "test_algo_paper.pdf")
        AcademicService.export_question_paper_pdf(qp, pdf_path)
        assert os.path.exists(pdf_path)
        assert os.path.getsize(pdf_path) > 500

def test_excel_marks_processing():
    test_rows = [
        {"reg_no": "731821104001", "name": "Arun Kumar S", "cia1": 45, "cia2": 42, "assignment": 10},
        {"reg_no": "731821104002", "name": "Deepa M", "cia1": 48, "cia2": 47, "assignment": 10},
        {"reg_no": "731821104003", "name": "Karthik R", "cia1": 15, "cia2": 18, "assignment": 5},
    ]
    with SessionLocal() as db:
        job = AcademicService.process_student_marks_excel(test_rows, "test_marks_verified.xlsx", db=db)
        assert job.valid_records == 3
        assert job.summary_stats["pass_percentage"] > 0
        assert os.path.exists(job.output_excel_path)

def test_events_and_qr_certificates():
    with SessionLocal() as db:
        event = AcademicEvent(
            title="National Symposium on Quantum AI 2026",
            event_type="Symposium",
            department="CSE",
            event_date="28 October 2026"
        )
        db.add(event)
        db.commit()

        participants = [
            {"name": "Siddharth V", "college": "Nandha Engineering College", "department": "CSE", "position": "First Prize"},
            {"name": "Priyanka T", "college": "PSG Tech", "department": "IT", "position": "Runner-Up"}
        ]
        certs = AcademicService.generate_bulk_certificates(event, participants, db=db)
        assert len(certs) == 2
        assert os.path.exists(certs[0].pdf_path)
        assert certs[0].cert_code.startswith("NEC-CSE-")
