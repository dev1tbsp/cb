from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
from passlib.context import CryptContext
from jose import jwt, JWTError
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# Security config
JWT_SECRET = os.environ.get("JWT_SECRET", "cosmic-bites-dev-secret-change-in-prod")
JWT_ALGO = "HS256"
JWT_EXPIRE_MIN = 60 * 24 * 7  # 7 days
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@cosmicbites.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@123")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ----------- Models -----------
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "customer"
    dob: Optional[str] = None
    anniversary: Optional[str] = None
    address: Optional[str] = None
    kids: List[Dict[str, Any]] = []


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    anniversary: Optional[str] = None
    address: Optional[str] = None
    kids: Optional[List[Dict[str, Any]]] = None


class MenuItem(BaseModel):
    id: str
    name: str
    category: str
    description: str
    price_min: int
    price_max: int
    spice_level: int = 0  # 0-3
    is_jain: bool = False
    is_live_counter: bool = False
    image: Optional[str] = None


class Service(BaseModel):
    id: str
    title: str
    description: str
    starting_price: int
    icon: str
    image: Optional[str] = None
    features: List[str] = []


class PortfolioItem(BaseModel):
    id: str
    title: str
    event_type: str
    guest_count: int
    cuisine: str
    image: str
    description: str


class Testimonial(BaseModel):
    id: str
    name: str
    role: str
    rating: int
    text: str
    event_type: str


class CorporateClient(BaseModel):
    id: str
    name: str
    logo: str


class EventCategory(BaseModel):
    id: str
    name: str
    icon: str
    image: str
    description: str


class QuoteCreate(BaseModel):
    event_type: str
    guest_count: int
    event_date: Optional[str] = None
    location: Optional[str] = None
    cuisines: List[str] = []
    services: List[str] = []
    live_counters: List[str] = []
    needs_staff: bool = False
    needs_decor: bool = False
    notes: Optional[str] = None


class Quote(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_email: str
    user_phone: Optional[str] = None
    event_type: str
    guest_count: int
    event_date: Optional[str] = None
    location: Optional[str] = None
    cuisines: List[str] = []
    services: List[str] = []
    live_counters: List[str] = []
    needs_staff: bool = False
    needs_decor: bool = False
    notes: Optional[str] = None
    estimated_total: int
    estimated_per_plate: int
    status: str = "pending"
    created_at: str


# ----------- Helpers -----------
def hash_password(pw: str) -> str:
    return pwd_context.hash(pw)


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(pw, hashed)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MIN)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGO)


def user_to_public(doc: dict) -> UserPublic:
    return UserPublic(
        id=doc["id"],
        name=doc.get("name", ""),
        email=doc["email"],
        phone=doc.get("phone"),
        role=doc.get("role", "customer"),
        dob=doc.get("dob"),
        anniversary=doc.get("anniversary"),
        address=doc.get("address"),
        kids=doc.get("kids", []),
    )


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ----------- Auth Routes -----------
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(body: UserRegister):
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "id": str(uuid.uuid4()),
        "name": body.name,
        "email": body.email.lower(),
        "phone": body.phone,
        "hashed_password": hash_password(body.password),
        "role": "customer",
        "dob": None,
        "anniversary": None,
        "address": None,
        "kids": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_access_token({"sub": user_doc["id"], "role": "customer"})
    return TokenResponse(access_token=token, user=user_to_public(user_doc))


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(body: UserLogin):
    user = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user["id"], "role": user.get("role", "customer")})
    return TokenResponse(access_token=token, user=user_to_public(user))


@api_router.get("/auth/me", response_model=UserPublic)
async def me(current_user: dict = Depends(get_current_user)):
    return user_to_public(current_user)


@api_router.put("/auth/profile", response_model=UserPublic)
async def update_profile(body: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in body.dict().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})
    updated = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    return user_to_public(updated)


# ----------- Catalog Routes -----------
@api_router.get("/event-categories", response_model=List[EventCategory])
async def get_event_categories():
    items = await db.event_categories.find({}, {"_id": 0}).to_list(100)
    return items


@api_router.get("/services", response_model=List[Service])
async def get_services():
    items = await db.services.find({}, {"_id": 0}).to_list(100)
    return items


@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu(category: Optional[str] = None):
    q = {}
    if category:
        q["category"] = category
    items = await db.menu_items.find(q, {"_id": 0}).to_list(500)
    return items


@api_router.get("/portfolio", response_model=List[PortfolioItem])
async def get_portfolio(event_type: Optional[str] = None):
    q = {}
    if event_type:
        q["event_type"] = event_type
    items = await db.portfolio.find(q, {"_id": 0}).to_list(200)
    return items


@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials():
    items = await db.testimonials.find({}, {"_id": 0}).to_list(100)
    return items


@api_router.get("/corporate-clients", response_model=List[CorporateClient])
async def get_corporate_clients():
    items = await db.corporate_clients.find({}, {"_id": 0}).to_list(100)
    return items


# ----------- Quote Routes -----------
def calculate_quote(body: QuoteCreate) -> Dict[str, int]:
    """Simple pricing engine."""
    base_per_plate = 450  # base veg
    cuisine_premium = {
        "north_indian": 50,
        "south_indian": 50,
        "chinese": 80,
        "italian": 120,
        "chaat": 40,
        "snacks": 40,
        "desserts": 80,
        "mocktails": 60,
        "kids": 30,
        "jain": 40,
    }
    per_plate = base_per_plate + sum(cuisine_premium.get(c, 50) for c in body.cuisines)
    # service multiplier
    service_mult = 1.0
    if "full_catering" in body.services:
        service_mult += 0.25
    if "live_counters" in body.services:
        service_mult += 0.15
    per_plate = int(per_plate * service_mult)
    # live counters add-on
    per_plate += len(body.live_counters) * 80
    # extras
    extras = 0
    if body.needs_staff:
        extras += max(body.guest_count * 25, 1500)
    if body.needs_decor:
        extras += max(body.guest_count * 40, 3000)
    total = per_plate * body.guest_count + extras
    return {"per_plate": per_plate, "total": total}


@api_router.post("/quotes", response_model=Quote)
async def create_quote(body: QuoteCreate, current_user: dict = Depends(get_current_user)):
    pricing = calculate_quote(body)
    quote_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user.get("name", ""),
        "user_email": current_user["email"],
        "user_phone": current_user.get("phone"),
        "event_type": body.event_type,
        "guest_count": body.guest_count,
        "event_date": body.event_date,
        "location": body.location,
        "cuisines": body.cuisines,
        "services": body.services,
        "live_counters": body.live_counters,
        "needs_staff": body.needs_staff,
        "needs_decor": body.needs_decor,
        "notes": body.notes,
        "estimated_total": pricing["total"],
        "estimated_per_plate": pricing["per_plate"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.quotes.insert_one(quote_doc)
    return Quote(**quote_doc)


@api_router.post("/quotes/estimate")
async def estimate_quote(body: QuoteCreate):
    """No auth — get a live estimate while building the quote."""
    return calculate_quote(body)


class PublicQuoteCreate(QuoteCreate):
    contact_name: str
    contact_email: EmailStr
    contact_phone: Optional[str] = None


@api_router.post("/quotes/public", response_model=Quote)
async def create_public_quote(body: PublicQuoteCreate):
    """Unauthenticated quote submission from the public website."""
    pricing = calculate_quote(body)
    quote_doc = {
        "id": str(uuid.uuid4()),
        "user_id": "guest",
        "user_name": body.contact_name,
        "user_email": body.contact_email.lower(),
        "user_phone": body.contact_phone,
        "event_type": body.event_type,
        "guest_count": body.guest_count,
        "event_date": body.event_date,
        "location": body.location,
        "cuisines": body.cuisines,
        "services": body.services,
        "live_counters": body.live_counters,
        "needs_staff": body.needs_staff,
        "needs_decor": body.needs_decor,
        "notes": body.notes,
        "estimated_total": pricing["total"],
        "estimated_per_plate": pricing["per_plate"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.quotes.insert_one(quote_doc)
    return Quote(**quote_doc)


@api_router.get("/quotes/my", response_model=List[Quote])
async def my_quotes(current_user: dict = Depends(get_current_user)):
    items = await db.quotes.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items


# ----------- Inquiries (Contact Form) -----------
class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str


class Inquiry(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str
    status: str = "new"  # new | replied | resolved
    reply: Optional[str] = None
    created_at: str


@api_router.post("/inquiries", response_model=Inquiry)
async def submit_inquiry(body: InquiryCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "name": body.name,
        "email": body.email.lower(),
        "phone": body.phone,
        "subject": body.subject,
        "message": body.message,
        "status": "new",
        "reply": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.inquiries.insert_one(doc)
    return Inquiry(**doc)


# ----------- Admin Dependency -----------
async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ----------- Admin: Dashboard Stats -----------
@api_router.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    total_quotes = await db.quotes.count_documents({})
    pending_quotes = await db.quotes.count_documents({"status": "pending"})
    customers = await db.users.count_documents({"role": "customer"})
    menu_count = await db.menu_items.count_documents({})
    portfolio_count = await db.portfolio.count_documents({})
    new_inquiries = await db.inquiries.count_documents({"status": "new"})
    # Sum of estimated_total
    agg = await db.quotes.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$estimated_total"}}}
    ]).to_list(1)
    total_value = agg[0]["total"] if agg else 0
    return {
        "total_quotes": total_quotes,
        "pending_quotes": pending_quotes,
        "customers": customers,
        "menu_items": menu_count,
        "portfolio_items": portfolio_count,
        "new_inquiries": new_inquiries,
        "total_pipeline_value": total_value,
    }


# ----------- Admin: Quotes -----------
class QuoteStatusUpdate(BaseModel):
    status: str  # pending | contacted | confirmed | cancelled


@api_router.get("/admin/quotes", response_model=List[Quote])
async def admin_list_quotes(status_filter: Optional[str] = None, _: dict = Depends(require_admin)):
    q = {}
    if status_filter:
        q["status"] = status_filter
    items = await db.quotes.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.put("/admin/quotes/{quote_id}", response_model=Quote)
async def admin_update_quote_status(quote_id: str, body: QuoteStatusUpdate, _: dict = Depends(require_admin)):
    res = await db.quotes.update_one({"id": quote_id}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    doc = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/quotes/{quote_id}")
async def admin_delete_quote(quote_id: str, _: dict = Depends(require_admin)):
    res = await db.quotes.delete_one({"id": quote_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"deleted": True}


# ----------- Admin: Inquiries -----------
class InquiryUpdate(BaseModel):
    status: Optional[str] = None
    reply: Optional[str] = None


@api_router.get("/admin/inquiries", response_model=List[Inquiry])
async def admin_list_inquiries(_: dict = Depends(require_admin)):
    items = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.put("/admin/inquiries/{inq_id}", response_model=Inquiry)
async def admin_update_inquiry(inq_id: str, body: InquiryUpdate, _: dict = Depends(require_admin)):
    update = {k: v for k, v in body.dict().items() if v is not None}
    if update:
        await db.inquiries.update_one({"id": inq_id}, {"$set": update})
    doc = await db.inquiries.find_one({"id": inq_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return doc


@api_router.delete("/admin/inquiries/{inq_id}")
async def admin_delete_inquiry(inq_id: str, _: dict = Depends(require_admin)):
    await db.inquiries.delete_one({"id": inq_id})
    return {"deleted": True}


# ----------- Admin: Generic CRUD helpers -----------
def _new_id() -> str:
    return str(uuid.uuid4())


class MenuItemUpsert(BaseModel):
    name: str
    category: str
    description: str = ""
    price_min: int
    price_max: int
    spice_level: int = 0
    is_jain: bool = False
    is_live_counter: bool = False
    image: Optional[str] = None


@api_router.post("/admin/menu", response_model=MenuItem)
async def admin_create_menu(body: MenuItemUpsert, _: dict = Depends(require_admin)):
    doc = body.dict()
    doc["id"] = _new_id()
    await db.menu_items.insert_one(doc)
    doc.pop("_id", None)
    return MenuItem(**doc)


@api_router.put("/admin/menu/{item_id}", response_model=MenuItem)
async def admin_update_menu(item_id: str, body: MenuItemUpsert, _: dict = Depends(require_admin)):
    await db.menu_items.update_one({"id": item_id}, {"$set": body.dict()})
    doc = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return doc


@api_router.delete("/admin/menu/{item_id}")
async def admin_delete_menu(item_id: str, _: dict = Depends(require_admin)):
    await db.menu_items.delete_one({"id": item_id})
    return {"deleted": True}


class ServiceUpsert(BaseModel):
    title: str
    description: str
    starting_price: int
    icon: str = "restaurant"
    image: Optional[str] = None
    features: List[str] = []


@api_router.post("/admin/services", response_model=Service)
async def admin_create_service(body: ServiceUpsert, _: dict = Depends(require_admin)):
    doc = body.dict()
    doc["id"] = _new_id()
    await db.services.insert_one(doc)
    doc.pop("_id", None)
    return Service(**doc)


@api_router.put("/admin/services/{sid}", response_model=Service)
async def admin_update_service(sid: str, body: ServiceUpsert, _: dict = Depends(require_admin)):
    await db.services.update_one({"id": sid}, {"$set": body.dict()})
    doc = await db.services.find_one({"id": sid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Service not found")
    return doc


@api_router.delete("/admin/services/{sid}")
async def admin_delete_service(sid: str, _: dict = Depends(require_admin)):
    await db.services.delete_one({"id": sid})
    return {"deleted": True}


class PortfolioUpsert(BaseModel):
    title: str
    event_type: str
    guest_count: int
    cuisine: str
    image: str
    description: str


@api_router.post("/admin/portfolio", response_model=PortfolioItem)
async def admin_create_portfolio(body: PortfolioUpsert, _: dict = Depends(require_admin)):
    doc = body.dict()
    doc["id"] = _new_id()
    await db.portfolio.insert_one(doc)
    doc.pop("_id", None)
    return PortfolioItem(**doc)


@api_router.put("/admin/portfolio/{pid}", response_model=PortfolioItem)
async def admin_update_portfolio(pid: str, body: PortfolioUpsert, _: dict = Depends(require_admin)):
    await db.portfolio.update_one({"id": pid}, {"$set": body.dict()})
    doc = await db.portfolio.find_one({"id": pid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return doc


@api_router.delete("/admin/portfolio/{pid}")
async def admin_delete_portfolio(pid: str, _: dict = Depends(require_admin)):
    await db.portfolio.delete_one({"id": pid})
    return {"deleted": True}


class TestimonialUpsert(BaseModel):
    name: str
    role: str
    rating: int = 5
    text: str
    event_type: str


@api_router.post("/admin/testimonials", response_model=Testimonial)
async def admin_create_testimonial(body: TestimonialUpsert, _: dict = Depends(require_admin)):
    doc = body.dict()
    doc["id"] = _new_id()
    await db.testimonials.insert_one(doc)
    doc.pop("_id", None)
    return Testimonial(**doc)


@api_router.put("/admin/testimonials/{tid}", response_model=Testimonial)
async def admin_update_testimonial(tid: str, body: TestimonialUpsert, _: dict = Depends(require_admin)):
    await db.testimonials.update_one({"id": tid}, {"$set": body.dict()})
    doc = await db.testimonials.find_one({"id": tid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return doc


@api_router.delete("/admin/testimonials/{tid}")
async def admin_delete_testimonial(tid: str, _: dict = Depends(require_admin)):
    await db.testimonials.delete_one({"id": tid})
    return {"deleted": True}


class ClientUpsert(BaseModel):
    name: str
    logo: str


@api_router.post("/admin/corporate-clients", response_model=CorporateClient)
async def admin_create_client(body: ClientUpsert, _: dict = Depends(require_admin)):
    doc = body.dict()
    doc["id"] = _new_id()
    await db.corporate_clients.insert_one(doc)
    doc.pop("_id", None)
    return CorporateClient(**doc)


@api_router.put("/admin/corporate-clients/{cid}", response_model=CorporateClient)
async def admin_update_client(cid: str, body: ClientUpsert, _: dict = Depends(require_admin)):
    await db.corporate_clients.update_one({"id": cid}, {"$set": body.dict()})
    doc = await db.corporate_clients.find_one({"id": cid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Client not found")
    return doc


@api_router.delete("/admin/corporate-clients/{cid}")
async def admin_delete_client(cid: str, _: dict = Depends(require_admin)):
    await db.corporate_clients.delete_one({"id": cid})
    return {"deleted": True}


# ----------- Admin: Media Upload -----------
class MediaUpload(BaseModel):
    data_url: str  # data:image/...;base64,...
    label: Optional[str] = None


@api_router.post("/admin/media")
async def upload_media(body: MediaUpload, current_admin: dict = Depends(require_admin)):
    if not body.data_url.startswith("data:"):
        raise HTTPException(status_code=400, detail="Must be a data URL")
    # Soft size guard ~ 2MB base64
    if len(body.data_url) > 3_000_000:
        raise HTTPException(status_code=413, detail="Image too large (max ~2MB)")
    mid = _new_id()
    await db.media.insert_one({
        "id": mid,
        "data_url": body.data_url,
        "label": body.label,
        "uploaded_by": current_admin["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    # Return both the id and the data_url so the client can use it directly
    return {"id": mid, "url": body.data_url, "label": body.label}


@api_router.get("/media/{media_id}")
async def get_media(media_id: str):
    doc = await db.media.find_one({"id": media_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"id": doc["id"], "url": doc["data_url"], "label": doc.get("label")}


@api_router.get("/")
async def root():
    return {"message": "Cosmic Bites API", "status": "ok"}


# ----------- Seed Data -----------
HERO_FEAST = "https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/0bec547c94a8a1c6b5cc1c49d641ea25b1b5d44d4c0b0d4340bcb5f081bf8a1d.png"
LIVE_COUNTER_IMG = "https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/cb48ccb579fd6d36baeaff403d662ac1e76e09f70a73ce51f5e08d5df20b709d.png"
CORPORATE_IMG = "https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/a195994895d680a9168a969cbd37b0a4f60d66a9b0f077572e033b02958c3645.png"
SIGNATURE_IMG = "https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/c2969cd9807f501ea73d9328149a8bdd4d3e6d697e5b1f97d5d079a1e3b0944b.png"
LOGO_1 = "https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/fba74551cde17fb68586e9b8da332fd4af8cfc544dcaf617142e905de9f39192.png"
LOGO_2 = "https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/8f908833e6c33133337f849a571610e6bb3e6adbe78926e6c741d02238642ffa.png"
LOGO_3 = "https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/3098d21af42a8405075d6135f2d6d3705b862bee417192700c320dfa52f2c926.png"


SEED_EVENT_CATEGORIES = [
    {"id": "birthday", "name": "Birthday", "icon": "gift", "image": HERO_FEAST, "description": "Memorable birthday parties with themed menus."},
    {"id": "house_party", "name": "House Party", "icon": "home", "image": SIGNATURE_IMG, "description": "Cozy gatherings with curated tasting menus."},
    {"id": "housewarming", "name": "Housewarming", "icon": "key", "image": LIVE_COUNTER_IMG, "description": "Bless your new home with auspicious feasts."},
    {"id": "pre_wedding", "name": "Pre-Wedding", "icon": "heart", "image": HERO_FEAST, "description": "Mehendi, sangeet & engagement spreads."},
    {"id": "corporate", "name": "Corporate", "icon": "briefcase", "image": CORPORATE_IMG, "description": "Premium corporate lunch & event catering."},
    {"id": "festive", "name": "Festive", "icon": "star", "image": SIGNATURE_IMG, "description": "Diwali, Holi, Navratri specials."},
]

SEED_SERVICES = [
    {"id": "birthday_catering", "title": "Birthday Catering", "description": "End-to-end birthday catering with themed menus and live counters.", "starting_price": 599, "icon": "gift", "image": HERO_FEAST, "features": ["Themed menus", "Kids specials", "Cake pairing"]},
    {"id": "house_parties", "title": "House Parties", "description": "Intimate plated and buffet experiences for 20-50 guests.", "starting_price": 499, "icon": "home", "image": SIGNATURE_IMG, "features": ["Chef on-site", "Plated service", "Vegan options"]},
    {"id": "housewarming", "title": "Housewarming Catering", "description": "Auspicious vegetarian feasts for your new beginnings.", "starting_price": 549, "icon": "key", "image": LIVE_COUNTER_IMG, "features": ["Sattvic menus", "Traditional thali", "Prasadam"]},
    {"id": "pre_wedding", "title": "Pre-Wedding Functions", "description": "Mehendi, Sangeet, Haldi catering with live counters.", "starting_price": 799, "icon": "heart", "image": HERO_FEAST, "features": ["Live counters", "Mocktail bar", "Decor coordination"]},
    {"id": "corporate", "title": "Corporate Catering", "description": "Trusted by Kotak, Barclays, Network18 for daily and event catering.", "starting_price": 449, "icon": "briefcase", "image": CORPORATE_IMG, "features": ["Daily lunch", "Conference platters", "Corporate gifting"]},
    {"id": "festive", "title": "Festive Catering", "description": "Festival menus crafted for every Indian celebration.", "starting_price": 599, "icon": "star", "image": SIGNATURE_IMG, "features": ["Diwali special", "Navratri thali", "Holi snacks"]},
    {"id": "live_counter", "title": "Live Counter Catering", "description": "Chaat, pasta, dosa, tandoor — live action stations.", "starting_price": 199, "icon": "flame", "image": LIVE_COUNTER_IMG, "features": ["Chaat counter", "Pasta live", "Dosa & tandoor"]},
    {"id": "bulk_meal", "title": "Bulk Meal Catering", "description": "Hygienic bulk meals from 100 to 500 plates.", "starting_price": 299, "icon": "package", "image": CORPORATE_IMG, "features": ["100-500 plates", "Hygienic packaging", "On-time delivery"]},
]

SEED_MENU = [
    # North Indian
    {"id": "ni-1", "name": "Paneer Butter Masala", "category": "North Indian", "description": "Cottage cheese in creamy tomato gravy.", "price_min": 180, "price_max": 260, "spice_level": 1, "is_jain": False, "is_live_counter": False, "image": SIGNATURE_IMG},
    {"id": "ni-2", "name": "Dal Makhani", "category": "North Indian", "description": "Slow-cooked black lentils with butter & cream.", "price_min": 140, "price_max": 200, "spice_level": 1, "is_jain": True, "is_live_counter": False, "image": SIGNATURE_IMG},
    {"id": "ni-3", "name": "Shahi Paneer", "category": "North Indian", "description": "Royal paneer in cashew gravy.", "price_min": 200, "price_max": 280, "spice_level": 1, "is_jain": False, "is_live_counter": False, "image": SIGNATURE_IMG},
    {"id": "ni-4", "name": "Veg Biryani", "category": "North Indian", "description": "Fragrant basmati biryani with vegetables.", "price_min": 160, "price_max": 240, "spice_level": 2, "is_jain": False, "is_live_counter": False, "image": SIGNATURE_IMG},
    # South Indian
    {"id": "si-1", "name": "Masala Dosa", "category": "South Indian", "description": "Crispy dosa with spiced potato filling.", "price_min": 120, "price_max": 180, "spice_level": 1, "is_jain": False, "is_live_counter": True, "image": SIGNATURE_IMG},
    {"id": "si-2", "name": "Idli Sambar", "category": "South Indian", "description": "Steamed rice cakes with sambar & chutneys.", "price_min": 100, "price_max": 150, "spice_level": 1, "is_jain": True, "is_live_counter": False, "image": SIGNATURE_IMG},
    {"id": "si-3", "name": "Rasam Rice", "category": "South Indian", "description": "Tangy tamarind rasam with steamed rice.", "price_min": 90, "price_max": 140, "spice_level": 2, "is_jain": True, "is_live_counter": False, "image": SIGNATURE_IMG},
    # Chinese
    {"id": "ch-1", "name": "Veg Hakka Noodles", "category": "Chinese", "description": "Wok-tossed noodles with veggies.", "price_min": 140, "price_max": 200, "spice_level": 1, "is_jain": False, "is_live_counter": True, "image": LIVE_COUNTER_IMG},
    {"id": "ch-2", "name": "Chilli Paneer", "category": "Chinese", "description": "Crispy paneer in indo-chinese sauce.", "price_min": 200, "price_max": 280, "spice_level": 2, "is_jain": False, "is_live_counter": False, "image": LIVE_COUNTER_IMG},
    {"id": "ch-3", "name": "Manchurian", "category": "Chinese", "description": "Veg balls in spicy manchurian gravy.", "price_min": 180, "price_max": 240, "spice_level": 2, "is_jain": False, "is_live_counter": False, "image": LIVE_COUNTER_IMG},
    # Italian
    {"id": "it-1", "name": "Margherita Pizza", "category": "Italian", "description": "Wood-fired pizza with fresh mozzarella & basil.", "price_min": 240, "price_max": 360, "spice_level": 0, "is_jain": False, "is_live_counter": True, "image": LIVE_COUNTER_IMG},
    {"id": "it-2", "name": "Penne Arrabbiata", "category": "Italian", "description": "Penne in spicy tomato sauce.", "price_min": 200, "price_max": 300, "spice_level": 1, "is_jain": True, "is_live_counter": True, "image": LIVE_COUNTER_IMG},
    # Chaat
    {"id": "ct-1", "name": "Pani Puri", "category": "Chaat", "description": "Crispy puris with spiced water.", "price_min": 80, "price_max": 120, "spice_level": 2, "is_jain": False, "is_live_counter": True, "image": LIVE_COUNTER_IMG},
    {"id": "ct-2", "name": "Bhel Puri", "category": "Chaat", "description": "Puffed rice tossed with tangy chutneys.", "price_min": 70, "price_max": 110, "spice_level": 1, "is_jain": False, "is_live_counter": True, "image": LIVE_COUNTER_IMG},
    {"id": "ct-3", "name": "Dahi Puri", "category": "Chaat", "description": "Puris filled with curd & sweet chutney.", "price_min": 90, "price_max": 130, "spice_level": 1, "is_jain": False, "is_live_counter": True, "image": LIVE_COUNTER_IMG},
    # Snacks
    {"id": "sn-1", "name": "Samosa", "category": "Snacks", "description": "Crispy pastry with spiced potato filling.", "price_min": 30, "price_max": 50, "spice_level": 1, "is_jain": False, "is_live_counter": False, "image": SIGNATURE_IMG},
    {"id": "sn-2", "name": "Paneer Tikka", "category": "Snacks", "description": "Tandoor-grilled marinated paneer.", "price_min": 220, "price_max": 320, "spice_level": 1, "is_jain": False, "is_live_counter": True, "image": SIGNATURE_IMG},
    # Desserts
    {"id": "ds-1", "name": "Gulab Jamun", "category": "Desserts", "description": "Soft dumplings in rose-cardamom syrup.", "price_min": 80, "price_max": 120, "spice_level": 0, "is_jain": True, "is_live_counter": False, "image": SIGNATURE_IMG},
    {"id": "ds-2", "name": "Rasmalai", "category": "Desserts", "description": "Cottage cheese discs in saffron milk.", "price_min": 120, "price_max": 180, "spice_level": 0, "is_jain": True, "is_live_counter": False, "image": SIGNATURE_IMG},
    {"id": "ds-3", "name": "Kulfi Falooda", "category": "Desserts", "description": "Traditional Indian ice cream with vermicelli.", "price_min": 100, "price_max": 160, "spice_level": 0, "is_jain": True, "is_live_counter": True, "image": SIGNATURE_IMG},
    # Mocktails
    {"id": "mt-1", "name": "Virgin Mojito", "category": "Mocktails", "description": "Mint, lime & soda refresher.", "price_min": 90, "price_max": 140, "spice_level": 0, "is_jain": True, "is_live_counter": True, "image": LIVE_COUNTER_IMG},
    {"id": "mt-2", "name": "Mango Lassi", "category": "Mocktails", "description": "Creamy yogurt-based mango drink.", "price_min": 80, "price_max": 130, "spice_level": 0, "is_jain": True, "is_live_counter": False, "image": LIVE_COUNTER_IMG},
    # Kids Menu
    {"id": "kd-1", "name": "Mini Burgers", "category": "Kids Menu", "description": "Kid-sized veg burgers with fries.", "price_min": 140, "price_max": 200, "spice_level": 0, "is_jain": False, "is_live_counter": False, "image": LIVE_COUNTER_IMG},
    {"id": "kd-2", "name": "Cheese Pasta", "category": "Kids Menu", "description": "Mild creamy cheese pasta for kids.", "price_min": 160, "price_max": 220, "spice_level": 0, "is_jain": False, "is_live_counter": False, "image": LIVE_COUNTER_IMG},
    # Jain Menu
    {"id": "jn-1", "name": "Jain Paneer Curry", "category": "Jain Menu", "description": "No onion, no garlic paneer preparation.", "price_min": 200, "price_max": 280, "spice_level": 1, "is_jain": True, "is_live_counter": False, "image": SIGNATURE_IMG},
    {"id": "jn-2", "name": "Jain Khichdi", "category": "Jain Menu", "description": "Wholesome rice-lentil khichdi, jain-friendly.", "price_min": 150, "price_max": 220, "spice_level": 0, "is_jain": True, "is_live_counter": False, "image": SIGNATURE_IMG},
]

SEED_PORTFOLIO = [
    {"id": "p1", "title": "150 Pax Corporate Lunch", "event_type": "corporate", "guest_count": 150, "cuisine": "North Indian", "image": CORPORATE_IMG, "description": "A premium corporate lunch for Kotak's leadership team."},
    {"id": "p2", "title": "Terrace Birthday Party", "event_type": "birthday", "guest_count": 40, "cuisine": "Italian", "image": LIVE_COUNTER_IMG, "description": "Cozy terrace birthday with live pasta & pizza counter."},
    {"id": "p3", "title": "Engagement Function", "event_type": "pre_wedding", "guest_count": 250, "cuisine": "Multi-cuisine", "image": HERO_FEAST, "description": "A lavish engagement with 5 cuisines and live counters."},
    {"id": "p4", "title": "Diwali Office Bash", "event_type": "festive", "guest_count": 200, "cuisine": "North Indian", "image": SIGNATURE_IMG, "description": "Festive Diwali catering for Network18."},
    {"id": "p5", "title": "Housewarming Feast", "event_type": "housewarming", "guest_count": 80, "cuisine": "South Indian", "image": SIGNATURE_IMG, "description": "Sattvic housewarming for a family of friends."},
    {"id": "p6", "title": "Sangeet Night", "event_type": "pre_wedding", "guest_count": 300, "cuisine": "Multi-cuisine", "image": LIVE_COUNTER_IMG, "description": "Sangeet with 8 live counters and a mocktail bar."},
    {"id": "p7", "title": "Kids 10th Birthday", "event_type": "birthday", "guest_count": 60, "cuisine": "Italian", "image": LIVE_COUNTER_IMG, "description": "A pasta & pizza themed kids birthday."},
    {"id": "p8", "title": "Quarterly Town Hall", "event_type": "corporate", "guest_count": 400, "cuisine": "North Indian", "image": CORPORATE_IMG, "description": "Barclays quarterly town hall lunch."},
]

SEED_TESTIMONIALS = [
    {"id": "t1", "name": "Priya Sharma", "role": "HR Lead, Kotak", "rating": 5, "text": "Cosmic Bites consistently delivers premium veg catering for our office events. Reliable and delicious every single time.", "event_type": "corporate"},
    {"id": "t2", "name": "Rohan Mehta", "role": "Father of the Birthday Girl", "rating": 5, "text": "The terrace birthday they catered was magical. The live pasta counter was the highlight of the night!", "event_type": "birthday"},
    {"id": "t3", "name": "Anjali & Vikram", "role": "Engagement Couple", "rating": 5, "text": "From sangeet to engagement, every spread was breathtaking. Our guests are still raving about the food.", "event_type": "pre_wedding"},
    {"id": "t4", "name": "Meera Patel", "role": "Homeowner", "rating": 5, "text": "Our housewarming felt blessed with their sattvic menu. Hygienic, fresh, and respectful of our jain preferences.", "event_type": "housewarming"},
    {"id": "t5", "name": "Sandeep Kumar", "role": "Admin Manager, Barclays", "rating": 5, "text": "We've been ordering daily lunches and quarterly event catering for 2 years. Truly a trusted partner.", "event_type": "corporate"},
]

SEED_CORPORATE = [
    {"id": "c1", "name": "Kotak", "logo": LOGO_1},
    {"id": "c2", "name": "Barclays", "logo": LOGO_2},
    {"id": "c3", "name": "Network18", "logo": LOGO_3},
]


async def seed_admin_and_data():
    # Admin user
    admin = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if not admin:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Cosmic Admin",
            "email": ADMIN_EMAIL.lower(),
            "phone": "+919999999999",
            "hashed_password": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "dob": None,
            "anniversary": None,
            "address": None,
            "kids": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded: %s", ADMIN_EMAIL)

    # Seed catalog only if empty (idempotent)
    seed_pairs = [
        ("event_categories", SEED_EVENT_CATEGORIES),
        ("services", SEED_SERVICES),
        ("menu_items", SEED_MENU),
        ("portfolio", SEED_PORTFOLIO),
        ("testimonials", SEED_TESTIMONIALS),
        ("corporate_clients", SEED_CORPORATE),
    ]
    for coll, data in seed_pairs:
        count = await db[coll].count_documents({})
        if count == 0:
            await db[coll].insert_many([dict(d) for d in data])
            logger.info("Seeded %d items into %s", len(data), coll)


# ----------- App Wiring -----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index([("email", ASCENDING)], unique=True)
    await seed_admin_and_data()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
