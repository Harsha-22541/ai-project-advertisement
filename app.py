
import os, base64, json, uuid
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

BASE = Path(__file__).parent
UPLOADS = BASE / "uploads"
UPLOADS.mkdir(exist_ok=True)

app = FastAPI(title="AI Product Advertisement Generator")
app.mount("/static", StaticFiles(directory=BASE / "static"), name="static")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if os.getenv("OPENAI_API_KEY") else None

def fallback_ad(product_name, platform, tone, audience):
    name = product_name or "Your Product"
    return {
        "product_name": name,
        "slogan": f"{name} — Made to make every day better.",
        "headline": f"Meet {name}",
        "description": f"Discover {name}, designed for people who want quality, convenience and a better everyday experience.",
        "ad_copy": f"Upgrade your everyday routine with {name}. Thoughtfully designed, easy to use and made for modern lifestyles. Discover what makes it a smarter choice.",
        "social_caption": f"Meet {name}. Better design. Better experience. Better everyday moments. ✨",
        "hashtags": [f"#{name.replace(' ','')}", "#NewProduct", "#SmartChoice", "#Lifestyle", "#Innovation"],
        "call_to_action": "Discover More",
        "seo_title": f"{name} | Smart, Modern and Designed for You",
        "keywords": [name.lower(), "quality product", "modern lifestyle", "smart choice"],
        "target_audience": audience,
        "platform": platform,
        "tone": tone
    }

@app.get("/", response_class=HTMLResponse)
def home():
    return (BASE / "static" / "index.html").read_text(encoding="utf-8")

@app.post("/api/generate")
async def generate(
    image: UploadFile = File(...),
    product_name: str = Form(""),
    platform: str = Form("Instagram"),
    tone: str = Form("Professional"),
    audience: str = Form("General"),
    language: str = Form("English"),
    length: str = Form("Medium"),
):
    content = await image.read()
    if not content:
        return {"error": "Please upload an image."}

    if client is None:
        return {"mode": "demo", **fallback_ad(product_name, platform, tone, audience)}

    mime = image.content_type or "image/jpeg"
    encoded = base64.b64encode(content).decode("utf-8")

    prompt = f"""
You are an expert advertising copywriter and product marketer.
Analyze the uploaded product image carefully. Create a realistic advertisement.

Product name supplied by user: {product_name or "Infer a suitable product name from the image"}
Platform: {platform}
Tone: {tone}
Target audience: {audience}
Language: {language}
Length: {length}

Do not invent technical specifications, prices, certifications, ingredients, medical claims, or performance claims that cannot be verified from the image/user input.

Return ONLY valid JSON with exactly these keys:
product_name, slogan, headline, description, ad_copy, social_caption, hashtags,
call_to_action, seo_title, keywords, target_audience, platform, tone

hashtags and keywords must be arrays of strings.
"""

    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        response_format={"type": "json_object"},
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{encoded}"}}
            ]
        }],
        temperature=0.8,
    )
    data = json.loads(response.choices[0].message.content)
    data["mode"] = "ai"
    return data
