import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_and_root():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_list_templates():
    res = client.get("/api/v1/admin/templates")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3

def test_create_and_manage_project():
    # 1. Analyze Idea
    idea_payload = {"description": "Autonomous college exam question paper generator and bulk marks result analysis with pass percentage"}
    analysis_res = client.post("/api/v1/projects/analyze-idea", json=idea_payload)
    assert analysis_res.status_code == 200
    extracted = analysis_res.json()
    assert extracted["recommended_template_key"] == "academic_college"

    # 2. Create Project
    create_payload = {
        "name": "Nandha Exam & Result Portal",
        "raw_idea": idea_payload["description"],
        "template_id": "academic_college"
    }
    create_res = client.post("/api/v1/projects", json=create_payload)
    assert create_res.status_code == 200
    proj = create_res.json()
    project_id = proj["id"]
    assert proj["name"] == "Nandha Exam & Result Portal"

    # 3. Get Questionnaire State
    state_res = client.get(f"/api/v1/questions/state/{project_id}")
    assert state_res.status_code == 200
    state = state_res.json()
    assert len(state["sections"]) > 0

    # 4. Autosave response
    save_res = client.post(f"/api/v1/questions/autosave/{project_id}", json={
        "question_key": "institution_type",
        "value": "autonomous_college",
        "is_confirmed": True
    })
    assert save_res.status_code == 200
    updated_state = save_res.json()
    assert updated_state["answered_questions"] >= 1

    # 5. Generate Blueprint
    bp_res = client.post(f"/api/v1/blueprint/{project_id}/generate")
    assert bp_res.status_code == 200
    bp = bp_res.json()
    assert "executive_summary" in bp["content_json"]

    # 6. Real PDF Export
    export_res = client.post(f"/api/v1/blueprint/{project_id}/export", json={"export_format": "pdf"})
    assert export_res.status_code == 200
    export_job = export_res.json()
    assert export_job["export_format"] == "pdf"
    assert export_job["file_size"] > 0

    # 7. Download Export
    job_id = export_job["id"]
    download_res = client.get(f"/api/v1/blueprint/download/{job_id}")
    assert download_res.status_code == 200
    assert len(download_res.content) > 500
