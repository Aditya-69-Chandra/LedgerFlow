import os
import json
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI(
    title="Budget Management REST API",
    description="A stateless FastAPI backend for Budget Management with Cloud Run standards",
    version="1.0.0"
)

# File path for persistent memory backup (useful for local runs)
DATA_FILE = "data.json"

# In-memory storage structure
state = {
    "user": None,  # Will store {"name": str, "profession": str, "budget": float}
    "expenses": [] # List of {"id": int, "description": str, "amount": float, "category": str, "date": str}
}

def load_data():
    """Load persistent budget data if the JSON file exists."""
    global state
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r") as f:
                state = json.load(f)
        except Exception:
            # Fallback to empty state on read error
            pass

def save_data():
    """Save budget data to a local file for immediate micro-persistence."""
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(state, f, indent=4)
    except Exception:
        pass

# Initialize configuration
load_data()

# Auto-tagging lookup dictionary for smart category assignment
TAG_RULES = {
    "Food": ["food", "bites", "lunch", "dinner", "breakfast", "groceries", "grocery", "restaurant", "cafe", "coffee", "starbucks", "maccas", "mcdonalds", "burger", "pizza", "eat", "eats", "supermarket"],
    "Utilities": ["electric", "electricity", "water", "gas", "internet", "wifi", "broadband", "phone", "mobile", "bill", "sewer", "power", "energy", "comcast", "verizon", "t-mobile", "at&t"],
    "Entertainment": ["movie", "movies", "cinema", "netflix", "spotify", "hulu", "disney", "prime", "game", "gaming", "steam", "nintendo", "xbox", "playstation", "concert", "gig", "pub", "bar", "club", "party", "ticket"],
    "Rent": ["rent", "lease", "mortgage", "apartment", "house", "flat", "room", "landlord", "hoa"]
}

def auto_tag_category(description: str) -> str:
    """Intelligently assign spending category based on description keywords."""
    desc_lower = description.lower()
    for category, keywords in TAG_RULES.items():
        for keyword in keywords:
            if keyword in desc_lower:
                return category
    return "Miscellaneous"

# Pydantic Schemas for validation
class UserOnboard(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    profession: str = Field(..., min_length=1, max_length=100)
    budget: float = Field(..., gt=0)

class ExpenseCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0)
    category: Optional[str] = "Auto"
    date: str = Field(..., description="ISO date representation (YYYY-MM-DD)")

# Create templates directory connection
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def serve_dashboard(request: Request):
    """Serve the single-page application frontend dashboard."""
    # If the templates folder has our HTML, render it. Otherwise, return placeholder.
    if os.path.exists("templates/index.html"):
        return templates.TemplateResponse("index.html", {"request": request})
    return HTMLResponse(
        content="<h3>Frontend templates/index.html is being prepared! Please wait...</h3>", 
        status_code=200
    )

@app.get("/api/budget")
async def get_budget_state():
    """Retrieve the current user profile metadata and full logged expense roster."""
    return JSONResponse(content=state)

@app.post("/api/onboard")
async def onboard_user(user_data: UserOnboard):
    """Register or overwrite the user financial configuration parameters."""
    state["user"] = {
        "name": user_data.name.strip(),
        "profession": user_data.profession.strip(),
        "budget": round(user_data.budget, 2)
    }
    save_data()
    return JSONResponse(content={"status": "success", "user": state["user"]})

@app.post("/api/expenses")
async def add_expense(expense_data: ExpenseCreate):
    """Add an expense log. Performs auto-tagging if 'Auto' or an empty category is passed."""
    category = expense_data.category
    if not category or category.strip() == "" or category.lower() == "auto":
        category = auto_tag_category(expense_data.description)
    
    # Generate unique integer-based ID based on epoch or sequential index
    expense_id = 1 if not state["expenses"] else max(item["id"] for item in state["expenses"]) + 1
    
    new_expense = {
        "id": expense_id,
        "description": expense_data.description.strip(),
        "amount": round(expense_data.amount, 2),
        "category": category,
        "date": expense_data.date
    }
    
    state["expenses"].append(new_expense)
    save_data()
    return JSONResponse(content={"status": "success", "expense": new_expense})

@app.delete("/api/expenses/{expense_id}")
async def delete_expense(expense_id: int):
    """Remove a dedicated expense from the historical ledger."""
    original_len = len(state["expenses"])
    state["expenses"] = [item for item in state["expenses"] if item["id"] != expense_id]
    
    if len(state["expenses"]) == original_len:
        raise HTTPException(status_code=404, detail="Expense entry not found")
        
    save_data()
    return JSONResponse(content={"status": "success", "message": f"Expense reference {expense_id} deleted."})

@app.post("/api/reset")
async def reset_dashboard():
    """Purge the dataset for a clean slate."""
    state["user"] = None
    state["expenses"] = []
    save_data()
    return JSONResponse(content={"status": "success", "message": "State reset completed."})
