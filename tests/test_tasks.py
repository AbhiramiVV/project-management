import pytest
from app.models.task import TaskStatus

@pytest.mark.asyncio
async def test_create_task_as_admin(client, admin_user, developer_user):
    # Admin logs in
    login_res = await client.post("/auth/login", data={"username": "admin@test.com", "password": "password"})
    token = login_res.json()["access_token"]
    
    # Create project
    proj_res = await client.post("/projects", headers={"Authorization": f"Bearer {token}"}, json={"name": "Proj Task"})
    proj_id = proj_res.json()["id"]
    
    # Create task
    task_res = await client.post(
        "/tasks",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Initial Task",
            "description": "Do this",
            "project_id": proj_id,
            "assigned_to": str(developer_user.id)
        }
    )
    assert task_res.status_code == 201
    assert task_res.json()["title"] == "Initial Task"
    assert task_res.json()["assigned_to"] == str(developer_user.id)
    assert task_res.json()["status"] == TaskStatus.pending.value

@pytest.mark.asyncio
async def test_developer_update_task_status(client, admin_user, developer_user):
    # Admin creates task and assigns to dev
    admin_login = await client.post("/auth/login", data={"username": "admin@test.com", "password": "password"})
    admin_token = admin_login.json()["access_token"]
    
    proj_res = await client.post("/projects", headers={"Authorization": f"Bearer {admin_token}"}, json={"name": "Proj Dev Task"})
    proj_id = proj_res.json()["id"]
    
    task_res = await client.post(
        "/tasks",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Dev Task", "project_id": proj_id, "assigned_to": str(developer_user.id)}
    )
    task_id = task_res.json()["id"]

    # Developer updates status
    dev_login = await client.post("/auth/login", data={"username": "dev@test.com", "password": "password"})
    dev_token = dev_login.json()["access_token"]
    
    update_res = await client.put(
        f"/tasks/{task_id}/status",
        headers={"Authorization": f"Bearer {dev_token}"},
        json={"status": "in_progress"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "in_progress"

@pytest.mark.asyncio
async def test_developer_update_unassigned_task(client, admin_user, developer_user):
    # Admin creates unassigned task
    admin_login = await client.post("/auth/login", data={"username": "admin@test.com", "password": "password"})
    admin_token = admin_login.json()["access_token"]
    
    proj_res = await client.post("/projects", headers={"Authorization": f"Bearer {admin_token}"}, json={"name": "Proj Unassigned"})
    proj_id = proj_res.json()["id"]
    
    task_res = await client.post(
        "/tasks",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Unassigned Task", "project_id": proj_id}
    )
    task_id = task_res.json()["id"]

    # Developer tries to update status
    dev_login = await client.post("/auth/login", data={"username": "dev@test.com", "password": "password"})
    dev_token = dev_login.json()["access_token"]
    
    update_res = await client.put(
        f"/tasks/{task_id}/status",
        headers={"Authorization": f"Bearer {dev_token}"},
        json={"status": "in_progress"}
    )
    # Should be forbidden
    assert update_res.status_code == 403
