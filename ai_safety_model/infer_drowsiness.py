import os
import cv2
import math
import time
import numpy as np
import torch
from torchvision import transforms

from train_drowsiness_model import EyeSleepNet

def calculate_ear(eye_landmarks):
    """
    Computes Eye Aspect Ratio (EAR) given 6 2D/3D landmark points around an eye.
    p1, p2, p3, p4, p5, p6
    """
    # Vertical distances
    v1 = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
    v2 = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
    # Horizontal distance
    h = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])
    
    if h == 0:
        return 0.28
    return (v1 + v2) / (2.0 * h)

def run_live_inference(model_path="export/drowsiness_model.pt"):
    """
    Runs live desktop camera inference with OpenCV and MediaPipe / EAR calculation.
    """
    print("📷 Starting Driver Safety AI Live Camera Inference...")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = None
    
    if os.path.exists(model_path):
        try:
            checkpoint = torch.load(model_path, map_location=device)
            model = EyeSleepNet(num_classes=2)
            model.load_state_dict(checkpoint['model_state_dict'])
            model.to(device)
            model.eval()
            print(f"✅ Loaded PyTorch Model Checkpoint from '{model_path}'")
        except Exception as e:
            print(f"⚠️ Could not load PyTorch checkpoint: {e}. Falling back to EAR landmark tracking.")
            
    # Try importing MediaPipe for face landmarks
    try:
        import mediapipe as mp
        mp_face_mesh = mp.solutions.face_mesh
        face_mesh = mp_face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.5)
        has_mediapipe = True
        print("🧠 MediaPipe FaceMesh Engine initialized successfully!")
    except ImportError:
        has_mediapipe = False
        print("ℹ️ MediaPipe python package not installed. Install via `pip install mediapipe` for 3D landmarks.")
        
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not access camera.")
        return
        
    closed_start_time = None
    ear_threshold = 0.20
    
    print("🟢 Live Driver Monitoring Active (Alert at 30s continuous eye closure). Press 'q' or ESC to exit.")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame = cv2.flip(frame, 1)
        h, w, c = frame.shape
        status_str = "VIGILANT"
        status_color = (0, 255, 0)
        current_ear = 0.28
        
        if has_mediapipe:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb_frame)
            
            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    pts = np.array([(lm.x * w, lm.y * h) for lm in face_landmarks.landmark])
                    
                    # Left Eye & Right Eye Landmark Indices
                    left_idx = [362, 385, 387, 263, 373, 380]
                    right_idx = [33, 160, 158, 133, 153, 144]
                    
                    left_eye = pts[left_idx]
                    right_eye = pts[right_idx]
                    
                    ear_l = calculate_ear(left_eye)
                    ear_r = calculate_ear(right_eye)
                    current_ear = (ear_l + ear_r) / 2.0
                    
                    # Draw Eye Contours
                    for p in left_eye:
                        cv2.circle(frame, (int(p[0]), int(p[1])), 2, (0, 255, 0), -1)
                    for p in right_eye:
                        cv2.circle(frame, (int(p[0]), int(p[1])), 2, (0, 255, 0), -1)
                        
        # Evaluate Eye Status with 30-second continuous closure threshold
        if current_ear < ear_threshold:
            if closed_start_time is None:
                closed_start_time = time.time()
            elapsed_closed = time.time() - closed_start_time
            if elapsed_closed >= 30.0:
                status_str = f"🚨 DROWSINESS ALERT! EYES CLOSED >30s ({elapsed_closed:.1f}s)"
                status_color = (0, 0, 255)
            else:
                status_str = f"EYES CLOSED ({elapsed_closed:.1f}s / 30.0s)"
                status_color = (0, 165, 255) # Warning Amber
        else:
            closed_start_time = None
            
        # Draw UI Overlay on frame
        cv2.rectangle(frame, (10, 10), (w - 10, 80), (0, 0, 0), -1)
        cv2.putText(frame, f"SAFETY AI MONITOR | EAR: {current_ear:.2f}", (20, 35), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"STATUS: {status_str}", (20, 65), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
                    
        cv2.imshow("TrackFlow Driver Safety AI Detector", frame)
        if cv2.waitKey(1) & 0xFF in [ord('q'), 27]:
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_live_inference()
