import pytest

@pytest.mark.asyncio
async def test_create_project_as_admin(client, admin_user):
    login_res = await client.post("/auth/login", data={"username": "admin@test.com", "password": "password"})
    token = login_res.json()["access_token"]
    
    response = await client.post(
        "/projects",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "New Project",
            "description": "Initial Setup Phase"
        }
    )
    assert response.status_code == 201
    assert response.json()["name"] == "New Project"
    assert response.json()["description"] == "Initial Setup Phase"
    assert "id" in response.json()

@pytest.mark.asyncio
async def test_create_project_as_developer(client, developer_user):
    login_res = await client.post("/auth/login", data={"username": "dev@test.com", "password": "password"})
    token = login_res.json()["access_token"]
    
    response = await client.post(
        "/projects",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Dev Project",
            "description": "Will not work"
        }
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_read_projects(client, developer_user, admin_user):
    # Admin creates a project
    admin_login = await client.post("/auth/login", data={"username": "admin@test.com", "password": "password"})
    admin_token = admin_login.json()["access_token"]
    
    await client.post("/projects", headers={"Authorization": f"Bearer {admin_token}"}, json={"name": "Proj 1"})
    
    # Dev reads projects
    dev_login = await client.post("/auth/login", data={"username": "dev@test.com", "password": "password"})
    dev_token = dev_login.json()["access_token"]
    
    response = await client.get("/projects", headers={"Authorization": f"Bearer {dev_token}"})
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert response.json()[0]["name"] == "Proj 1"
