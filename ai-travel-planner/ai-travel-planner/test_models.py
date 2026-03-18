import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

models = [
    "gemma-3-1b-it" 
]

print("Testing models for quota...")
for name in models:
    try:
        model = genai.GenerativeModel(name)
        response = model.generate_content("hello")
        print(f"SUCCESS: {name} - Response received. First 50 chars: {str(response.text)[:50].encode('utf-8')}")
        break # Stop on first success
    except Exception as e:
        print(f"FAILED: {name} - {type(e).__name__}: {str(e)}")
