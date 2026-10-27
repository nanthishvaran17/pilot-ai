import os
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.config import settings
from app.db.models import (
    AcademicQuestionPaper, ExcelAutomationJob, AcademicEvent,
    ParticipantCertificate, ResultAnalysisRecord, LessonPlanItem,
    StaffTaskItem, AcademicResourceItem
)
from app.services.academic_service import AcademicService

router = APIRouter(prefix="/academic", tags=["Academic Staff Workflows"])

# ----------------- SCHEMAS -----------------
class QuestionPaperRequest(BaseModel):
    subject_code: str
    subject_name: str
    topic_or_syllabus: str
    department: Optional[str] = "Computer Science & Engineering"
    institution_name: Optional[str] = "Nandha Engineering College (Autonomous)"
    exam_title: Optional[str] = "Internal Assessment Examination - I"
    semester: Optional[str] = "Semester IV"
    max_marks: Optional[int] = 100

class ExcelRowInput(BaseModel):
    reg_no: str
    name: str
    cia1: float
    cia2: float
    assignment: float

class ExcelProcessRequest(BaseModel):
    records: List[ExcelRowInput]
    file_name: Optional[str] = "nandha_marks_assessment.xlsx"

class EventCreateRequest(BaseModel):
    title: str
    event_type: str = "Technical Symposium"
    department: str = "CSE"
    event_date: str
    organizer_name: str = "Faculty Coordinator"
    signatory_title: str = "Principal & Head of Department"
    participants: List[Dict[str, str]]

class ResultAnalysisRequest(BaseModel):
    subject_code: str
    subject_name: str
    exam_name: str = "Internal Assessment - I"
    student_records: List[Dict[str, Any]]

class LessonPlanCreate(BaseModel):
    department: str = "CSE"
    semester: str = "IV"
    subject_code: str
    subject_name: str
    unit_number: int
    topic_name: str
    planned_hours: int = 2
    actual_hours: int = 2
    teaching_aid: str = "PPT & Black Board"
    status: str = "Completed"

class StaffTaskCreate(BaseModel):
    title: str
    category: str = "Exam Duty"
    priority: str = "High"
    deadline: str
    status: str = "Pending"
    assigned_to: str = "Staff Member"

# ----------------- WORKFLOW 1: AI ACADEMIC WORKSPACE -----------------
@router.post("/question-paper/generate")
def generate_qp(req: QuestionPaperRequest, db: Session = Depends(get_db)):
    qp = AcademicService.generate_question_paper(
        subject_code=req.subject_code,
        subject_name=req.subject_name,
        topic_or_syllabus=req.topic_or_syllabus,
        department=req.department,
        institution_name=req.institution_name,
        exam_title=req.exam_title,
        semester=req.semester,
        max_marks=req.max_marks,
        db=db
    )
    return {
        "id": qp.id,
        "subject_code": qp.subject_code,
        "subject_name": qp.subject_name,
        "exam_title": qp.exam_title,
        "duration": qp.duration,
        "max_marks": qp.max_marks,
        "content": qp.content_json,
        "answer_key": qp.answer_key_json
    }

@router.get("/question-paper/{qp_id}/export/docx")
def export_qp_docx(qp_id: str, db: Session = Depends(get_db)):
    qp = db.query(AcademicQuestionPaper).filter(AcademicQuestionPaper.id == qp_id).first()
    if not qp:
        raise HTTPException(status_code=404, detail="Question paper not found")

    export_dir = os.path.join(settings.STORAGE_DIR, "exports")
    os.makedirs(export_dir, exist_ok=True)
    file_path = os.path.join(export_dir, f"{qp.subject_code}_Question_Paper.docx")
    AcademicService.export_question_paper_docx(qp, file_path)

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"{qp.subject_code}_Question_Paper.docx"
    )

@router.get("/question-paper/{qp_id}/export/pdf")
def export_qp_pdf(qp_id: str, db: Session = Depends(get_db)):
    qp = db.query(AcademicQuestionPaper).filter(AcademicQuestionPaper.id == qp_id).first()
    if not qp:
        raise HTTPException(status_code=404, detail="Question paper not found")

    export_dir = os.path.join(settings.STORAGE_DIR, "exports")
    os.makedirs(export_dir, exist_ok=True)
    file_path = os.path.join(export_dir, f"{qp.subject_code}_Question_Paper.pdf")
    AcademicService.export_question_paper_pdf(qp, file_path)

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"{qp.subject_code}_Question_Paper.pdf"
    )

# ----------------- WORKFLOW 2: DOCUMENT & EXCEL AUTOMATION -----------------
@router.post("/excel/process")
def process_excel(req: ExcelProcessRequest, db: Session = Depends(get_db)):
    raw_dicts = [r.model_dump() for r in req.records]
    job = AcademicService.process_student_marks_excel(
        raw_rows=raw_dicts,
        output_excel_name=req.file_name,
        db=db
    )
    return {
        "id": job.id,
        "file_name": job.file_name,
        "total_records": job.total_records,
        "valid_records": job.valid_records,
        "invalid_records": job.invalid_records,
        "summary_stats": job.summary_stats,
        "processed_data": job.processed_data,
        "download_url": f"/api/v1/academic/excel/download/{job.id}"
    }

@router.get("/excel/download/{job_id}")
def download_excel(job_id: str, db: Session = Depends(get_db)):
    job = db.query(ExcelAutomationJob).filter(ExcelAutomationJob.id == job_id).first()
    if not job or not os.path.exists(job.output_excel_path):
        raise HTTPException(status_code=404, detail="Processed Excel file not found")

    return FileResponse(
        path=job.output_excel_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=job.file_name
    )

# ----------------- WORKFLOW 3: EVENT & CERTIFICATES -----------------
@router.post("/events/create-and-issue")
def create_event_and_issue(req: EventCreateRequest, db: Session = Depends(get_db)):
    event = AcademicEvent(
        title=req.title,
        event_type=req.event_type,
        department=req.department,
        event_date=req.event_date,
        organizer_name=req.organizer_name,
        signatory_title=req.signatory_title
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    certs = AcademicService.generate_bulk_certificates(
        event=event,
        participants=req.participants,
        db=db
    )

    return {
        "event_id": event.id,
        "event_title": event.title,
        "total_certificates": len(certs),
        "certificates": [{
            "id": c.id,
            "cert_code": c.cert_code,
            "student_name": c.student_name,
            "position": c.position,
            "verify_url": c.verify_url,
            "download_url": f"/api/v1/academic/certificates/download/{c.id}"
        } for c in certs]
    }

@router.get("/certificates/download/{cert_id}")
def download_cert(cert_id: str, db: Session = Depends(get_db)):
    cert = db.query(ParticipantCertificate).filter(ParticipantCertificate.id == cert_id).first()
    if not cert or not os.path.exists(cert.pdf_path):
        raise HTTPException(status_code=404, detail="Certificate PDF not found")

    return FileResponse(
        path=cert.pdf_path,
        media_type="application/pdf",
        filename=f"{cert.cert_code}_{cert.student_name.replace(' ', '_')}.pdf"
    )

@router.get("/certificates/verify/{cert_code}")
def verify_certificate(cert_code: str, db: Session = Depends(get_db)):
    cert = db.query(ParticipantCertificate).filter(ParticipantCertificate.cert_code == cert_code).first()
    if not cert:
        return {
            "verified": False,
            "message": "Certificate record not found in official institutional database."
        }

    return {
        "verified": True,
        "cert_code": cert.cert_code,
        "student_name": cert.student_name,
        "college_name": cert.college_name,
        "department": cert.department,
        "position": cert.position,
        "event_title": cert.event.title if cert.event else "Academic Event",
        "event_date": cert.event.event_date if cert.event else "2026",
        "issued_by": "Nandha Engineering College (Autonomous)",
        "message": "Authentic Certificate verified against institutional ledger."
    }

# ----------------- WORKFLOW 4: RESULT ANALYSIS -----------------
@router.post("/results/analyze")
def analyze_results(req: ResultAnalysisRequest, db: Session = Depends(get_db)):
    analysis = AcademicService.analyze_marks_data(
        subject_code=req.subject_code,
        subject_name=req.subject_name,
        exam_name=req.exam_name,
        student_records=req.student_records,
        db=db
    )
    return {
        "id": analysis.id,
        "subject_code": analysis.subject_code,
        "subject_name": analysis.subject_name,
        "exam_name": analysis.exam_name,
        "total_students": analysis.total_students,
        "passed_count": analysis.passed_count,
        "failed_count": analysis.failed_count,
        "pass_percentage": analysis.pass_percentage,
        "class_average": analysis.class_average,
        "highest_mark": analysis.highest_mark,
        "lowest_mark": analysis.lowest_mark,
        "arrears_students": analysis.arrears_students,
        "weak_topics": analysis.weak_topics,
        "grade_distribution": analysis.grade_distribution
    }

# ----------------- WORKFLOW 5: STAFF WORK MANAGEMENT -----------------
@router.get("/lesson-plans")
def get_lesson_plans(db: Session = Depends(get_db)):
    items = db.query(LessonPlanItem).order_by(LessonPlanItem.unit_number).all()
    if not items:
        # Seed default lesson plans if empty
        defaults = [
            {"subject_code": "CS3401", "subject_name": "Algorithms", "unit_number": 1, "topic_name": "Asymptotic Notations & Recurrence Relations", "planned_hours": 3, "actual_hours": 3, "teaching_aid": "Black Board & PPT", "status": "Completed"},
            {"subject_code": "CS3401", "subject_name": "Algorithms", "unit_number": 2, "topic_name": "Divide and Conquer: Strassen's Matrix Multiplication", "planned_hours": 2, "actual_hours": 2, "teaching_aid": "NPTEL Video & Handout", "status": "Completed"},
            {"subject_code": "CS3401", "subject_name": "Algorithms", "unit_number": 3, "topic_name": "Dynamic Programming: 0/1 Knapsack & Bellman-Ford", "planned_hours": 3, "actual_hours": 2, "teaching_aid": "Hands-on Lab Coding", "status": "In Progress"},
            {"subject_code": "CS3401", "subject_name": "Algorithms", "unit_number": 4, "topic_name": "Greedy Technique: Huffman Coding & Prim's Algorithm", "planned_hours": 2, "actual_hours": 0, "teaching_aid": "PPT Presentation", "status": "Pending"},
            {"subject_code": "CS3401", "subject_name": "Algorithms", "unit_number": 5, "topic_name": "NP-Completeness & Approximation Algorithms", "planned_hours": 2, "actual_hours": 0, "teaching_aid": "Lecture Notes", "status": "Pending"}
        ]
        for d in defaults:
            db.add(LessonPlanItem(**d))
        db.commit()
        items = db.query(LessonPlanItem).all()

    return [{
        "id": item.id,
        "subject_code": item.subject_code,
        "subject_name": item.subject_name,
        "unit_number": item.unit_number,
        "topic_name": item.topic_name,
        "planned_hours": item.planned_hours,
        "actual_hours": item.actual_hours,
        "teaching_aid": item.teaching_aid,
        "status": item.status
    } for item in items]

@router.post("/lesson-plans")
def create_lesson_plan(item: LessonPlanCreate, db: Session = Depends(get_db)):
    new_item = LessonPlanItem(**item.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/tasks")
def get_staff_tasks(db: Session = Depends(get_db)):
    tasks = db.query(StaffTaskItem).all()
    if not tasks:
        defaults = [
            {"title": "Question Paper Submission (CIA - 1)", "category": "Exam Duty", "priority": "High", "deadline": "28 Oct 2026", "status": "Completed"},
            {"title": "Internal Assessment Marks Entry in Autonomous Portal", "category": "Mark Entry", "priority": "High", "deadline": "30 Oct 2026", "status": "In Progress"},
            {"title": "Lesson Plan Review & HOD Sign-off", "category": "Approvals", "priority": "Medium", "deadline": "02 Nov 2026", "status": "Pending"},
            {"title": "Symposium Paper Presentation Reviewer Duty", "category": "Event Coordination", "priority": "Medium", "deadline": "05 Nov 2026", "status": "Pending"}
        ]
        for d in defaults:
            db.add(StaffTaskItem(**d))
        db.commit()
        tasks = db.query(StaffTaskItem).all()

    return [{
        "id": t.id,
        "title": t.title,
        "category": t.category,
        "priority": t.priority,
        "deadline": t.deadline,
        "status": t.status,
        "assigned_to": t.assigned_to
    } for t in tasks]

@router.post("/tasks")
def create_staff_task(task: StaffTaskCreate, db: Session = Depends(get_db)):
    new_task = StaffTaskItem(**task.model_dump())
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

# ----------------- WORKFLOW 6: SYLLABUS & RESOURCE HUB -----------------
@router.get("/resources")
def get_academic_resources(db: Session = Depends(get_db)):
    resources = db.query(AcademicResourceItem).all()
    if not resources:
        defaults = [
            {"department": "CSE", "semester": "IV", "subject_code": "CS3401", "subject_name": "Algorithms", "unit_number": "Unit 1", "resource_type": "Lecture Notes", "title": "Unit 1: Foundations & Asymptotic Complexity Complete Notes", "file_format": "PDF", "file_size": "2.4 MB"},
            {"department": "CSE", "semester": "IV", "subject_code": "CS3401", "subject_name": "Algorithms", "unit_number": "All Units", "resource_type": "Syllabus PDF", "title": "Official Autonomous Syllabus Regulation 2023", "file_format": "PDF", "file_size": "1.1 MB"},
            {"department": "CSE", "semester": "IV", "subject_code": "CS3401", "subject_name": "Algorithms", "unit_number": "Units 1-5", "resource_type": "Question Bank", "title": "2-Marks & 10-Marks Comprehensive Question Bank with Key", "file_format": "Word (.docx)", "file_size": "3.8 MB"},
            {"department": "CSE", "semester": "IV", "subject_code": "CS3491", "subject_name": "Operating Systems", "unit_number": "Unit 2", "resource_type": "Lecture Notes", "title": "Process Synchronization, Semaphores & Deadlock Notes", "file_format": "PDF", "file_size": "1.8 MB"},
            {"department": "CSE", "semester": "All", "subject_code": "GEN001", "subject_name": "Academic Templates", "unit_number": "General", "resource_type": "Academic Template", "title": "Standard Course File Index & Lab Manual Template", "file_format": "DOCX", "file_size": "850 KB"}
        ]
        for d in defaults:
            db.add(AcademicResourceItem(**d))
        db.commit()
        resources = db.query(AcademicResourceItem).all()

    return [{
        "id": r.id,
        "department": r.department,
        "semester": r.semester,
        "subject_code": r.subject_code,
        "subject_name": r.subject_name,
        "unit_number": r.unit_number,
        "resource_type": r.resource_type,
        "title": r.title,
        "file_format": r.file_format,
        "file_size": r.file_size
    } for r in resources]
