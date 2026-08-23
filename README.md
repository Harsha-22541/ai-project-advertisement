
# AI Product Advertisement Generator

A moderate-level AI for Generation & Automation project that analyzes a product image and automatically creates advertising content.

## Features

- Product image upload
- AI visual product understanding
- Product name suggestion
- Slogan generation
- Advertisement headline
- Product description
- Long-form ad copy
- Social media caption
- Hashtag generation
- SEO title and keywords
- Platform selection
- Tone selection
- Target audience selection
- Language selection
- Copy-to-clipboard
- Demo mode when no API key is configured

## Tech Stack

- Python
- FastAPI
- HTML/CSS/JavaScript
- OpenAI vision-capable model
- JSON API
- Responsive frontend

## Run locally

### 1. Create virtual environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

### 2. Install packages

```bash
pip install -r requirements.txt
```

### 3. Configure API key

Copy `.env.example` to `.env` and add your API key:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

### 4. Start server

```bash
uvicorn app:app --reload
```

Open:

http://127.0.0.1:8000

## Demo mode

If no API key is configured, the application still runs and demonstrates the complete UI with generated sample advertisement content.

## Project architecture

User → Frontend → FastAPI → Vision-capable AI Model → Structured Advertisement → Frontend

## Deployment

This project can be deployed on Render or another Python web hosting service. Add `OPENAI_API_KEY` as an environment variable in the hosting dashboard.
