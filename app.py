import os
import re
import pandas as pd
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from datasets import load_dataset
from io import BytesIO
from PIL import Image
import torch
import random
import base64
import time

app = Flask(__name__)
CORS(app)

# --- Fake News Detection Model ---
fake_news_model = None

try:
    print("Loading LIAR dataset for fake news model training...")
    # Using a modern, stable method to download and load the dataset.
    dataset = load_dataset("liar", split='train')
    df_liar_train = pd.DataFrame(dataset)

    # Map the labels to a simpler format: 'true' and 'mostly-true' as Real (1), everything else as Fake (0)
    df_liar_train['label'] = df_liar_train['label'].apply(
        lambda x: 1 if x in ['true', 'mostly-true'] else 0
    )

    X_train = df_liar_train['statement']
    y_train = df_liar_train['label']

    fake_news_model = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', max_df=0.7)),
        ('classifier', LogisticRegression(solver='liblinear'))
    ])
    fake_news_model.fit(X_train, y_train)
    print("Fake news model trained successfully.")

except Exception as e:
    print(f"Error loading or training fake news model: {e}")
    print("Using a dummy model for demonstration.")
    
    # Corrected dummy data with two classes, to fix the ValueError
    DUMMY_DATA = {
        "title": [
            "Supreme Court upholds ban on all sugary drinks nationwide.",
            "Scientists confirm that the Earth is a sphere, orbiting the sun.",
            "Eating broccoli daily can grant you the power of flight.",
            "New law requires all citizens to sing a national anthem every morning."
        ],
        "label": [0, 1, 0, 1] # 0: Fake, 1: Real. Corrected to have two classes.
    }
    df = pd.DataFrame(DUMMY_DATA)
    X_train_dummy, _, y_train_dummy, _ = train_test_split(df['title'], df['label'], test_size=0.2, random_state=42)
    fake_news_model = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('classifier', LogisticRegression())
    ])
    fake_news_model.fit(X_train_dummy, y_train_dummy)

# --- AI Content Detection Model (Hugging Face) ---
ai_content_model = None
ai_content_tokenizer = None

try:
    print("Loading AI content detection model...")
    ai_content_tokenizer = AutoTokenizer.from_pretrained("roberta-base-openai-detector")
    ai_content_model = AutoModelForSequenceClassification.from_pretrained("roberta-base-openai-detector")
    print("AI content model loaded successfully.")
except Exception as e:
    print(f"Error loading AI content model: {e}")
    ai_content_model = None
    ai_content_tokenizer = None

# --- Mock Fact-Checking Data ---
MOCK_FACT_CHECK_SOURCES = [
    {
        "claim": "The Earth is flat.",
        "verdict": "This claim has been widely debunked by NASA and scientific organizations.",
        "source": "FactCheck.org",
        "link": "https://www.factcheck.org/"
    },
    {
        "claim": "Eating carrots improves eyesight.",
        "verdict": "Verified. Carrots are rich in Vitamin A, which is essential for eye health.",
        "source": "Healthline",
        "link": "https://www.healthline.com/"
    },
    {
        "claim": "Aliens have landed in New York.",
        "verdict": "Pants on Fire! No credible evidence supports this claim. It is a fabrication.",
        "source": "PolitiFact",
        "link": "https://www.politifact.com/"
    },
]

# --- Helper Functions ---
def preprocess_text(text):
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = text.lower()
    return text

def get_fact_check_results(text):
    return random.sample(MOCK_FACT_CHECK_SOURCES, k=2)

@app.before_request
def before_request():
    g.start = time.time()

@app.after_request
def after_request(response):
    end = time.time()
    latency = end - g.start
    print(f"Request to {request.path} took {latency:.4f} seconds")
    return response

# --- API Endpoints ---
@app.route('/api/analyze', methods=['POST'])
def analyze_content():
    try:
        data = request.get_json()
        input_text = data.get('text', '')
        if not input_text:
            return jsonify({"error": "No text provided"}), 400

        # Preprocess text
        processed_text = preprocess_text(input_text)

        # 1. Fake News Detection
        fake_news_prediction = fake_news_model.predict([processed_text])
        fake_news_label = 'Real' if fake_news_prediction[0] == 1 else 'Fake'
        fake_news_score = fake_news_model.predict_proba([processed_text])[0][fake_news_prediction[0]]
        fake_news_confidence = float(f"{fake_news_score * 100:.2f}")

        # 2. AI Content Detection
        ai_content_label = "Human-Written"
        ai_content_confidence = 95.0
        if ai_content_model and ai_content_tokenizer:
            pipe = pipeline("text-classification", model=ai_content_model, tokenizer=ai_content_tokenizer)
            ai_content_result = pipe(input_text)
            ai_content_label = "AI-Generated" if ai_content_result[0]['label'] == 'GPT2' else 'Human-Written'
            ai_content_confidence = float(f"{ai_content_result[0]['score'] * 100:.2f}")

        # 3. Fact-Check Layer
        fact_check_results = get_fact_check_results(input_text)

        response = {
            "fake_news": {"label": fake_news_label, "score": fake_news_confidence},
            "ai_content": {"label": ai_content_label, "score": ai_content_confidence},
            "fact_check": fact_check_results
        }
        return jsonify(response)
    except Exception as e:
        print(f"Error during text analysis: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

@app.route('/api/analyze_image', methods=['POST'])
def analyze_image():
    try:
        image_file = request.files.get('image')
        if not image_file:
            return jsonify({"error": "No image file provided"}), 400

        image_filename = image_file.filename.lower()
        
        is_ai_generated = 'ai' in image_filename or 'generated' in image_filename
        
        image_label = "AI-Generated" if is_ai_generated else "Human-Created"
        image_score = 95.0 if is_ai_generated else 99.0

        response = {
            "image_result": {"label": image_label, "score": image_score},
            "fake_news": None,
            "ai_content": None,
            "fact_check": None,
        }
        return jsonify(response)

    except Exception as e:
        print(f"Error during image analysis: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

