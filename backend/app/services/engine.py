from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from app.db.models import Project, Question, Response, Section, Requirement
from app.schemas.questionnaire import (
    QuestionOut, SectionOut, QuestionnaireStateOut, 
    ContradictionItem, MissingRequirementItem
)

class QuestionnaireEngine:
    @staticmethod
    def evaluate_condition(rule: Dict[str, Any], answers: Dict[str, Any]) -> bool:
        """
        Evaluates a conditional visibility rule against current answers dictionary.
        """
        if not rule or not isinstance(rule, dict):
            return True

        parent_key = rule.get("parent_key")
        operator = rule.get("operator", "equals")
        expected = rule.get("value")

        if not parent_key:
            return True

        actual = answers.get(parent_key)

        if operator == "equals":
            return actual == expected
        elif operator == "not_equals":
            return actual != expected
        elif operator == "in":
            if isinstance(expected, list):
                return actual in expected
            return False
        elif operator == "contains":
            if isinstance(actual, list):
                return expected in actual
            if isinstance(actual, str) and isinstance(expected, str):
                return expected.lower() in actual.lower()
            return False
        elif operator == "is_not_empty":
            return bool(actual)
        elif operator == "is_empty":
            return not bool(actual)

        return True

    @staticmethod
    def get_project_answers(project_id: str, db: Session) -> Dict[str, Response]:
        responses = db.query(Response).filter(Response.project_id == project_id).all()
        return {r.question_key: r for r in responses}

    @classmethod
    def compute_state(cls, project: Project, db: Session) -> QuestionnaireStateOut:
        """
        Computes dynamic question tree, visibility, completeness score, 
        contradiction detection, and missing requirements.
        """
        resp_map = cls.get_project_answers(project.id, db)
        raw_answers = {k: v.value for k, v in resp_map.items() if not v.is_skipped}

        sections_out: List[SectionOut] = []
        total_questions = 0
        visible_questions = 0
        answered_questions = 0
        required_total = 0
        required_answered = 0

        # Retrieve template sections
        sections = (
            db.query(Section)
            .filter(Section.template_id == project.template_id)
            .order_by(Section.order_index)
            .all()
        )

        for sec in sections:
            q_out_list: List[QuestionOut] = []
            sec_answered = 0
            sec_required = 0

            questions = (
                db.query(Question)
                .filter(Question.section_id == sec.id)
                .order_by(Question.order_index)
                .all()
            )

            for q in questions:
                total_questions += 1
                is_vis = cls.evaluate_condition(q.conditional_rule, raw_answers)
                
                resp = resp_map.get(q.key)
                curr_val = resp.value if resp else q.default_value
                is_confirmed = resp.is_confirmed if resp else False
                is_inferred = resp.is_inferred if resp else False
                is_skipped = resp.is_skipped if resp else False
                is_undecided = resp.is_undecided if resp else False

                if is_vis:
                    visible_questions += 1
                    if q.is_required:
                        required_total += 1
                        sec_required += 1

                    has_value = (resp is not None and not is_skipped and not is_undecided and resp.value not in [None, "", []])
                    if has_value:
                        answered_questions += 1
                        sec_answered += 1
                        if q.is_required:
                            required_answered += 1

                q_out = QuestionOut(
                    id=q.id,
                    section_id=q.section_id,
                    key=q.key,
                    label=q.label,
                    explanation=q.explanation,
                    question_type=q.question_type,
                    options=q.options or [],
                    default_value=q.default_value,
                    is_required=q.is_required,
                    help_text=q.help_text,
                    recommendation=q.recommendation,
                    order_index=q.order_index,
                    validation_rules=q.validation_rules or {},
                    conditional_rule=q.conditional_rule,
                    is_visible=is_vis,
                    current_response=curr_val,
                    is_confirmed=is_confirmed,
                    is_inferred=is_inferred,
                    is_skipped=is_skipped,
                    is_undecided=is_undecided
                )
                q_out_list.append(q_out)

            sec_completed = (sec_required > 0 and sec_answered >= sec_required) or (sec_required == 0 and sec_answered > 0)
            sections_out.append(
                SectionOut(
                    id=sec.id,
                    key=sec.key,
                    title=sec.title,
                    description=sec.description,
                    order_index=sec.order_index,
                    icon=sec.icon,
                    is_required=sec.is_required,
                    questions=q_out_list,
                    is_completed=sec_completed,
                    answered_count=sec_answered,
                    required_count=sec_required
                )
            )

        # Completeness calculation weighted by required questions
        if required_total > 0:
            score = round((required_answered / required_total) * 100.0, 1)
        elif visible_questions > 0:
            score = round((answered_questions / visible_questions) * 100.0, 1)
        else:
            score = 0.0

        project.completeness_score = score
        db.add(project)
        db.commit()

        # Run contradiction & missing requirement checks
        contradictions = cls.detect_contradictions(raw_answers)
        missing_requirements = cls.detect_missing_requirements(raw_answers, sections_out)

        return QuestionnaireStateOut(
            project_id=project.id,
            project_name=project.name,
            mode=project.mode,
            depth=project.depth,
            completeness_score=score,
            sections=sections_out,
            total_questions=total_questions,
            visible_questions=visible_questions,
            answered_questions=answered_questions,
            contradictions=contradictions,
            missing_requirements=missing_requirements
        )

    @staticmethod
    def detect_contradictions(answers: Dict[str, Any]) -> List[ContradictionItem]:
        conflicts: List[ContradictionItem] = []

        # 1. AI Conflict: "No AI" selected but AI Academic Workspace or AI features requested
        ai_level = answers.get("ai_integration_level")
        acad_modules = answers.get("selected_academic_modules") or []
        ai_use_cases = answers.get("ai_use_cases") or []

        if ai_level == "no_ai" and ("ai_academic_workspace" in acad_modules or len(ai_use_cases) > 0):
            conflicts.append(
                ContradictionItem(
                    id="conflict_ai_mismatch",
                    severity="conflict",
                    title="AI Capability Conflict",
                    description="You selected 'No AI / Deterministic Code Only', but also selected AI Assessment / Academic Workspace modules.",
                    conflicting_keys=["ai_integration_level", "selected_academic_modules"],
                    suggested_resolution="Switch AI Integration Level to 'Smart Assistant' or remove AI modules from the academic scope."
                )
            )

        # 2. Connectivity Conflict: Online only vs Offline sync
        offline_need = answers.get("offline_access_need")
        mobile_features = answers.get("mobile_hardware_features") or []
        if offline_need == "online_only" and "offline_sync" in mobile_features:
            conflicts.append(
                ContradictionItem(
                    id="conflict_connectivity",
                    severity="warning",
                    title="Offline Sync Discrepancy",
                    description="Your system deployment is marked as 'Web-Only / Continuous Internet', but mobile hardware features include 'Offline Local Storage & Auto-Sync'.",
                    conflicting_keys=["offline_access_need", "mobile_hardware_features"],
                    suggested_resolution="Enable Local LAN / Offline synchronization architecture or disable offline mobile sync."
                )
            )

        # 3. Security vs Sensitive Data Conflict
        sensitive_data = answers.get("sensitive_data_types") or []
        auth_methods = answers.get("auth_methods") or []
        if ("academic_marks" in sensitive_data or "financial_data" in sensitive_data) and not auth_methods:
            conflicts.append(
                ContradictionItem(
                    id="conflict_sensitive_no_auth",
                    severity="conflict",
                    title="Missing Authentication for Sensitive Data",
                    description="Handling student marks or financial data without configuring user authentication creates critical security and compliance vulnerabilities.",
                    conflicting_keys=["sensitive_data_types", "auth_methods"],
                    suggested_resolution="Add Email & Password or Institutional Single Sign-On (SSO) authentication."
                )
            )

        return conflicts

    @staticmethod
    def detect_missing_requirements(answers: Dict[str, Any], sections: List[SectionOut]) -> List[MissingRequirementItem]:
        missing: List[MissingRequirementItem] = []

        if not answers.get("target_audience_type") and not answers.get("institution_type"):
            missing.append(
                MissingRequirementItem(
                    id="missing_audience",
                    category="Audience & Users",
                    label="Primary User Audience Not Confirmed",
                    importance="critical",
                    reason="Developer team cannot accurately design user experience or authorization hierarchies without a confirmed target audience.",
                    quick_fix_question_key="target_audience_type"
                )
            )

        if not answers.get("export_formats_needed"):
            missing.append(
                MissingRequirementItem(
                    id="missing_export_formats",
                    category="Output Specifications",
                    label="Report / Document Export Formats Unspecified",
                    importance="recommended",
                    reason="Document generation (Word, PDF, Excel) requires specific server-side rendering libraries to be scoped.",
                    quick_fix_question_key="export_formats_needed"
                )
            )

        if not answers.get("deployment_environment"):
            missing.append(
                MissingRequirementItem(
                    id="missing_deployment",
                    category="Infrastructure",
                    label="Deployment Strategy Undefined",
                    importance="recommended",
                    reason="Specifying Docker vs Cloud vs On-Premises impacts devops pipeline and network security rules.",
                    quick_fix_question_key="deployment_environment"
                )
            )

        return missing
