"""Backend API tests for Cosmic Bites catering app."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://cosmic-events-6.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@cosmicbites.com"
ADMIN_PASSWORD = "Admin@123"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def customer(s):
    """Register a unique test customer."""
    email = f"test_{uuid.uuid4().hex[:8]}@cosmicbites.com"
    r = s.post(f"{API}/auth/register", json={
        "name": "TEST User",
        "email": email,
        "phone": "+919900001111",
        "password": "Test@123",
    })
    assert r.status_code == 200, f"register failed: {r.text}"
    data = r.json()
    return {"email": email, "token": data["access_token"], "user": data["user"]}


# ---------- Health ----------
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---------- Auth ----------
class TestAuth:
    def test_admin_login(self, s):
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        body = r.json()
        assert "access_token" in body
        assert body["user"]["role"] == "admin"
        assert body["user"]["email"] == ADMIN_EMAIL

    def test_login_invalid(self, s):
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_register_and_duplicate(self, s):
        email = f"dup_{uuid.uuid4().hex[:6]}@cosmicbites.com"
        r1 = s.post(f"{API}/auth/register", json={
            "name": "TEST Dup", "email": email, "password": "Test@123",
        })
        assert r1.status_code == 200
        assert r1.json()["user"]["email"] == email
        # duplicate
        r2 = s.post(f"{API}/auth/register", json={
            "name": "TEST Dup", "email": email, "password": "Test@123",
        })
        assert r2.status_code == 400

    def test_me_with_token(self, s, customer):
        r = s.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {customer['token']}"})
        assert r.status_code == 200
        assert r.json()["email"] == customer["email"]

    def test_me_without_token(self, s):
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_update_profile(self, s, customer):
        h = {"Authorization": f"Bearer {customer['token']}"}
        payload = {
            "name": "TEST Updated",
            "phone": "+919900002222",
            "dob": "1995-05-15",
            "anniversary": "2020-12-01",
            "address": "Bandra, Mumbai",
        }
        r = s.put(f"{API}/auth/profile", json=payload, headers=h)
        assert r.status_code == 200
        # verify via GET
        r2 = s.get(f"{API}/auth/me", headers=h)
        body = r2.json()
        assert body["name"] == "TEST Updated"
        assert body["phone"] == "+919900002222"
        assert body["dob"] == "1995-05-15"
        assert body["anniversary"] == "2020-12-01"
        assert body["address"] == "Bandra, Mumbai"


# ---------- Catalog ----------
class TestCatalog:
    def test_event_categories(self, s):
        r = s.get(f"{API}/event-categories")
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 6
        names = [i["name"] for i in items]
        assert "Birthday" in names and "Corporate" in names

    def test_services(self, s):
        r = s.get(f"{API}/services")
        assert r.status_code == 200
        assert len(r.json()) >= 8

    def test_menu_all(self, s):
        r = s.get(f"{API}/menu")
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 20
        cats = {i["category"] for i in items}
        # at least 10 cuisines
        assert len(cats) >= 9

    def test_menu_filter(self, s):
        r = s.get(f"{API}/menu", params={"category": "Chinese"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 1
        assert all(i["category"] == "Chinese" for i in items)

    def test_portfolio(self, s):
        r = s.get(f"{API}/portfolio")
        assert r.status_code == 200
        assert len(r.json()) >= 8

    def test_portfolio_filter(self, s):
        r = s.get(f"{API}/portfolio", params={"event_type": "corporate"})
        assert r.status_code == 200
        items = r.json()
        assert all(i["event_type"] == "corporate" for i in items)
        assert len(items) >= 1

    def test_testimonials(self, s):
        r = s.get(f"{API}/testimonials")
        assert r.status_code == 200
        assert len(r.json()) >= 5

    def test_corporate_clients(self, s):
        r = s.get(f"{API}/corporate-clients")
        assert r.status_code == 200
        assert len(r.json()) >= 3


# ---------- Quotes ----------
class TestQuotes:
    payload = {
        "event_type": "birthday",
        "guest_count": 50,
        "event_date": "2026-03-15",
        "location": "Mumbai",
        "cuisines": ["north_indian", "chinese"],
        "services": ["full_catering", "live_counters"],
        "live_counters": ["chaat", "pasta"],
        "needs_staff": True,
        "needs_decor": False,
        "notes": "TEST quote",
    }

    def test_estimate_no_auth(self, s):
        r = s.post(f"{API}/quotes/estimate", json=self.payload)
        assert r.status_code == 200
        body = r.json()
        assert "per_plate" in body and "total" in body
        assert body["per_plate"] > 0
        assert body["total"] == body["per_plate"] * 50 + max(50 * 25, 1500)

    def test_create_quote_no_auth(self, s):
        r = s.post(f"{API}/quotes", json=self.payload)
        assert r.status_code == 401

    def test_create_quote_with_auth_and_my(self, s, customer):
        h = {"Authorization": f"Bearer {customer['token']}"}
        r = s.post(f"{API}/quotes", json=self.payload, headers=h)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["estimated_total"] > 0
        assert body["user_email"] == customer["email"]
        assert body["status"] == "pending"
        qid = body["id"]
        # listing
        r2 = s.get(f"{API}/quotes/my", headers=h)
        assert r2.status_code == 200
        ids = [q["id"] for q in r2.json()]
        assert qid in ids

    def test_my_quotes_requires_auth(self, s):
        r = s.get(f"{API}/quotes/my")
        assert r.status_code == 401
