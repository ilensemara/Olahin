import os
import re
import tempfile
import base64
import json
import urllib.request
import urllib.error
import time

import numpy as np
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# Load environment variables manually from .env files
# ---------------------------------------------------------------------------
def load_env_file():
    env_paths = [".env", "../.env", "../backend/.env"]
    for path in env_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'").strip('"')
                        if k and k not in os.environ:
                            os.environ[k] = v
            except Exception:
                pass

load_env_file()

app = FastAPI(title="Olahin AI Engine", description="AI Service for Olahin Inventory Detection & NLP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Ingredient knowledge base
# ---------------------------------------------------------------------------
INGREDIENTS_DB = {
    "telur":        {"name": "Telur",        "category": "Daging & Telur", "unit": "pcs", "default_qty": 4,  "expiry_days": 14},
    "bawang merah": {"name": "Bawang Merah",  "category": "Bumbu",         "unit": "gr",  "default_qty": 100,"expiry_days": 14},
    "bawang putih": {"name": "Bawang Putih",  "category": "Bumbu",         "unit": "gr",  "default_qty": 50, "expiry_days": 20},
    "cabai":        {"name": "Cabai Merah",   "category": "Sayuran",       "unit": "gr",  "default_qty": 80, "expiry_days": 5},
    "bayam":        {"name": "Bayam",         "category": "Sayuran",       "unit": "gr",  "default_qty": 250,"expiry_days": 2},
    "ayam":         {"name": "Daging Ayam",   "category": "Daging & Telur","unit": "gr",  "default_qty": 500,"expiry_days": 3},
    "minyak":       {"name": "Minyak Goreng", "category": "Minyak & Lemak","unit": "ml",  "default_qty": 1000,"expiry_days": 180},
    "kecap":        {"name": "Kecap Manis",   "category": "Bumbu",         "unit": "ml",  "default_qty": 200,"expiry_days": 90},
    "wortel":       {"name": "Wortel",        "category": "Sayuran",       "unit": "gr",  "default_qty": 200,"expiry_days": 7},
    "kentang":      {"name": "Kentang",       "category": "Sayuran",       "unit": "gr",  "default_qty": 500,"expiry_days": 20},
    "tomat":        {"name": "Tomat",         "category": "Sayuran",       "unit": "gr",  "default_qty": 150,"expiry_days": 5},
    "apel":         {"name": "Apel",          "category": "Buah",          "unit": "pcs", "default_qty": 3,  "expiry_days": 7},
    "pisang":       {"name": "Pisang",        "category": "Buah",          "unit": "pcs", "default_qty": 5,  "expiry_days": 4},
    "jeruk":        {"name": "Jeruk",         "category": "Buah",          "unit": "pcs", "default_qty": 4,  "expiry_days": 7},
    "brokoli":      {"name": "Brokoli",       "category": "Sayuran",       "unit": "gr",  "default_qty": 300,"expiry_days": 5},
    "sawi":         {"name": "Sawi",          "category": "Sayuran",       "unit": "gr",  "default_qty": 200,"expiry_days": 3},
    "jahe":         {"name": "Jahe",          "category": "Bumbu",         "unit": "gr",  "default_qty": 50,  "expiry_days": 14},
    "kunyit":       {"name": "Kunyit",        "category": "Bumbu",         "unit": "gr",  "default_qty": 30,  "expiry_days": 14},
    "santan":       {"name": "Santan",        "category": "Bumbu",         "unit": "ml",  "default_qty": 200,"expiry_days": 7},
    "tempe":        {"name": "Tempe",         "category": "Protein Nabati","unit": "gr",  "default_qty": 250,"expiry_days": 5},
    "tahu":         {"name": "Tahu",          "category": "Protein Nabati","unit": "gr",  "default_qty": 250,"expiry_days": 3},
}

# ---- COCO class → ingredient key mapping for YOLO ----
COCO_TO_INGREDIENT = {
    47: "apel",     # apple
    49: "pisang",   # banana
    50: "jeruk",    # orange
    52: "pisang",   # banana (bunch of bananas → same)
    53: "jeruk",    # orange
    46: "wortel",   # carrot
    51: "brokoli",  # broccoli
    39: "kentang",  # potato
    40: "tomat",    # tomato
    56: "telur",    # egg
    57: "telur",    # egg (different variant)
}

# ---- English label/object → Indonesian ingredient key mapping for Cloud APIs ----
ENGLISH_TO_INGREDIENT = {
    "egg": "telur",
    "eggs": "telur",
    "shallot": "bawang merah",
    "shallots": "bawang merah",
    "onion": "bawang merah",
    "onions": "bawang merah",
    "garlic": "bawang putih",
    "chili": "cabai",
    "chiles": "cabai",
    "chili pepper": "cabai",
    "red chili": "cabai",
    "spinach": "bayam",
    "chicken": "ayam",
    "poultry": "ayam",
    "oil": "minyak",
    "cooking oil": "minyak",
    "soy sauce": "kecap",
    "carrot": "wortel",
    "carrots": "wortel",
    "potato": "kentang",
    "potatoes": "kentang",
    "tomato": "tomat",
    "tomatoes": "tomat",
    "apple": "apel",
    "apples": "apel",
    "banana": "pisang",
    "bananas": "pisang",
    "orange": "jeruk",
    "oranges": "jeruk",
    "citrus": "jeruk",
    "broccoli": "brokoli",
    "mustard greens": "sawi",
    "ginger": "jahe",
    "turmeric": "kunyit",
    "coconut milk": "santan",
    "tempeh": "tempe",
    "tofu": "tahu",
}

# ---- Quantity estimation heuristics per ingredient ----
QTY_RULES = {
    "pcs":  (2, 8),
    "gr":   (50, 1000),
    "ml":   (100, 1000),
}

# ---------------------------------------------------------------------------
# Lazy-load YOLO model
# ---------------------------------------------------------------------------
_yolo_model = None

def get_yolo():
    global _yolo_model
    if _yolo_model is None:
        try:
            from ultralytics import YOLO
            _yolo_model = YOLO("yolov8n.pt")
        except Exception as e:
            raise RuntimeError(f"Failed to load YOLO model: {e}")
    return _yolo_model

# ---------------------------------------------------------------------------
# Lazy-load Whisper model
# ---------------------------------------------------------------------------
_whisper_model = None

def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        try:
            import whisper
            _whisper_model = whisper.load_model("base")
        except Exception as e:
            raise RuntimeError(f"Failed to load Whisper model: {e}")
    return _whisper_model

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def estimate_quantity(unit: str, confidence: float) -> int:
    lo, hi = QTY_RULES.get(unit, (1, 5))
    base = int(np.interp(confidence, [0.25, 0.95], [lo, hi]))
    return max(lo, min(hi, base))

def parse_number(val_str: str) -> float:
    val_str = val_str.strip().lower()
    if val_str.isdigit():
        return float(val_str)
    
    word_map = {
        "setengah": 0.5,
        "satu": 1.0,
        "dua": 2.0,
        "tiga": 3.0,
        "empat": 4.0,
        "lima": 5.0,
        "enam": 6.0,
        "tujuh": 7.0,
        "delapan": 8.0,
        "sembilan": 9.0,
        "sepuluh": 10.0,
        "sebelas": 11.0,
        "seratus": 100.0,
        "dua ratus": 200.0,
        "tiga ratus": 300.0,
        "empat ratus": 400.0,
        "lima ratus": 500.0,
    }
    return word_map.get(val_str, 1.0)

def normalize_qty_and_unit(qty: float, unit_str: str, default_unit: str) -> tuple:
    if not unit_str:
        return qty, default_unit
        
    unit_str = unit_str.strip().lower()
    
    if unit_str in ["kg", "kilo", "kilogram"]:
        return qty * 1000.0, "gr"
    elif unit_str in ["gram", "gr", "g"]:
        return qty, "gr"
    elif unit_str in ["liter", "l", "lt"]:
        return qty * 1000.0, "ml"
    elif unit_str in ["ml", "mili", "mililiter"]:
        return qty, "ml"
    elif unit_str in ["butir", "telur", "telor", "buah", "biji", "pcs", "siung"]:
        return qty, "pcs"
    elif unit_str in ["ikat"]:
        return qty, default_unit
        
    return qty, default_unit

def extract_numbers_from_transcript(text: str) -> dict:
    """Parse numbers + units from transcript for ingredients."""
    results = {}
    num_pattern = r'(\d+|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|seratus|dua ratus|tiga ratus|empat ratus|lima ratus|setengah)'
    unit_pattern = r'(gram|gr|g|kg|kilo|kilogram|ml|mili|mililiter|liter|l|lt|butir|telur|telor|buah|biji|pcs|siung|ikat)'
    
    text_lower = text.lower()
    
    for keyword, info in INGREDIENTS_DB.items():
        if keyword not in text_lower:
            continue
            
        pattern_after = rf'{re.escape(keyword)}\s+(?:ada|sebanyak|sekitar\s+)?\s*{num_pattern}\s*{unit_pattern}?'
        match_after = re.search(pattern_after, text_lower)
        
        pattern_before = rf'{num_pattern}\s*{unit_pattern}?\s+(?:dari|berupa\s+)?\s*{re.escape(keyword)}'
        match_before = re.search(pattern_before, text_lower)
        
        match = match_after or match_before
        if match:
            qty_str = match.group(1)
            unit_str = match.group(2) if len(match.groups()) >= 2 else None
            
            qty = parse_number(qty_str)
            qty, unit = normalize_qty_and_unit(qty, unit_str, info["unit"])
            results[keyword] = {"quantity": int(qty), "unit": unit}
            
    return results

# ---------------------------------------------------------------------------
# Cloud Vision & Clarifai integration logic
# ---------------------------------------------------------------------------
def detect_google_vision(image_bytes: bytes, api_key: str) -> list:
    url = f"https://vision.googleapis.com/v1/images:annotate?key={api_key}"
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    payload = {
        "requests": [
            {
                "image": {"content": base64_image},
                "features": [
                    {"type": "LABEL_DETECTION", "maxResults": 15},
                    {"type": "OBJECT_LOCALIZATION", "maxResults": 15}
                ]
            }
        ]
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            detected_keys = {}
            responses = res_data.get("responses", [])
            if not responses:
                return []
                
            resp = responses[0]
            
            # Localized Objects
            objects = resp.get("localizedObjectAnnotations", [])
            for obj in objects:
                name = obj.get("name", "").lower()
                score = obj.get("score", 0.0)
                if score < 0.3:
                    continue
                ing_key = ENGLISH_TO_INGREDIENT.get(name)
                if ing_key:
                    if ing_key in detected_keys:
                        detected_keys[ing_key]["quantity"] += 1
                        detected_keys[ing_key]["confidence"] = max(detected_keys[ing_key]["confidence"], score)
                    else:
                        info = INGREDIENTS_DB[ing_key]
                        detected_keys[ing_key] = {
                            "name": info["name"],
                            "category": info["category"],
                            "unit": info["unit"],
                            "quantity": 1,
                            "expiry_days": info["expiry_days"],
                            "confidence": score
                        }
                        
            # Label Annotations (fallbacks)
            labels = resp.get("labelAnnotations", [])
            for label in labels:
                name = label.get("description", "").lower()
                score = label.get("score", 0.0)
                if score < 0.5:
                    continue
                ing_key = ENGLISH_TO_INGREDIENT.get(name)
                if ing_key and ing_key not in detected_keys:
                    info = INGREDIENTS_DB[ing_key]
                    qty = estimate_quantity(info["unit"], score)
                    detected_keys[ing_key] = {
                        "name": info["name"],
                        "category": info["category"],
                        "unit": info["unit"],
                        "quantity": qty,
                        "expiry_days": info["expiry_days"],
                        "confidence": score
                    }
                    
            # For quantities of things like gr/ml, estimate based on confidence
            for key, val in detected_keys.items():
                if val["unit"] in ["gr", "ml"] and val["quantity"] == 1:
                    val["quantity"] = estimate_quantity(val["unit"], val["confidence"])
                    
            return [{k: v for k, v in item.items() if k != "confidence"} for item in detected_keys.values()]
    except Exception as e:
        print(f"Google Cloud Vision API failed: {e}")
        return []

def detect_clarifai(image_bytes: bytes, api_key: str) -> list:
    url = "https://api.clarifai.com/v2/models/aaa03c23b3724a16a56b629203edc62c/outputs"
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    payload = {
        "inputs": [
            {
                "data": {
                    "image": {"base64": base64_image}
                }
            }
        ]
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f"Key {api_key}"
        }
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            detected_keys = {}
            outputs = res_data.get("outputs", [])
            if not outputs:
                return []
                
            concepts = outputs[0].get("data", {}).get("concepts", [])
            for concept in concepts:
                name = concept.get("name", "").lower()
                score = concept.get("value", 0.0)
                if score < 0.4:
                    continue
                    
                ing_key = ENGLISH_TO_INGREDIENT.get(name)
                if ing_key and ing_key not in detected_keys:
                    info = INGREDIENTS_DB[ing_key]
                    qty = estimate_quantity(info["unit"], score)
                    detected_keys[ing_key] = {
                        "name": info["name"],
                        "category": info["category"],
                        "unit": info["unit"],
                        "quantity": qty,
                        "expiry_days": info["expiry_days"]
                    }
                    
            return list(detected_keys.values())
    except Exception as e:
        print(f"Clarifai API failed: {e}")
        return []

# ---------------------------------------------------------------------------
# AssemblyAI & Google Speech transcription logic
# ---------------------------------------------------------------------------
def transcribe_assemblyai(audio_bytes: bytes, api_key: str) -> str:
    # 1. Upload audio file
    upload_url = "https://api.assemblyai.com/v2/upload"
    req_upload = urllib.request.Request(
        upload_url,
        data=audio_bytes,
        headers={
            "authorization": api_key,
            "content-type": "application/octet-stream"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req_upload, timeout=15) as resp:
            upload_res = json.loads(resp.read().decode('utf-8'))
            audio_url = upload_res.get("upload_url")
    except Exception as e:
        print(f"AssemblyAI Upload failed: {e}")
        return ""
        
    if not audio_url:
        return ""
        
    # 2. Start transcription
    transcript_url = "https://api.assemblyai.com/v2/transcript"
    payload = {
        "audio_url": audio_url,
        "language_code": "id"
    }
    req_trans = urllib.request.Request(
        transcript_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "authorization": api_key,
            "content-type": "application/json"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req_trans, timeout=10) as resp:
            trans_res = json.loads(resp.read().decode('utf-8'))
            transcript_id = trans_res.get("id")
    except Exception as e:
        print(f"AssemblyAI Transcription start failed: {e}")
        return ""
        
    if not transcript_id:
        return ""
        
    # 3. Poll status
    poll_url = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
    for _ in range(30):
        req_poll = urllib.request.Request(
            poll_url,
            headers={"authorization": api_key}
        )
        try:
            with urllib.request.urlopen(req_poll, timeout=10) as resp:
                poll_res = json.loads(resp.read().decode('utf-8'))
                status = poll_res.get("status")
                if status == "completed":
                    return poll_res.get("text", "")
                elif status == "failed":
                    print("AssemblyAI Transcription failed on server side.")
                    return ""
        except Exception as e:
            print(f"AssemblyAI Polling failed: {e}")
            return ""
        time.sleep(1)
        
    return ""

def transcribe_google_speech(audio_bytes: bytes, api_key: str) -> str:
    url = f"https://speech.googleapis.com/v1/speech:recognize?key={api_key}"
    base64_audio = base64.b64encode(audio_bytes).decode('utf-8')
    payload = {
        "config": {
            "encoding": "LINEAR16",
            "languageCode": "id-ID"
        },
        "audio": {
            "content": base64_audio
        }
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            results = res_data.get("results", [])
            if not results:
                return ""
            return results[0].get("alternatives", [{}])[0].get("transcript", "")
    except Exception as e:
        print(f"Google Speech-to-Text API failed: {e}")
        return ""

# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/")
def read_root():
    integrations = {
        "google_vision": "GOOGLE_API_KEY" in os.environ or "GOOGLE_APPLICATION_CREDENTIALS" in os.environ,
        "clarifai": "CLARIFAI_API_KEY" in os.environ,
        "assemblyai": "ASSEMBLYAI_API_KEY" in os.environ,
        "google_speech": "GOOGLE_API_KEY" in os.environ or "GOOGLE_APPLICATION_CREDENTIALS" in os.environ,
    }
    return {
        "status": "running", 
        "service": "Olahin AI Engine",
        "integrations": integrations
    }

# ---------------------------------------------------------------------------
# Camera - Cloud API with local YOLOv8 fallback
# ---------------------------------------------------------------------------
@app.post("/detect-ingredients")
async def detect_ingredients(file: UploadFile = File(...)):
    # Validate file type
    is_image = False
    if file.content_type and file.content_type.startswith("image/"):
        is_image = True
    elif file.filename:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"]:
            is_image = True
            
    if not is_image:
        raise HTTPException(400, "File must be an image")

    contents = await file.read()

    # 1. Try Google Cloud Vision
    google_key = os.environ.get("GOOGLE_API_KEY")
    if google_key:
        detected = detect_google_vision(contents, google_key)
        if detected:
            return {
                "success": True,
                "message": "Google Cloud Vision API detected ingredients successfully.",
                "detected_items": detected
            }

    # 2. Try Clarifai
    clarifai_key = os.environ.get("CLARIFAI_API_KEY")
    if clarifai_key:
        detected = detect_clarifai(contents, clarifai_key)
        if detected:
            return {
                "success": True,
                "message": "Clarifai API detected ingredients successfully.",
                "detected_items": detected
            }

    # 3. Fallback to local YOLOv8
    try:
        model = get_yolo()
    except RuntimeError as e:
        raise HTTPException(503, f"YOLO model unavailable and no cloud keys set: {e}")

    tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    tmp.write(contents)
    tmp.close()

    results = model(tmp.name, conf=0.3, iou=0.5)
    os.unlink(tmp.name)

    detections = results[0].boxes
    seen = {}

    for box in detections:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        ing_key = COCO_TO_INGREDIENT.get(cls_id)
        if not ing_key:
            continue

        info = INGREDIENTS_DB[ing_key]

        if ing_key in seen:
            seen[ing_key]["quantity"] += estimate_quantity(info["unit"], conf)
            seen[ing_key]["confidence"] = max(seen[ing_key]["confidence"], conf)
        else:
            seen[ing_key] = {
                "name": info["name"],
                "category": info["category"],
                "unit": info["unit"],
                "quantity": estimate_quantity(info["unit"], conf),
                "expiry_days": info["expiry_days"],
                "confidence": round(conf, 3),
            }

    detected_items = list(seen.values())

    return {
        "success": True,
        "message": f"Local YOLO detected {len(detected_items)} ingredient types from image (Fallback).",
        "detected_items": [
            {k: v for k, v in item.items() if k != "confidence"}
            for item in detected_items
        ],
    }

# ---------------------------------------------------------------------------
# Voice - Cloud API with local Whisper fallback
# ---------------------------------------------------------------------------
@app.post("/voice-to-text")
async def voice_to_text(audio: UploadFile = File(...), language: str = Form("id")):
    # Validate file type
    is_audio = False
    if audio.content_type and audio.content_type.startswith("audio/"):
        is_audio = True
    elif audio.filename:
        ext = os.path.splitext(audio.filename)[1].lower()
        if ext in [".wav", ".mp3", ".m4a", ".caf", ".3gp", ".ogg", ".aac", ".flac", ".webm"]:
            is_audio = True
            
    if not is_audio:
        raise HTTPException(400, "File must be an audio file")

    contents = await audio.read()
    transcript = ""

    # 1. Try AssemblyAI
    assembly_key = os.environ.get("ASSEMBLYAI_API_KEY")
    if assembly_key:
        transcript = transcribe_assemblyai(contents, assembly_key)

    # 2. Try Google Speech-to-Text
    google_key = os.environ.get("GOOGLE_API_KEY")
    if not transcript and google_key:
        transcript = transcribe_google_speech(contents, google_key)

    # 3. Fallback to Local Whisper
    if not transcript:
        try:
            model = get_whisper()
        except RuntimeError as e:
            raise HTTPException(503, f"Whisper model unavailable and no cloud keys set: {e}")

        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        tmp.write(contents)
        tmp.close()

        try:
            lang = language.split("-")[0] if language else "id"
            result = model.transcribe(tmp.name, language=lang)
            transcript = result["text"].strip().lower()
        except Exception as e:
            os.unlink(tmp.name)
            raise HTTPException(500, f"Whisper transcription failed: {e}")
        os.unlink(tmp.name)
    else:
        transcript = transcript.strip().lower()

    # Extract ingredient mentions from transcript
    extracted_items = []
    parsed_qty = extract_numbers_from_transcript(transcript)

    for keyword, info in INGREDIENTS_DB.items():
        if keyword in transcript:
            qty_info = parsed_qty.get(keyword, {})
            qty = qty_info.get("quantity", info["default_qty"])
            unit = qty_info.get("unit", info["unit"])

            extracted_items.append({
                "name": info["name"],
                "category": info["category"],
                "unit": unit,
                "quantity": qty,
                "expiry_days": info["expiry_days"],
            })

    return {
        "success": True,
        "transcript": transcript,
        "extracted_items": extracted_items,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
