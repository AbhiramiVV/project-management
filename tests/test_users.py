import pytest
from app.core.security import get_password_hash

@pytest.mark.asyncio
async def test_create_user_as_admin(client, admin_user):
    # Authenticate as admin
    login_res = await client.post("/auth/login", data={"username": "admin@test.com", "password": "password"})
    token = login_res.json()["access_token"]
    
    response = await client.post(
        "/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "New User",
            "email": "newuser@test.com",
            "password": "newpassword",
            "role": "developer"
        }
    )
    assert response.status_code == 201
    assert response.json()["email"] == "newuser@test.com"
    assert response.json()["role"] == "developer"
    assert "id" in response.json()

@pytest.mark.asyncio
async def test_create_user_as_developer(client, developer_user):
    # Authenticate as developer
    login_res = await client.post("/auth/login", data={"username": "dev@test.com", "password": "password"})
    token = login_res.json()["access_token"]
    
    response = await client.post(
        "/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Another User",
            "email": "another@test.com",
            "password": "password123",
            "role": "developer"
        }
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_create_duplicate_user(client, admin_user):
    login_res = await client.post("/auth/login", data={"username": "admin@test.com", "password": "password"})
    token = login_res.json()["access_token"]
    
    # Create first user
    await client.post(
        "/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Dup User",
            "email": "dup@test.com",
            "password": "password",
            "role": "developer"
        }
    )
    
    # Try to recreate
    response = await client.post(
        "/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Dup User 2",
            "email": "dup@test.com",
            "password": "password",
            "role": "developer"
        }
    )
    assert response.status_code == 409
