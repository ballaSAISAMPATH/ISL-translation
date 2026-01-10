import streamlit as st
import cv2
import numpy as np
from PIL import Image
from ultralytics import YOLO
import yaml
import os

st.set_page_config(page_title="Indian Sign Language Detection", layout="wide")

def load_classes(yaml_path):
    with open(yaml_path, 'r') as file:
        data = yaml.safe_load(file)
    return data['names']

@st.cache_resource
def load_model(model_path):
    try:
        model = YOLO(model_path)
        return model
    except Exception as e:
        st.error(f"Error loading model: {str(e)}")
        raise

def detect_sign_language_from_frame(frame, model, class_names):
    results = model(frame)[0]
    detected_signs = []

    for box in results.boxes:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        if conf > 0.5:
            sign = class_names[cls_id]
            detected_signs.append(sign)

            # Draw box and label
            xyxy = box.xyxy[0].cpu().numpy().astype(int)
            cv2.rectangle(frame, tuple(xyxy[:2]), tuple(xyxy[2:]), (0, 255, 0), 2)
            cv2.putText(frame, f"{sign} {conf:.2f}", (xyxy[0], xyxy[1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    return frame, ", ".join(detected_signs) if detected_signs else "No sign detected"

def main():
    st.title("Indian Sign Language Detection")
    st.write("Choose detection mode:")

    mode = st.radio("Select Mode", ["Upload Image", "Webcam Live Detection"])

    model_path = "runs/detect/train/weights/best.pt"
    yaml_path = "data.yaml"

    if not os.path.exists(model_path):
        st.error(f"Model not found at {model_path}")
        return

    if not os.path.exists(yaml_path):
        st.error(f"YAML file not found at {yaml_path}")
        return

    try:
        class_names = load_classes(yaml_path)
        model = load_model(model_path)
    except Exception as e:
        st.error(f"Failed to load resources: {str(e)}")
        return

    if mode == "Upload Image":
        uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])
        if uploaded_file is not None:
            try:
                image = Image.open(uploaded_file)
                st.image(image, caption="Uploaded Image", use_column_width=True)

                with st.spinner("Detecting sign language..."):
                    image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                    processed_frame, result = detect_sign_language_from_frame(image_cv, model, class_names)

                st.subheader("Detection Results")
                st.success(f"Detected Sign: {result}")
                st.image(cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB), use_column_width=True)

            except Exception as e:
                st.error(f"Error processing image: {str(e)}")

    elif mode == "Webcam Live Detection":
        st.warning("Press 'q' in the video window to stop webcam")

        if st.button("Start Webcam"):
            cap = cv2.VideoCapture(0)

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    st.error("Failed to access webcam.")
                    break

                frame, _ = detect_sign_language_from_frame(frame, model, class_names)
                cv2.imshow("Live Sign Language Detection - Press 'q' to quit", frame)

                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

            cap.release()
            cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
