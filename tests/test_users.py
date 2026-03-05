import pytest
from app.core.security import get_password_hash

@pytest.mark.asyncio
async def test_create_user_public(client):
    response = await client.post(
        "/users",
        json={
            "name": "Public User",
            "email": "public@test.com",
            "password": "publicpassword",
            "role": "developer"
        }
    )
    assert response.status_code == 201
    assert response.json()["email"] == "public@test.com"
    assert "id" in response.json()

@pytest.mark.asyncio
async def test_create_user_as_developer_is_now_allowed(client, developer_user):
    # Authenticate as developer (though not required anymore for this endpoint)
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
    assert response.status_code == 201
    assert response.json()["email"] == "another@test.com"

@pytest.mark.asyncio
async def test_create_duplicate_user(client):
    # Create first user
    await client.post(
        "/users",
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
        json={
            "name": "Dup User 2",
            "email": "dup@test.com",
            "password": "password",
            "role": "developer"
        }
    )
    assert response.status_code == 409
