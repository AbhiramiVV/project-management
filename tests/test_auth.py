import pytest

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

@pytest.mark.asyncio
async def test_login_success(client, admin_user):
    response = await client.post(
        "/auth/login",
        data={"username": "admin@test.com", "password": "password"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_failure(client, admin_user):
    response = await client.post(
        "/auth/login",
        data={"username": "admin@test.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
