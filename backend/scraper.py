import requests
from bs4 import BeautifulSoup

BASE_URL = "https://dps.psx.com.pk/company/"
HEADERS = {"User-Agent": "Mozilla/5.0"}


def scrape_company(symbol: str) -> dict:
    """Scrape company profile from PSX."""
    url = f"{BASE_URL}{symbol}"
    data = {"symbol": symbol}

    try:
        res = requests.get(url, headers=HEADERS, timeout=20)
        res.raise_for_status()
    except Exception as e:
        data["error"] = f"PSX Error: {str(e)}"
        return data

    soup = BeautifulSoup(res.text, "html.parser")

    # Business Description
    business_section = soup.find(
        "div",
        class_="item__head",
        string=lambda t: t and "BUSINESS DESCRIPTION" in t.upper(),
    )
    if business_section:
        desc = []
        for sib in business_section.find_next_siblings():
            if sib.name == "div" and "item__head" in sib.get("class", []):
                break
            desc.append(sib.get_text(strip=True))
        data["business_description"] = " ".join(desc).strip()

    # Key People
    key_people_section = soup.find("div", class_="profile__item--people")
    if key_people_section:
        people = []
        for row in key_people_section.select("table.tbl tbody tr"):
            cols = row.find_all("td")
            if len(cols) >= 2:
                people.append(
                    {"name": cols[0].get_text(strip=True), "role": cols[1].get_text(strip=True)}
                )
        data["key_people"] = people

    # Other Profile Fields
    for item in soup.select("div.profile__item"):
        for head in item.find_all("div", class_="item__head"):
            key = head.get_text(strip=True).lower().replace(" ", "_")
            val_tag = head.find_next_sibling(["p", "a"])
            if val_tag:
                data[key] = val_tag.get_text(strip=True)

    return data


def scrape_equity(symbol: str) -> dict:
    """Scrape equity stats from PSX."""
    url = f"{BASE_URL}{symbol}"
    data = {"symbol": symbol}

    try:
        res = requests.get(url, headers=HEADERS, timeout=20)
        res.raise_for_status()
    except Exception as e:
        data["error"] = f"Equity Error: {str(e)}"
        return data

    soup = BeautifulSoup(res.text, "html.parser")
    equity_section = soup.find("div", id="equity")

    if not equity_section:
        data["error"] = "Equity section not found"
        return data

    for item in equity_section.select("div.stats_item"):
        label_tag = item.find("div", class_="stats_label")
        value_tag = item.find("div", class_="stats_value")
        if label_tag and value_tag:
            label = label_tag.get_text(strip=True).lower().replace(" ", "_").replace("'", "")
            data[label] = value_tag.get_text(strip=True)

    return data


def scrape_quote(symbol: str) -> dict:
    """Scrape live quote from PSX."""
    url = f"{BASE_URL}{symbol}"

    try:
        res = requests.get(url, headers=HEADERS, timeout=20)
        res.raise_for_status()
    except Exception as e:
        return {"error": f"Quote Error: {str(e)}"}

    soup = BeautifulSoup(res.text, "html.parser")

    name = soup.select_one(".quote__name")
    sector = soup.select_one(".quote__sector span")
    close_price = soup.select_one(".quote__close")
    change_value = soup.select_one(".change__value")
    change_percent = soup.select_one(".change__percent")

    stats = {
        item.select_one(".stats_label").text.strip(): item.select_one(".stats_value").text.strip()
        for item in soup.select(".stats_item")
        if item.select_one(".stats_label") and item.select_one(".stats_value")
    }

    return {
        "company": name.text.strip() if name else "N/A",
        "sector": sector.text.strip() if sector else "N/A",
        "last_close": close_price.text.strip() if close_price else "N/A",
        "change": change_value.text.strip() if change_value else "N/A",
        "change_percent": change_percent.text.strip() if change_percent else "N/A",
        "open": stats.get("Open", "N/A"),
        "high": stats.get("High", "N/A"),
        "low": stats.get("Low", "N/A"),
        "volume": stats.get("Volume", "N/A"),
        "circuit_breaker": stats.get("CIRCUIT BREAKER", "N/A"),
        "day_range": stats.get("DAY RANGE", "N/A"),
        "week_52_range": stats.get("52-WEEK RANGE ^", "N/A"),
        "pe_ratio": stats.get("P/E Ratio (TTM) **", "N/A"),
        "one_year_change": stats.get("1-Year Change * ^", "N/A"),
        "ytd_change": stats.get("YTD Change * ^", "N/A"),
    }
