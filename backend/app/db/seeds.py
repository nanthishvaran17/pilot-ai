from sqlalchemy.orm import Session
from app.db.models import User, Template, Section, Question
from app.core.security import hash_password

def seed_database(db: Session):
    # 1. Create Default Users if not exist
    admin_user = db.query(User).filter(User.email == "admin@projectpilot.ai").first()
    if not admin_user:
        admin_user = User(
            email="admin@projectpilot.ai",
            hashed_password=hash_password("admin123"),
            full_name="System Administrator",
            role="admin",
            is_active=True
        )
        db.add(admin_user)

    demo_user = db.query(User).filter(User.email == "demo@projectpilot.ai").first()
    if not demo_user:
        demo_user = User(
            email="demo@projectpilot.ai",
            hashed_password=hash_password("demo123"),
            full_name="Alex Rivera",
            role="user",
            is_active=True
        )
        db.add(demo_user)

    db.commit()

    # 2. Seed Templates if none exist
    if db.query(Template).count() > 0:
        return

    # ------------------ TEMPLATE 1: Comprehensive Web & SaaS App ------------------
    web_template = Template(
        key="web_saas",
        name="Web Application / SaaS Platform",
        description="Comprehensive architecture for modern web applications, client portals, and multi-tenant SaaS.",
        version="1.0.0",
        is_default=True
    )
    db.add(web_template)
    db.flush()

    # Sections for Web App
    s_goals = Section(
        template_id=web_template.id,
        key="project_goals",
        title="Project Goals & Scope",
        description="Core intent, success metrics, and high-level outcomes.",
        order_index=1,
        icon="Target",
        is_required=True
    )
    s_users = Section(
        template_id=web_template.id,
        key="target_users",
        title="Target Users & Roles",
        description="Who will use this platform and what privileges do they have?",
        order_index=2,
        icon="Users",
        is_required=True
    )
    s_features = Section(
        template_id=web_template.id,
        key="core_features",
        title="Core Features & Workflows",
        description="The primary capabilities, data operations, and interactions.",
        order_index=3,
        icon="Layers",
        is_required=True
    )
    s_ai = Section(
        template_id=web_template.id,
        key="ai_automation",
        title="AI & Automation Capabilities",
        description="Smart assistants, automated processing, OCR, or predictive insights.",
        order_index=4,
        icon="Cpu",
        is_required=False
    )
    s_tech = Section(
        template_id=web_template.id,
        key="technical_architecture",
        title="Technical Stack & Architecture",
        description="Frontend, backend, database, and infrastructure preferences.",
        order_index=5,
        icon="Server",
        is_required=False
    )
    s_security = Section(
        template_id=web_template.id,
        key="security_compliance",
        title="Security, Privacy & Data",
        description="Authentication, encryption, audit logs, and compliance.",
        order_index=6,
        icon="ShieldCheck",
        is_required=False
    )
    db.add_all([s_goals, s_users, s_features, s_ai, s_tech, s_security])
    db.flush()

    # Questions for Web App
    q_list = [
        # Goals
        Question(
            section_id=s_goals.id,
            key="primary_objective",
            label="What is the primary business problem this application solves?",
            explanation="Describe what users cannot do today or what is currently painful, manual, or slow.",
            question_type="long_text",
            is_required=True,
            order_index=1,
            help_text="Example: Manual tracking of student coursework leads to 10+ hours wasted each week on spreadsheets.",
            recommendation="Focus on the tangible time saved or friction eliminated."
        ),
        Question(
            section_id=s_goals.id,
            key="target_audience_type",
            label="Who is the primary audience?",
            explanation="Select the main group who will interact with the system daily.",
            question_type="single_choice",
            options=[
                {"label": "Internal Staff / Employees", "value": "internal_staff", "hint": "Back-office and operational workflows"},
                {"label": "Students / Academic Community", "value": "academic", "hint": "Colleges, faculties, and enrolled students"},
                {"label": "Consumers / General Public (B2C)", "value": "b2c", "hint": "Public registration and self-serve access"},
                {"label": "Business Clients (B2B)", "value": "b2b", "hint": "Organizations, company accounts, and multi-tenancy"}
            ],
            default_value="internal_staff",
            is_required=True,
            order_index=2
        ),
        Question(
            section_id=s_goals.id,
            key="delivery_timeline",
            label="What is your target launch horizon?",
            explanation="Helps calibrate the initial MVP scope vs phase 2 enhancements.",
            question_type="single_choice",
            options=[
                {"label": "Rapid MVP (2 - 4 weeks)", "value": "rapid_mvp", "hint": "Strict focus on core must-have features"},
                {"label": "Standard Release (1 - 3 months)", "value": "standard", "hint": "Full foundational feature set"},
                {"label": "Phased Enterprise Rollout (3+ months)", "value": "enterprise", "hint": "Multi-phase launch with deep audits"}
            ],
            default_value="rapid_mvp",
            is_required=False,
            order_index=3
        ),

        # Target Users
        Question(
            section_id=s_users.id,
            key="user_roles_list",
            label="Which user roles need distinct access levels?",
            explanation="Select all authorization tiers needed for your platform.",
            question_type="multiple_choice",
            options=[
                {"label": "Admin / Superuser", "value": "admin", "hint": "Full control, user management, audit trails"},
                {"label": "Staff / Department Manager", "value": "manager", "hint": "Operational approvals, content creation, reports"},
                {"label": "Standard Member / Student / User", "value": "standard_user", "hint": "Self-service viewing, submission, dashboard"},
                {"label": "External Auditor / Reviewer", "value": "guest_reviewer", "hint": "Read-only verification and grading"}
            ],
            default_value=["admin", "manager", "standard_user"],
            is_required=True,
            order_index=1
        ),
        Question(
            section_id=s_users.id,
            key="auth_methods",
            label="How should users sign in?",
            explanation="Authentication standard for user identification.",
            question_type="multiple_choice",
            options=[
                {"label": "Email & Secure Password", "value": "email_password", "hint": "Standard credentials with password reset"},
                {"label": "Single Sign-On (Google / Microsoft 365)", "value": "sso_oauth", "hint": "One-click institutional or enterprise login"},
                {"label": "Magic Link / OTP", "value": "magic_link", "hint": "Passwordless verification via email or phone"},
                {"label": "Two-Factor Authentication (2FA / TOTP)", "value": "mfa", "hint": "Extra layer of security for admins"}
            ],
            default_value=["email_password"],
            is_required=True,
            order_index=2
        ),

        # Features
        Question(
            section_id=s_features.id,
            key="data_management_needs",
            label="What data operations must users perform?",
            explanation="Pick the primary workflows required for records.",
            question_type="multiple_choice",
            options=[
                {"label": "Excel / CSV File Upload & Parsing", "value": "excel_import", "hint": "Bulk import data from spreadsheets"},
                {"label": "Automated Document / Report Generation (PDF/Word)", "value": "pdf_word_gen", "hint": "Download custom formatted letters, reports, or question papers"},
                {"label": "Form Submissions & Multi-level Approvals", "value": "approvals", "hint": "Staff review, accept/reject workflows"},
                {"label": "Interactive Analytics & Visual Charts", "value": "analytics_dashboards", "hint": "Summary metrics, KPIs, pass percentage, performance"},
                {"label": "Audit Logs & Activity History", "value": "audit_logs", "hint": "Track who changed what and when"}
            ],
            default_value=["excel_import", "pdf_word_gen", "analytics_dashboards"],
            is_required=True,
            order_index=1
        ),
        Question(
            section_id=s_features.id,
            key="export_formats_needed",
            label="Which report export formats are required?",
            explanation="Formats needed for stakeholder distribution or official archival.",
            question_type="multiple_choice",
            options=[
                {"label": "PDF Document (.pdf)", "value": "pdf", "hint": "Print-ready, fixed layout certificates or reports"},
                {"label": "Microsoft Word (.docx)", "value": "docx", "hint": "Editable notes, syllabus, question papers"},
                {"label": "Excel Spreadsheet (.xlsx / .csv)", "value": "csv_excel", "hint": "Raw data, marks analysis, tabular logs"},
                {"label": "JSON / REST API", "value": "json_api", "hint": "Integration with other external software"}
            ],
            default_value=["pdf", "docx", "csv_excel"],
            is_required=True,
            order_index=2
        ),

        # AI & Automation
        Question(
            section_id=s_ai.id,
            key="ai_integration_level",
            label="Do you want AI capabilities integrated into this product?",
            explanation="AI can summarize data, generate test questions, extract text from documents, or provide conversational answers.",
            question_type="single_choice",
            options=[
                {"label": "Yes - Core Generative AI features", "value": "core_ai", "hint": "AI writes questions, analyzes documents, automates tasks"},
                {"label": "Yes - Contextual Smart Assistance", "value": "smart_assistant", "hint": "Optional summarization, drafting, and insights"},
                {"label": "No - Deterministic / Traditional Code Only", "value": "no_ai", "hint": "Standard rule-based logic without AI models"}
            ],
            default_value="smart_assistant",
            is_required=True,
            order_index=1
        ),
        Question(
            section_id=s_ai.id,
            key="ai_use_cases",
            label="Which AI tasks are most valuable for your workflow?",
            explanation="Select AI modules to configure in the architectural blueprint.",
            question_type="multiple_choice",
            options=[
                {"label": "Academic & Assessment Generation (MCQs, Question Papers)", "value": "exam_generator", "hint": "Turn syllabus topics into questions with answer keys"},
                {"label": "Document Extraction & Auto-Summarization", "value": "doc_extraction", "hint": "Read uploaded PDFs or syllabus and summarize highlights"},
                {"label": "Data Outlier & Anomaly Detection", "value": "anomaly_detection", "hint": "Spot failing students, calculation errors, or data discrepancies"},
                {"label": "Chat / Conversational Assistant", "value": "chat_assistant", "hint": "Natural language Q&A over internal documentation"}
            ],
            default_value=["exam_generator", "doc_extraction"],
            is_required=False,
            order_index=2,
            conditional_rule={"parent_key": "ai_integration_level", "operator": "in", "value": ["core_ai", "smart_assistant"]}
        ),

        # Technical Architecture
        Question(
            section_id=s_tech.id,
            key="deployment_environment",
            label="Where will this application be deployed?",
            explanation="Select hosting preferences for infrastructure planning.",
            question_type="single_choice",
            options=[
                {"label": "Cloud Hosted (AWS / GCP / Azure / Vercel)", "value": "cloud", "hint": "Scalable managed cloud hosting"},
                {"label": "On-Premises / Local Institutional Server", "value": "on_prem", "hint": "Private network, internal college or company data center"},
                {"label": "Docker Containerized (Flexible Anywhere)", "value": "docker", "hint": "Portable Docker containers ready for any host"},
                {"label": "Not sure yet - Recommend best practice", "value": "undecided", "hint": "AI will recommend standard modern hosting"}
            ],
            default_value="docker",
            is_required=False,
            order_index=1,
            recommendation="Docker containerization provides maximum portability across cloud and local servers."
        ),
        Question(
            section_id=s_tech.id,
            key="offline_access_need",
            label="Is offline or local network capability required?",
            explanation="Whether the system must operate without continuous internet connectivity.",
            question_type="single_choice",
            options=[
                {"label": "Web-Only (Continuous Internet is fine)", "value": "online_only", "hint": "Standard cloud web application"},
                {"label": "Local LAN Capable (Works on local Wi-Fi without internet)", "value": "local_lan", "hint": "Intranet deployment inside college/office"}
            ],
            default_value="online_only",
            is_required=False,
            order_index=2
        ),

        # Security
        Question(
            section_id=s_security.id,
            key="sensitive_data_types",
            label="What types of sensitive information will be handled?",
            explanation="Guides database encryption, retention rules, and role-based masking.",
            question_type="multiple_choice",
            options=[
                {"label": "Student Academic Records & Marks", "value": "academic_marks", "hint": "Requires grade privacy and strict role permissions"},
                {"label": "Staff Personal / Contact Details", "value": "staff_pii", "hint": "Confidential contact information"},
                {"label": "Financial / Fee Transaction Data", "value": "financial_data", "hint": "Payment logs and financial transactions"},
                {"label": "No Highly Sensitive Information", "value": "general_info", "hint": "Public syllabus, general event registrations"}
            ],
            default_value=["academic_marks", "staff_pii"],
            is_required=False,
            order_index=1
        )
    ]
    db.add_all(q_list)

    # ------------------ TEMPLATE 2: Academic & College Automation Platform ------------------
    edu_template = Template(
        key="academic_college",
        name="Academic, Faculty & College Automation Platform",
        description="Specifically customized for colleges and universities: Question papers, Result analysis, Certificate generation, Syllabus hub, and Staff workflows.",
        version="1.0.0",
        is_default=False
    )
    db.add(edu_template)
    db.flush()

    e_s1 = Section(template_id=edu_template.id, key="institution_profile", title="Institution & Department Scope", description="College details, departments, and academic regulation standards.", order_index=1, icon="BookOpen")
    e_s2 = Section(template_id=edu_template.id, key="academic_workflows", title="Academic Workflows & Modules", description="Select key educational workflows to implement.", order_index=2, icon="GraduationCap")
    e_s3 = Section(template_id=edu_template.id, key="assessment_rules", title="Question Bank & Exam Rules", description="Bloom's taxonomy, question types, and syllabus mapping.", order_index=3, icon="FileText")
    e_s4 = Section(template_id=edu_template.id, key="results_certificates", title="Results, Certificates & Exports", description="Mark sheets, pass percentage analysis, bulk certificate generation.", order_index=4, icon="Award")
    db.add_all([e_s1, e_s2, e_s3, e_s4])
    db.flush()

    edu_q = [
        Question(
            section_id=e_s1.id,
            key="institution_type",
            label="What type of institution is this for?",
            explanation="Select the educational tier to tailor course and semester structures.",
            question_type="single_choice",
            options=[
                {"label": "Autonomous Engineering / Arts College", "value": "autonomous_college", "hint": "Semester pattern with internal/external regulations"},
                {"label": "University Department / Affiliated College", "value": "university_affiliated", "hint": "Strict university syllabus alignment"},
                {"label": "School / Training Institute", "value": "school_training", "hint": "Term-based assessments"}
            ],
            default_value="autonomous_college",
            is_required=True,
            order_index=1
        ),
        Question(
            section_id=e_s2.id,
            key="selected_academic_modules",
            label="Which academic workflows must be included in Phase 1?",
            explanation="Choose the modules directly needed by your faculty and staff.",
            question_type="multiple_choice",
            options=[
                {"label": "AI Academic Workspace (MCQs, 2/10/15 marks, Question Paper export)", "value": "ai_academic_workspace", "hint": "Generates complete formatted question papers and answer keys"},
                {"label": "Document & Excel Automation (Bulk marks, calculation & validation)", "value": "excel_automation", "hint": "Automated data extraction and report generation"},
                {"label": "Event & Certificate Management (QR-verified bulk certificates)", "value": "event_certificates", "hint": "Bulk PDF certificate generation with verify links"},
                {"label": "Result Analysis (Pass %, averages, weak topic charts)", "value": "result_analysis", "hint": "Visual failure/pass trends and arrear tracking"},
                {"label": "Staff Work & Task Management (Lesson plans, deadlines, approvals)", "value": "staff_work", "hint": "Workload tracking, calendar, and staff history"},
                {"label": "Syllabus & Resource Hub (Department/Subject/Unit notes repository)", "value": "syllabus_hub", "hint": "Central digital repository for academic templates"}
            ],
            default_value=["ai_academic_workspace", "excel_automation", "event_certificates", "result_analysis"],
            is_required=True,
            order_index=1
        ),
        Question(
            section_id=e_s3.id,
            key="blooms_taxonomy_required",
            label="Do question papers require Bloom's Taxonomy & Course Outcomes (CO/PO)?",
            explanation="Autonomous colleges usually require Bloom's levels (K1 - K6) mapped to each question.",
            question_type="single_choice",
            options=[
                {"label": "Yes - Full Bloom's Taxonomy & CO/PO Mapping", "value": "full_blooms", "hint": "Includes K-levels (Remembering, Understanding, Applying, etc.)"},
                {"label": "Simple Format (Marks only, without formal CO/PO)", "value": "simple_marks", "hint": "Standard Section A, B, C questions"}
            ],
            default_value="full_blooms",
            is_required=False,
            order_index=1,
            conditional_rule={"parent_key": "selected_academic_modules", "operator": "contains", "value": "ai_academic_workspace"}
        ),
        Question(
            section_id=e_s4.id,
            key="certificate_verification_method",
            label="How should issued event certificates be verified?",
            explanation="Anti-forgery and validation mechanism for student certificates.",
            question_type="single_choice",
            options=[
                {"label": "QR Code with Web Verification Page", "value": "qr_web", "hint": "Anyone scanning the QR sees authenticated student record"},
                {"label": "Digital Signature / Watermark", "value": "watermark", "hint": "Cryptographic checksum stamped on PDF"},
                {"label": "No Online Verification Needed", "value": "none", "hint": "Standard PDF download only"}
            ],
            default_value="qr_web",
            is_required=False,
            order_index=1,
            conditional_rule={"parent_key": "selected_academic_modules", "operator": "contains", "value": "event_certificates"}
        )
    ]
    db.add_all(edu_q)

    # ------------------ TEMPLATE 3: Mobile Application ------------------
    mob_template = Template(
        key="mobile_app",
        name="Mobile Application (iOS & Android)",
        description="Native and cross-platform mobile specifications: offline sync, push notifications, camera/GPS permissions, app store delivery.",
        version="1.0.0",
        is_default=False
    )
    db.add(mob_template)
    db.flush()

    m_s1 = Section(template_id=mob_template.id, key="mobile_scope", title="Platform & Hardware Requirements", description="Operating systems, hardware access, and offline expectations.", order_index=1, icon="Smartphone")
    db.add(m_s1)
    db.flush()

    m_q = [
        Question(
            section_id=m_s1.id,
            key="mobile_platforms",
            label="Which mobile operating systems must be supported?",
            explanation="Guides whether React Native, Flutter, or PWA is optimal.",
            question_type="multiple_choice",
            options=[
                {"label": "Android (Google Play)", "value": "android", "hint": "Widespread device compatibility"},
                {"label": "iOS (Apple App Store)", "value": "ios", "hint": "iPhone and iPad support"},
                {"label": "Progressive Web App (PWA)", "value": "pwa", "hint": "Installable web app without app store review"}
            ],
            default_value=["android"],
            is_required=True,
            order_index=1
        ),
        Question(
            section_id=m_s1.id,
            key="mobile_hardware_features",
            label="Which device hardware capabilities are required?",
            explanation="Permissions and native device integrations.",
            question_type="multiple_choice",
            options=[
                {"label": "Camera / Barcode & QR Scanner", "value": "camera", "hint": "Scanning student IDs or certificates"},
                {"label": "Push Notifications", "value": "push_notifications", "hint": "Immediate alerts for deadlines or results"},
                {"label": "Offline Local Storage & Auto-Sync", "value": "offline_sync", "hint": "Record marks or notes offline and sync when connected"},
                {"label": "GPS / Location Tracking", "value": "gps", "hint": "Geo-fenced event attendance"}
            ],
            default_value=["camera", "push_notifications"],
            is_required=False,
            order_index=2
        )
    ]
    db.add_all(m_q)

    db.commit()
