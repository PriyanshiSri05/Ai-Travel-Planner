import os
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load env
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=".env")

# Configure API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment.")
genai.configure(api_key=api_key)

# Create model
# Using gemma-3-1b-it as a fallback since the API key has exceeded Gemini quotas
model = genai.GenerativeModel("gemma-3-1b-it")

app = Flask(__name__)
CORS(app)

SYSTEM_PROMPT = """You are an expert Indian travel planner. 
Support multi-city trips and complex backpacking routes if the user asks for them.
Return ONLY JSON.

{
  "destination": "Trip Name",
  "cities": ["A", "B"],
  "days": 3,
  "from_city": "Origin",
  "total_cost": 15000,
  "weather": {
    "temp": "25-30°C",
    "condition": "Sunny",
    "humidity": "45%",
    "wind": "10 km/h"
  },
  "packing_list": ["Sunscreen", "Cotton clothes"],
  "map_spots": [
    {"name": "Landmark A", "description": "Must visit", "lat": 28.6, "lon": 77.2}
  ],
  "flights": [{"airline": "IndiGo", "departure_city": "X", "origin_iata": "XXX", "arrival_city": "Y", "destination_iata": "YYY", "departure_date": "2024-04-10", "price": 4000}],
  "hotels": [{"name": "Hotel X", "type": "Mid-range", "description": "Near center", "estimated_nightly_cost": 2500}],
  "itinerary": [{"day": 1, "theme": "City Tour", "activities": [{"time": "10:00", "activity": "Park", "description": "Visit park", "cost": 0}]}],
  "budget": [{"category": "Stay", "cost": 7500}, {"category": "Travel", "cost": 5000}, {"category": "Other", "cost": 2500}],
  "tips": ["Carry Cash", "Water bottle"]
}

Important: Sum of budget costs MUST match total_cost. NEVER omit any array, even if empty.
"""

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/plan", methods=["POST"])
def plan():
    data = request.get_json()

    query = data.get("query", "")
    diet = data.get("diet", "")
    vibe = data.get("vibe", "")

    try:
        diet_instruction = f"\nDietary Preference: {diet}." if diet else ""
        vibe_instruction = f"\nTrip Vibe: {vibe}." if vibe else ""
        
        prompt = f"""
{SYSTEM_PROMPT}

Travel request: {query}{diet_instruction}{vibe_instruction}
"""

        response = model.generate_content(prompt)
        raw = response.text
        print("RAW RESPONSE FROM AI:", raw)

        # More robust JSON extraction
        import re
        json_match = re.search(r"(\{.*\}|\[.*\])", raw, re.DOTALL)
        if json_match:
            clean = json_match.group(0)
        else:
            clean = raw

        try:
            result = json.loads(clean)
        except Exception as json_err:
            print("JSON PARSE ERROR:", json_err)
            result = {
                "destination": "Error Parsing Plan",
                "days": 0,
                "from_city": "N/A",
                "total_cost": 0,
                "weather": {"temp": "N/A", "condition": "N/A", "humidity": "N/A", "wind": "N/A"},
                "packing_list": [],
                "map_spots": [],
                "flights": [],
                "hotels": [],
                "itinerary": [],
                "budget": [],
                "tips": ["The AI response was not in a valid format. Please try again with a simpler prompt."]
            }

        return jsonify(result)

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)})


@app.route("/api/replan", methods=["POST"])
def replan():
    data = request.get_json()
    current_plan = data.get("current_plan", {})
    instruction = data.get("instruction", "")

    try:
        prompt = f"""
{SYSTEM_PROMPT}

Current Trip Plan (JSON):
{json.dumps(current_plan)}

User instruction for adjustment: {instruction}

Task: Update the current plan based on the instruction. Return the FULL updated JSON.
If the instruction is to "optimize cost", find ways to reduce the total_cost by suggesting cheaper hotels/flights while keeping the itinerary similar.
"""

        response = model.generate_content(prompt)
        raw = response.text
        
        import re
        json_match = re.search(r"(\{.*\}|\[.*\])", raw, re.DOTALL)
        if json_match:
            clean = json_match.group(0)
            result = json.loads(clean)
        else:
            result = {"error": "Could not parse adjusted plan"}

        return jsonify(result)

    except Exception as e:
        print("REPLAN ERROR:", e)
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)