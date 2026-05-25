"""Iteration 2 backend tests: admin role-gated endpoints + public inquiries / public quotes."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@cosmicbites.com"
ADMIN_PASSWORD = "Admin@123"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="module")
def admin_token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def admin_h(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="module")
def customer(s):
    email = f"test_cust_{uuid.uuid4().hex[:8]}@cosmicbites.com"
    r = s.post(f"{API}/auth/register", json={
        "name": "TEST Cust", "email": email, "phone": "+919900003333", "password": "Test@123",
    })
    assert r.status_code == 200
    return r.json()


@pytest.fixture(scope="module")
def cust_h(customer):
    return {"Authorization": f"Bearer {customer['access_token']}"}


# -------- Public Inquiries --------
class TestPublicInquiries:
    def test_post_inquiry_no_auth(self, s):
        r = s.post(f"{API}/inquiries", json={
            "name": "TEST Inquirer",
            "email": f"test_inq_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "+919800000000",
            "subject": "Birthday catering",
            "message": "Need quote for 100 pax birthday on 2026-04-12 in Mumbai.",
        })
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["status"] == "new"
        assert body["id"]
        assert body["reply"] is None
        TestPublicInquiries.inq_id = body["id"]

    def test_inquiry_persisted_visible_to_admin(self, s, admin_h):
        r = s.get(f"{API}/admin/inquiries", headers=admin_h)
        assert r.status_code == 200
        ids = [i["id"] for i in r.json()]
        assert TestPublicInquiries.inq_id in ids


# -------- Public Quote --------
class TestPublicQuote:
    base = {
        "event_type": "birthday",
        "guest_count": 60,
        "event_date": "2026-05-20",
        "location": "Pune",
        "cuisines": ["north_indian", "chinese"],
        "services": ["full_catering"],
        "live_counters": ["chaat"],
        "needs_staff": True,
        "needs_decor": False,
        "notes": "TEST public quote",
    }

    def test_estimate_no_auth(self, s):
        r = s.post(f"{API}/quotes/estimate", json=self.base)
        assert r.status_code == 200
        body = r.json()
        assert body["per_plate"] > 0
        assert body["total"] == body["per_plate"] * 60 + max(60 * 25, 1500)

    def test_public_quote_no_auth(self, s):
        payload = dict(self.base)
        payload.update({
            "contact_name": "TEST Guest",
            "contact_email": f"test_guest_{uuid.uuid4().hex[:6]}@example.com",
            "contact_phone": "+919800000001",
        })
        r = s.post(f"{API}/quotes/public", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["user_id"] == "guest"
        assert body["estimated_total"] > 0
        assert body["estimated_per_plate"] > 0
        assert body["status"] == "pending"
        assert body["user_email"] == payload["contact_email"].lower()
        TestPublicQuote.qid = body["id"]

    def test_public_quote_visible_to_admin(self, s, admin_h):
        r = s.get(f"{API}/admin/quotes", headers=admin_h)
        assert r.status_code == 200
        ids = [q["id"] for q in r.json()]
        assert TestPublicQuote.qid in ids


# -------- Admin Auth Gating --------
class TestAdminGating:
    endpoints = [
        ("GET", "/admin/stats"),
        ("GET", "/admin/quotes"),
        ("GET", "/admin/inquiries"),
    ]

    def test_no_token_401(self, s):
        for m, ep in self.endpoints:
            r = s.request(m, f"{API}{ep}")
            assert r.status_code == 401, f"{ep} expected 401 got {r.status_code}"

    def test_customer_403(self, s, cust_h):
        for m, ep in self.endpoints:
            r = s.request(m, f"{API}{ep}", headers=cust_h)
            assert r.status_code == 403, f"{ep} expected 403 got {r.status_code}"


# -------- Admin Stats --------
class TestAdminStats:
    def test_stats(self, s, admin_h):
        r = s.get(f"{API}/admin/stats", headers=admin_h)
        assert r.status_code == 200
        body = r.json()
        for key in ["total_quotes", "pending_quotes", "customers", "menu_items",
                    "portfolio_items", "new_inquiries", "total_pipeline_value"]:
            assert key in body, f"missing key {key}"
            assert isinstance(body[key], int)
        assert body["menu_items"] >= 20
        assert body["portfolio_items"] >= 8


# -------- Admin Quotes management --------
class TestAdminQuotes:
    def test_status_update_and_delete(self, s, admin_h):
        # create a public quote first
        payload = {
            "event_type": "corporate", "guest_count": 30, "event_date": "2026-06-01",
            "location": "Mumbai", "cuisines": ["north_indian"], "services": [],
            "live_counters": [], "needs_staff": False, "needs_decor": False, "notes": "TEST",
            "contact_name": "TEST Q", "contact_email": f"q_{uuid.uuid4().hex[:6]}@e.com",
        }
        r = s.post(f"{API}/quotes/public", json=payload)
        qid = r.json()["id"]
        # update status
        r2 = s.put(f"{API}/admin/quotes/{qid}", headers=admin_h, json={"status": "contacted"})
        assert r2.status_code == 200
        assert r2.json()["status"] == "contacted"
        # verify via GET
        r3 = s.get(f"{API}/admin/quotes", headers=admin_h)
        match = [q for q in r3.json() if q["id"] == qid]
        assert match and match[0]["status"] == "contacted"
        # delete
        r4 = s.delete(f"{API}/admin/quotes/{qid}", headers=admin_h)
        assert r4.status_code == 200
        # verify gone
        r5 = s.get(f"{API}/admin/quotes", headers=admin_h)
        assert qid not in [q["id"] for q in r5.json()]


# -------- Admin Inquiries management --------
class TestAdminInquiries:
    def test_reply_and_delete(self, s, admin_h):
        # create inquiry
        r = s.post(f"{API}/inquiries", json={
            "name": "TEST Reply", "email": f"r_{uuid.uuid4().hex[:6]}@e.com",
            "subject": "Test", "message": "TEST"
        })
        iid = r.json()["id"]
        # reply + change status
        r2 = s.put(f"{API}/admin/inquiries/{iid}", headers=admin_h,
                   json={"reply": "Thanks, we will reach out.", "status": "replied"})
        assert r2.status_code == 200
        body = r2.json()
        assert body["reply"] == "Thanks, we will reach out."
        assert body["status"] == "replied"
        # delete
        r3 = s.delete(f"{API}/admin/inquiries/{iid}", headers=admin_h)
        assert r3.status_code == 200


# -------- Admin CRUD generic --------
class TestAdminCRUD:
    def test_menu_crud(self, s, admin_h):
        create = {"name": "TEST Dish", "category": "TEST Cat", "description": "TEST",
                  "price_min": 100, "price_max": 200, "spice_level": 1,
                  "is_jain": True, "is_live_counter": False, "image": None}
        r = s.post(f"{API}/admin/menu", headers=admin_h, json=create)
        assert r.status_code == 200, r.text
        mid = r.json()["id"]
        # update
        upd = dict(create); upd["name"] = "TEST Dish Updated"; upd["price_max"] = 300
        r2 = s.put(f"{API}/admin/menu/{mid}", headers=admin_h, json=upd)
        assert r2.status_code == 200
        assert r2.json()["name"] == "TEST Dish Updated"
        # GET to verify persistence
        r3 = s.get(f"{API}/menu", params={"category": "TEST Cat"})
        names = [m["name"] for m in r3.json()]
        assert "TEST Dish Updated" in names
        # delete
        r4 = s.delete(f"{API}/admin/menu/{mid}", headers=admin_h)
        assert r4.status_code == 200

    def test_service_crud(self, s, admin_h):
        body = {"title": "TEST Service", "description": "TEST", "starting_price": 999,
                "icon": "star", "image": None, "features": ["a", "b"]}
        r = s.post(f"{API}/admin/services", headers=admin_h, json=body)
        assert r.status_code == 200
        sid = r.json()["id"]
        body["title"] = "TEST Service Updated"
        r2 = s.put(f"{API}/admin/services/{sid}", headers=admin_h, json=body)
        assert r2.status_code == 200
        assert r2.json()["title"] == "TEST Service Updated"
        r3 = s.delete(f"{API}/admin/services/{sid}", headers=admin_h)
        assert r3.status_code == 200

    def test_portfolio_crud(self, s, admin_h):
        body = {"title": "TEST Port", "event_type": "corporate", "guest_count": 100,
                "cuisine": "North Indian", "image": "https://example.com/x.png",
                "description": "TEST"}
        r = s.post(f"{API}/admin/portfolio", headers=admin_h, json=body)
        assert r.status_code == 200
        pid = r.json()["id"]
        body["title"] = "TEST Port Updated"
        r2 = s.put(f"{API}/admin/portfolio/{pid}", headers=admin_h, json=body)
        assert r2.status_code == 200 and r2.json()["title"] == "TEST Port Updated"
        s.delete(f"{API}/admin/portfolio/{pid}", headers=admin_h)

    def test_testimonial_crud(self, s, admin_h):
        body = {"name": "TEST T", "role": "TEST Role", "rating": 5,
                "text": "TEST text", "event_type": "birthday"}
        r = s.post(f"{API}/admin/testimonials", headers=admin_h, json=body)
        assert r.status_code == 200
        tid = r.json()["id"]
        body["text"] = "TEST updated"
        r2 = s.put(f"{API}/admin/testimonials/{tid}", headers=admin_h, json=body)
        assert r2.status_code == 200 and r2.json()["text"] == "TEST updated"
        s.delete(f"{API}/admin/testimonials/{tid}", headers=admin_h)

    def test_client_crud(self, s, admin_h):
        body = {"name": "TEST Co", "logo": "https://example.com/logo.png"}
        r = s.post(f"{API}/admin/corporate-clients", headers=admin_h, json=body)
        assert r.status_code == 200
        cid = r.json()["id"]
        body["name"] = "TEST Co Updated"
        r2 = s.put(f"{API}/admin/corporate-clients/{cid}", headers=admin_h, json=body)
        assert r2.status_code == 200 and r2.json()["name"] == "TEST Co Updated"
        s.delete(f"{API}/admin/corporate-clients/{cid}", headers=admin_h)


# -------- Admin Media Upload --------
class TestAdminMedia:
    def test_upload_data_url(self, s, admin_h):
        # 1x1 PNG base64
        data_url = ("data:image/png;base64,"
                    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")
        r = s.post(f"{API}/admin/media", headers=admin_h,
                   json={"data_url": data_url, "label": "TEST img"})
        assert r.status_code == 200
        body = r.json()
        assert body["id"] and body["url"].startswith("data:image/")
        # verify GET
        r2 = s.get(f"{API}/media/{body['id']}")
        assert r2.status_code == 200
        assert r2.json()["url"] == data_url

    def test_upload_bad_url_400(self, s, admin_h):
        r = s.post(f"{API}/admin/media", headers=admin_h,
                   json={"data_url": "https://example.com/x.png"})
        assert r.status_code == 400
