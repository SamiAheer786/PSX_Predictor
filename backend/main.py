import os
import requests
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from scraper import scrape_company, scrape_equity, scrape_quote

# ─────────────────────────────────────────────
# APP SETUP
# ─────────────────────────────────────────────
app = FastAPI(title="AskAnalyst Clone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# LOAD COMPANY LIST
# ─────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), "..")
COMPANY_FILE = os.path.join(DATA_DIR, "company_name_value.xls")

_companies_cache = None


def get_companies():
    global _companies_cache
    if _companies_cache is None:
        df = pd.read_csv(COMPANY_FILE)
        _companies_cache = df.to_dict(orient="records")
    return _companies_cache


# ─────────────────────────────────────────────
# ASKANALYST API PROXY HELPERS
# ─────────────────────────────────────────────
ASK_BASE = "https://api.askanalyst.com.pk/api"


def proxy_get(path: str):
    """Fetch JSON from AskAnalyst API."""
    url = f"{ASK_BASE}/{path}"
    try:
        res = requests.get(url, timeout=20)
        res.raise_for_status()
        return res.json()
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=res.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {str(e)}")


# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────


@app.get("/")
def root():
    return {"message": "AskAnalyst Clone API", "version": "1.0.0"}


@app.get("/api/companies")
def list_companies():
    """Return all 360 PSX-listed companies."""
    return get_companies()


@app.get("/api/company/{company_id}/financials")
def get_financials(company_id: int):
    """Financial summary: EPS, DPS, BVPS, margins, etc."""
    return proxy_get(f"companyfinancialnew/{company_id}?companyfinancial=true&test=true")


@app.get("/api/company/{company_id}/industry")
def get_industry(company_id: int):
    """Industry average metrics for comparison."""
    return proxy_get(f"industrynew/{company_id}")


@app.get("/api/company/{company_id}/stockdata")
def get_stock_data(company_id: int):
    """Stock price data: shares, prices, returns."""
    return proxy_get(f"stockpricedatanew/{company_id}")


@app.get("/api/company/{company_id}/ratios")
def get_ratios(company_id: int):
    """Financial ratios: Valuation, Margins, Returns, Health, Activity, Growth."""
    return proxy_get(f"rationew/{company_id}")


@app.get("/api/company/{company_id}/balance-sheet")
def get_balance_sheet(company_id: int):
    """Balance sheet: annual + quarterly."""
    return proxy_get(f"bs/{company_id}")


@app.get("/api/company/{company_id}/income-statement")
def get_income_statement(company_id: int):
    """Income statement: annual + quarterly."""
    return proxy_get(f"is/{company_id}")


@app.get("/api/company/{company_id}/cash-flow")
def get_cash_flow(company_id: int):
    """Cash flow statement: annual + quarterly."""
    return proxy_get(f"cf/{company_id}")


@app.get("/api/company/{symbol}/quote")
def get_quote(symbol: str):
    """Live quote scraped from PSX."""
    return scrape_quote(symbol.upper())


@app.get("/api/company/{symbol}/profile")
def get_profile(symbol: str):
    """Company profile scraped from PSX (business description, key people, etc.)."""
    return scrape_company(symbol.upper())


@app.get("/api/company/{symbol}/equity")
def get_equity(symbol: str):
    """Equity stats scraped from PSX."""
    return scrape_equity(symbol.upper())


@app.get("/api/company/{company_id}/overview")
def get_overview(company_id: int):
    """Aggregated overview: finds company by ID, fetches financials + industry + stock data."""
    companies = get_companies()
    company = next((c for c in companies if c["value"] == company_id), None)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    symbol = company["symbol"]

    return {
        "company": company,
        "financials": proxy_get(f"companyfinancialnew/{company_id}?companyfinancial=true&test=true"),
        "industry": proxy_get(f"industrynew/{company_id}"),
        "stock_data": proxy_get(f"stockpricedatanew/{company_id}"),
        "chart_data": proxy_get(f"stockchartnew/{company_id}"),
        "quote": scrape_quote(symbol),
        "profile": scrape_company(symbol),
    }


@app.get("/api/company/{company_id}/chart")
def get_chart_data(company_id: int):
    """Stock chart data: 1D, 1M, 1Y etc."""
    return proxy_get(f"stockchartnew/{company_id}")


# ─────────────────────────────────────────────
# RUN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
