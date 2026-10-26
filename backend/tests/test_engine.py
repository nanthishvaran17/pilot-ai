import pytest
from app.services.engine import QuestionnaireEngine
from app.services.idea_extractor import IdeaExtractor

def test_condition_evaluation():
    # Equals test
    rule_equals = {"parent_key": "app_type", "operator": "equals", "value": "web"}
    assert QuestionnaireEngine.evaluate_condition(rule_equals, {"app_type": "web"}) is True
    assert QuestionnaireEngine.evaluate_condition(rule_equals, {"app_type": "mobile"}) is False

    # In list test
    rule_in = {"parent_key": "role", "operator": "in", "value": ["admin", "superadmin"]}
    assert QuestionnaireEngine.evaluate_condition(rule_in, {"role": "admin"}) is True
    assert QuestionnaireEngine.evaluate_condition(rule_in, {"role": "guest"}) is False

    # Contains test
    rule_contains = {"parent_key": "modules", "operator": "contains", "value": "excel"}
    assert QuestionnaireEngine.evaluate_condition(rule_contains, {"modules": ["excel", "pdf"]}) is True
    assert QuestionnaireEngine.evaluate_condition(rule_contains, {"modules": ["chat"]}) is False

def test_contradiction_detection():
    # Contradiction: No AI chosen, but AI assessment module selected
    answers = {
        "ai_integration_level": "no_ai",
        "selected_academic_modules": ["ai_academic_workspace"]
    }
    conflicts = QuestionnaireEngine.detect_contradictions(answers)
    assert len(conflicts) > 0
    assert conflicts[0].id == "conflict_ai_mismatch"

def test_idea_extraction_academic_tamil_english():
    # Test natural language & Tamil-English transliteration
    text = "Nandha engineering college student marks upload panna automated pass percentage calculation and question paper generation venum"
    result = IdeaExtractor.analyze_idea(text)
    assert result.recommended_template_key == "academic_college"
    assert any("Question Paper" in m for m in result.suggested_modules)
    assert any("Marks" in m or "Excel" in m for m in result.suggested_modules)
