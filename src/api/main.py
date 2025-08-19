from fastapi import FastAPI
from pydantic import BaseModel
import cv2
import tensorflow as tf
import base64
import numpy as np
import asyncio
from fastapi.middleware.cors import CORSMiddleware

import os
from dotenv import load_dotenv

load_dotenv()

semaphore = asyncio.Semaphore(2) 

app = FastAPI()

class ImageData(BaseModel):
    photo: str

origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)


# Load model once globally
class_names = ["A", "B", "C", "D", "E", "F", "G", "I", "J", "K", "L", "M", "N", "NO SIGN SHOWN", "O", "P", "Q", "R"]

def load_and_preprocess_image(img):
    img = tf.convert_to_tensor(img, dtype=tf.float32)
    img = tf.image.resize(img, [256, 256])
    img = tf.expand_dims(img, axis=0) 
    return img

def predict(input_tensor):
    model = tf.keras.models.load_model(os.getenv("MODEL"))
    predictions = model.predict(input_tensor)
    predicted_class = tf.argmax(predictions[0]).numpy()
    classification = class_names[predicted_class]
    return classification

def process_image(photo_str: str):

    if "," in photo_str:
        _, encoded = photo_str.split(",", 1)
    else:
        encoded = photo_str

    img_bytes = base64.b64decode(encoded)
    
    nparr = np.frombuffer(img_bytes, np.uint8)

    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    cropped_hand = imgRGB[100:375, 750:1025]
    
    processed_img = load_and_preprocess_image(cropped_hand)
    prediction = predict(processed_img)
    return prediction

@app.post("/process_image")
async def process_image_endpoint(image: ImageData):

    prediction = process_image(image.photo)

    return {"response": prediction}

