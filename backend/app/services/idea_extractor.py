import re
from typing import Dict, Any, List
from app.schemas.project import IdeaAnalysisResponse

class IdeaExtractor:
    """
    Intelligent NLP and rule-based extractor that handles English and Tamil-English 
    transliterated project ideas, extracting core objectives, target users, modules, 
    and matching them to questionnaire answers without forcing manual repetition.
    """

    @staticmethod
    def analyze_idea(text: str) -> IdeaAnalysisResponse:
        text_lower = text.lower()

        # Detect project keywords (Tamil-English transliteration + English)
        is_academic = any(k in text_lower for k in [
            "college", "academic", "student", "faculty", "staff", "syllabus", 
            "marks", "question paper", "mcq", "exam", "certificate", "arrear",
            "department", "semester", "pasanga", "vathiyar", "mark sheet"
        ])
        
        is_mobile = any(k in text_lower for k in [
            "mobile", "android", "ios", "phone", "app store", "play store", "apk", "flutter", "react native"
        ])

        is_ai = any(k in text_lower for k in [
            "ai", "artificial intelligence", "gemini", "gpt", "llm", "automation", 
            "smart", "generate", "auto", "summarize", "bot"
        ])

        is_event = any(k in text_lower for k in [
            "event", "certificate", "symposium", "conference", "qr", "verification", "participant"
        ])

        is_results = any(k in text_lower for k in [
            "result", "analysis", "pass percentage", "excel", "sheet", "calculation", "charts"
        ])

        # Suggested modules
        modules: List[str] = []
        if is_academic or "exam" in text_lower or "question" in text_lower:
            modules.append("AI Academic Workspace (MCQs & Question Paper Generator)")
        if is_results or "excel" in text_lower or "marks" in text_lower:
            modules.append("Document & Excel Automation (Bulk Marks & Calculations)")
            modules.append("Result Analysis & Visual Insights")
        if is_event or "certificate" in text_lower:
            modules.append("Event & Bulk Certificate Management with QR Verification")
        if "staff" in text_lower or "task" in text_lower or "lesson" in text_lower:
            modules.append("Staff Work & Lesson Plan Management")
        if "syllabus" in text_lower or "notes" in text_lower or "resource" in text_lower:
            modules.append("Syllabus & Academic Resource Hub")

        if not modules:
            modules = ["Core User Dashboard", "Data Management & Excel Parsing", "Automated Report Exporting", "Role-based Access Control"]

        # Recommended template
        if is_academic:
            template_key = "academic_college"
            target_audience = "College Faculty, Academic Staff, and Students"
        elif is_mobile:
            template_key = "mobile_app"
            target_audience = "Mobile Smartphone Users"
        else:
            template_key = "web_saas"
            target_audience = "Internal Staff & Organizational Managers"

        # Objective & Problem synthesis
        objective = f"Build an automated, high-efficiency platform to streamline: {', '.join(modules[:3])}."
        core_problem = "Current manual or spreadsheet-based operations are fragmented, error-prone, and consume valuable hours each week."

        expected_outcomes = [
            "Eliminate manual repetitive clerical steps and data re-entry",
            "Generate standardized, validated outputs (PDFs, Word papers, Excel analytics) in seconds",
            "Maintain centralized audit records, verification trails, and institutional transparency"
        ]

        constraints = [
            "Must maintain strict role-based data privacy",
            "Must support easy export into printable PDF and editable Word formats"
        ]

        missing_info = []
        if "offline" not in text_lower and "internet" not in text_lower:
            missing_info.append("Offline or local LAN deployment requirements need confirmation.")
        if "auth" not in text_lower and "login" not in text_lower:
            missing_info.append("Authentication mechanism (Email/password vs Google SSO) not explicitly stated.")

        # Pre-fill extracted answers dictionary
        extracted_answers: Dict[str, Any] = {}
        if is_academic:
            extracted_answers["target_audience_type"] = "academic"
            extracted_answers["institution_type"] = "autonomous_college"
            
            selected_mods = []
            if "question" in text_lower or "exam" in text_lower or "mcq" in text_lower:
                selected_mods.append("ai_academic_workspace")
            if "excel" in text_lower or "mark" in text_lower or "upload" in text_lower:
                selected_mods.append("excel_automation")
            if "certificate" in text_lower or "event" in text_lower:
                selected_mods.append("event_certificates")
            if "result" in text_lower or "pass" in text_lower or "average" in text_lower:
                selected_mods.append("result_analysis")
            if "staff" in text_lower or "task" in text_lower:
                selected_mods.append("staff_work")
            if "syllabus" in text_lower or "resource" in text_lower:
                selected_mods.append("syllabus_hub")
            
            if not selected_mods:
                selected_mods = ["ai_academic_workspace", "excel_automation", "event_certificates", "result_analysis"]
            extracted_answers["selected_academic_modules"] = selected_mods

        if is_ai:
            extracted_answers["ai_integration_level"] = "core_ai"
        
        extracted_answers["export_formats_needed"] = ["pdf", "docx", "csv_excel"]

        # Derive project title
        words = text.strip().split()
        if len(words) <= 4:
            detected_name = text.strip().title()
        else:
            first_clause = re.split(r'[,.\n-]', text)[0].strip()
            detected_name = first_clause[:35].title() if len(first_clause) > 5 else "Smart Project Platform"

        return IdeaAnalysisResponse(
            detected_project_name=detected_name,
            objective=objective,
            target_audience=target_audience,
            core_problem=core_problem,
            expected_outcomes=expected_outcomes,
            suggested_modules=modules,
            recommended_template_key=template_key,
            detected_constraints=constraints,
            missing_critical_info=missing_info,
            extracted_answers=extracted_answers
        )
