from fastapi import FastAPI
from pydantic import BaseModel
import cv2
import tensorflow as tf
import base64
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

import os
from dotenv import load_dotenv

import mediapipe as mp

hands = mp.solutions.hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.4,
    min_tracking_confidence=0.4
)

load_dotenv()

app = FastAPI()


class ImageData(BaseModel):
    screenshot: str
    request_option: str

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

model = tf.keras.models.load_model(os.getenv("MODEL"))


# Load model once globally
class_names = ["A", "B", "C", "D", "E", "F", "G", "I", "J", "K", "L", "M", "N", "NO SIGN SHOWN", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

def load_and_preprocess_image(img):
    img = tf.convert_to_tensor(img, dtype=tf.float32)
    img = tf.image.resize(img, [256, 256])
    img = tf.expand_dims(img, axis=0) 
    return img

def predict(input_tensor):
    predictions = model.predict(input_tensor)
    predicted_class = tf.argmax(predictions[0]).numpy()
    classification = class_names[predicted_class]
    return classification

def get_box_position(input_tensor):

    padding = 35

    results = hands.process(input_tensor)

    img_coord = input_tensor.shape

    print(img_coord)

    if results.multi_hand_landmarks:

        x_landmark = [] 
        y_landmark = []

        for hand in results.multi_hand_landmarks:

            for lm in hand.landmark:

                x_landmark.append(lm.x * img_coord[1])
                y_landmark.append(lm.y * img_coord[0])

            x_min = int(min(x_landmark))
            y_min = int(min(y_landmark))
            x_max = int(max(x_landmark))
            y_max = int(max(y_landmark))

            x_center = int((x_max + x_min) / 2)
            y_center = int((y_max + y_min) / 2)
            box_width_from_center = int(max((x_max - x_min), (y_max - y_min)) // 2) + padding

            x_left = max(0, (x_center - box_width_from_center))
            y_left = max(0, (y_center - box_width_from_center))

            x_right = min(img_coord[1], (x_center + box_width_from_center))
            y_right = min(img_coord[0], (y_center + box_width_from_center))

        return [x_left, y_left, x_right, y_right, img_coord]


@app.post("/process_image")
async def process_image(request: ImageData):

    screenshot = request.screenshot 
    request_option = request.request_option


    if "," in screenshot:
        _, encoded = screenshot.split(",", 1)
    else:
        encoded = screenshot

    img_bytes = base64.b64decode(encoded)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    box_position = get_box_position(imgRGB)


    match request_option:
        case "classify":

            if box_position:
                x_left, y_left, x_right, y_right, img_coord = box_position
                cropped_hand = imgRGB[y_left:y_right, x_left:x_right]
                processed_img = load_and_preprocess_image(cropped_hand)
                prediction = predict(processed_img)
                return {"response": [prediction, box_position]}
            else:
                return {"response": ["NO SIGN SHOWN", 0]}

        case "hand_frame":

            if box_position:
                return {"response": box_position}
            else:
                return {"response": 0}



