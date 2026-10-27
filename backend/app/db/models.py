from datetime import datetime
import uuid
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user") # 'user', 'reviewer', 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")


class Template(Base):
    __tablename__ = "templates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    key = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    version = Column(String(50), default="1.0.0")
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sections = relationship("Section", back_populates="template", cascade="all, delete-orphan", order_by="Section.order_index")
    projects = relationship("Project", back_populates="template")


class Section(Base):
    __tablename__ = "sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    template_id = Column(String(36), ForeignKey("templates.id"), nullable=False)
    key = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    icon = Column(String(50), default="Folder")
    is_required = Column(Boolean, default=True)

    template = relationship("Template", back_populates="sections")
    questions = relationship("Question", back_populates="section", cascade="all, delete-orphan", order_by="Question.order_index")


class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    section_id = Column(String(36), ForeignKey("sections.id"), nullable=False)
    key = Column(String(100), nullable=False, index=True)
    label = Column(String(500), nullable=False)
    explanation = Column(Text, nullable=True)
    question_type = Column(String(50), nullable=False) 
    # Types: single_choice, multiple_choice, dropdown, short_text, long_text, number, date, boolean, ranking, priority
    options = Column(JSON, default=list) # [{'label': 'Web', 'value': 'web', 'hint': '...'}]
    default_value = Column(JSON, nullable=True)
    is_required = Column(Boolean, default=False)
    help_text = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    validation_rules = Column(JSON, default=dict) # min_length, max_length, min_val, max_val, regex
    conditional_rule = Column(JSON, nullable=True) # {"parent_key": "app_type", "operator": "in", "value": ["web", "fullstack"]}

    section = relationship("Section", back_populates="questions")
    responses = relationship("Response", back_populates="question")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    template_id = Column(String(36), ForeignKey("templates.id"), nullable=False)
    name = Column(String(255), nullable=False)
    raw_idea = Column(Text, nullable=True)
    objective = Column(Text, nullable=True)
    target_audience = Column(Text, nullable=True)
    status = Column(String(50), default="draft") # draft, in_progress, completed, archived
    mode = Column(String(50), default="beginner") # beginner, advanced
    depth = Column(String(50), default="basic") # basic, detailed, advanced
    completeness_score = Column(Float, default=0.0)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    template = relationship("Template", back_populates="projects")
    responses = relationship("Response", back_populates="project", cascade="all, delete-orphan")
    requirements = relationship("Requirement", back_populates="project", cascade="all, delete-orphan")
    assumptions = relationship("Assumption", back_populates="project", cascade="all, delete-orphan")
    unresolved_decisions = relationship("UnresolvedDecision", back_populates="project", cascade="all, delete-orphan")
    blueprints = relationship("Blueprint", back_populates="project", cascade="all, delete-orphan")
    export_jobs = relationship("ExportJob", back_populates="project", cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    question_id = Column(String(36), ForeignKey("questions.id"), nullable=True)
    question_key = Column(String(100), nullable=False, index=True)
    value = Column(JSON, nullable=True)
    is_confirmed = Column(Boolean, default=True)
    is_inferred = Column(Boolean, default=False)
    is_skipped = Column(Boolean, default=False)
    is_undecided = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="responses")
    question = relationship("Question", back_populates="responses")


class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Functional") # Business, Functional, Technical, UI/UX, Security, Reporting
    moscow_priority = Column(String(50), default="must_have") # must_have, should_have, could_have, future_consideration
    importance = Column(Integer, default=3) # 1-5 scale
    time_savings = Column(String(100), nullable=True) # e.g. "5 hrs/week"
    users_affected = Column(String(100), nullable=True) # e.g. "All Students"
    complexity = Column(String(50), default="Medium") # Low, Medium, High
    dependencies = Column(JSON, default=list) # list of requirement titles or IDs
    is_mvp = Column(Boolean, default=True)
    source = Column(String(50), default="user_confirmed") # user_confirmed, ai_inferred
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="requirements")


class Assumption(Base):
    __tablename__ = "assumptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    statement = Column(Text, nullable=False)
    category = Column(String(100), default="General")
    status = Column(String(50), default="pending_review") # pending_review, approved, rejected
    notes = Column(Text, nullable=True)

    project = relationship("Project", back_populates="assumptions")


class UnresolvedDecision(Base):
    __tablename__ = "unresolved_decisions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    topic = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    options = Column(JSON, default=list)
    impact = Column(String(50), default="Medium") # Low, Medium, High
    status = Column(String(50), default="open") # open, resolved

    project = relationship("Project", back_populates="unresolved_decisions")


class Blueprint(Base):
    __tablename__ = "blueprints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    version = Column(Integer, default=1)
    title = Column(String(255), nullable=False)
    content_json = Column(JSON, nullable=False) # Structured 23-point specification
    markdown_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="blueprints")


class ExportJob(Base):
    __tablename__ = "export_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    export_format = Column(String(20), nullable=False) # pdf, docx, md, json, csv
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, default=0)
    status = Column(String(50), default="completed") # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="export_jobs")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(36), nullable=True)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")


# ==========================================
# STAFF ACADEMIC WORKFLOW MODELS (6 MODULES)
# ==========================================

class AcademicQuestionPaper(Base):
    __tablename__ = "academic_question_papers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    institution_name = Column(String(255), default="Nandha Engineering College (Autonomous)")
    department = Column(String(100), default="Computer Science & Engineering")
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(255), nullable=False)
    exam_title = Column(String(100), default="Internal Assessment Examination")
    semester = Column(String(20), default="Semester IV")
    duration = Column(String(50), default="3 Hours")
    max_marks = Column(Integer, default=100)
    topic_or_syllabus = Column(Text, nullable=False)
    content_json = Column(JSON, nullable=False) # MCQs, Part A (2M), Part B (10M), Part C (15M)
    answer_key_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ExcelAutomationJob(Base):
    __tablename__ = "excel_automation_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    file_name = Column(String(255), nullable=False)
    total_records = Column(Integer, default=0)
    valid_records = Column(Integer, default=0)
    invalid_records = Column(Integer, default=0)
    summary_stats = Column(JSON, default=dict) # Averages, Highest, Lowest, Pass count
    processed_data = Column(JSON, default=list)
    output_excel_path = Column(String(500), nullable=True)
    output_pdf_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AcademicEvent(Base):
    __tablename__ = "academic_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    event_type = Column(String(100), default="Technical Symposium") # Workshop, Conference, Seminar, Symposium, Hackathon
    department = Column(String(100), default="CSE")
    event_date = Column(String(50), nullable=False)
    organizer_name = Column(String(255), default="Faculty Coordinator")
    signatory_title = Column(String(255), default="Principal & Head of Department")
    template_style = Column(String(50), default="classic_gold") # classic_gold, modern_blue, academic_emerald
    created_at = Column(DateTime, default=datetime.utcnow)

    certificates = relationship("ParticipantCertificate", back_populates="event", cascade="all, delete-orphan")


class ParticipantCertificate(Base):
    __tablename__ = "participant_certificates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("academic_events.id"), nullable=False)
    cert_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. NEC-CERT-2026-001
    student_name = Column(String(255), nullable=False)
    college_name = Column(String(255), default="Nandha Engineering College")
    department = Column(String(100), default="Computer Science & Engineering")
    position = Column(String(100), default="Participant") # First Prize, Second Prize, Participant, Paper Presenter
    pdf_path = Column(String(500), nullable=True)
    verify_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("AcademicEvent", back_populates="certificates")


class ResultAnalysisRecord(Base):
    __tablename__ = "result_analysis_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(255), nullable=False)
    faculty_name = Column(String(255), default="Staff Member")
    exam_name = Column(String(100), default="Unit Test 1 / Model Exam")
    total_students = Column(Integer, default=0)
    passed_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    pass_percentage = Column(Float, default=0.0)
    class_average = Column(Float, default=0.0)
    highest_mark = Column(Float, default=0.0)
    lowest_mark = Column(Float, default=0.0)
    arrears_students = Column(JSON, default=list) # [{'reg_no': '...', 'name': '...', 'marks': 32}]
    weak_topics = Column(JSON, default=list) # [{'topic': 'Dynamic Programming', 'avg_score': '35%'}]
    grade_distribution = Column(JSON, default=dict) # {'O': 10, 'A+': 15, 'A': 20, 'B+': 12, 'B': 5, 'U': 4}
    created_at = Column(DateTime, default=datetime.utcnow)


class LessonPlanItem(Base):
    __tablename__ = "lesson_plan_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department = Column(String(50), default="CSE")
    semester = Column(String(20), default="IV")
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(255), nullable=False)
    unit_number = Column(Integer, default=1)
    topic_name = Column(String(255), nullable=False)
    planned_hours = Column(Integer, default=2)
    actual_hours = Column(Integer, default=2)
    teaching_aid = Column(String(100), default="PPT & Black Board") # PPT, Black Board, Lab Demo, NPTEL
    status = Column(String(50), default="Completed") # Completed, In Progress, Pending
    completion_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class StaffTaskItem(Base):
    __tablename__ = "staff_task_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Exam Duty") # Exam Duty, Mark Entry, Lesson Plan, Mentoring, Event Coordination
    priority = Column(String(50), default="High") # High, Medium, Low
    deadline = Column(String(50), nullable=False)
    status = Column(String(50), default="Pending") # Pending, In Progress, Completed, Approved
    assigned_to = Column(String(255), default="Staff Member")
    created_at = Column(DateTime, default=datetime.utcnow)


class AcademicResourceItem(Base):
    __tablename__ = "academic_resource_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department = Column(String(50), default="CSE")
    semester = Column(String(20), default="IV")
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(255), nullable=False)
    unit_number = Column(String(20), default="Unit 1")
    resource_type = Column(String(50), default="Lecture Notes") # Lecture Notes, Syllabus PDF, Question Bank, Lab Manual, Academic Template
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_format = Column(String(20), default="PDF")
    file_size = Column(String(50), default="1.2 MB")
    created_at = Column(DateTime, default=datetime.utcnow)

