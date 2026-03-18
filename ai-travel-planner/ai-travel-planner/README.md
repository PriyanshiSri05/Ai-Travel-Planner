# ✈ AI Travel Planner

A full-stack AI-powered travel planning web app. Type your destination and budget — get flights, hotels, a day-by-day itinerary, budget breakdown, and travel tips instantly.

---

## Project Structure

```
ai-travel-planner/
├── server.py               ← Flask backend + /api/plan endpoint
├── requirements.txt        ← Python dependencies
├── .env.example            ← API key template
├── templates/
│   └── index.html          ← Main web page
├── static/
│   ├── css/
│   │   └── style.css       ← All styles
│   └── js/
│       └── app.js          ← Frontend logic
└── README.md
```

---

## Setup (3 steps)

### 1. Install Python dependencies
```bash
cd ai-travel-planner
pip install -r requirements.txt
```

### 2. Add your Anthropic API key
```bash
cp .env.example .env
```
Edit `.env` and paste your key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Get your key at: https://console.anthropic.com

### 3. Run the app
```bash
python server.py
```

Open your browser at **http://localhost:5000** 🎉

---

## Example Queries

- `Plan a 3-day trip to Goa under ₹20,000 from Mumbai`
- `5-day Manali trip under ₹25,000 from Delhi`
- `Weekend trip to Coorg under ₹10,000 from Bangalore`
- `4 days in Jaipur under ₹15,000 from Chennai`

---

## What You Get

| Section | Details |
|---|---|
| Trip Summary | Destination, duration, budget, best season |
| Weather | Temp, humidity, sea temp, wind, sunrise |
| Visual Map | All key spots pinned on a map |
| Flights | 3 options with airlines, times, prices |
| Hotels | Budget / mid-range / luxury with pricing |
| Itinerary | Hour-by-hour plan for each day |
| Budget | Per-category breakdown + total vs budget |
| Tips | Transport, food, payments, apps |

---

## Deploy Online (Optional)

### Render.com (Free)
1. Push this folder to GitHub
2. Go to render.com → New Web Service
3. Set env var: `ANTHROPIC_API_KEY=sk-ant-...`
4. Build: `pip install -r requirements.txt`
5. Start: `python server.py`

### Railway / Fly.io
Same process — set the env var and deploy.

---

## Tech Stack

- **Backend**: Python + Flask
- **AI**: Anthropic Claude (claude-opus-4-5)
- **Frontend**: Vanilla HTML + CSS + JavaScript
- **Fonts**: Playfair Display + DM Sans + DM Mono
