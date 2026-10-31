import os
import math
import zipfile
import urllib.request
import numpy as np
from PIL import Image, ImageDraw

MRL_DATASET_URL = "http://mrl.cs.vsb.cz/data/eyedataset/mrlEyes_2018_01.zip"

def setup_mrl_dataset(output_dir="data", zip_path="mrlEyes_2018_01.zip"):
    """
    Downloads and prepares the MRL Eye Dataset into structured train/val/test splits:
      data/train/awake, data/train/sleepy
      data/val/awake, data/val/sleepy
      data/test/awake, data/test/sleepy
    """
    os.makedirs(output_dir, exist_ok=True)
    train_dir = os.path.join(output_dir, "train")
    val_dir = os.path.join(output_dir, "val")
    test_dir = os.path.join(output_dir, "test")
    
    if os.path.exists(train_dir) and len(os.listdir(train_dir)) > 0:
        print(f"✅ MRL Eye Dataset already prepared in '{output_dir}'.")
        return
        
    print("🌐 Downloading MRL Eye Dataset (~85K infrared eye images)...")
    if not os.path.exists(zip_path):
        try:
            urllib.request.urlretrieve(MRL_DATASET_URL, zip_path)
            print("✅ Download completed.")
        except Exception as e:
            print(f"⚠️ Could not download MRL Eye Dataset directly: {e}. Falling back to synthetic dataset generation.")
            create_synthetic_dataset(output_dir=os.path.join(output_dir, "train"), samples_per_class=300)
            create_synthetic_dataset(output_dir=os.path.join(output_dir, "val"), samples_per_class=100)
            create_synthetic_dataset(output_dir=os.path.join(output_dir, "test"), samples_per_class=100)
            return

    print("📦 Extracting and parsing MRL Eye Dataset filenames...")
    temp_extract_dir = "temp_mrl_extract"
    os.makedirs(temp_extract_dir, exist_ok=True)
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(temp_extract_dir)

    # Prepare class folders
    for split_dir in [train_dir, val_dir, test_dir]:
        for cls in ['awake', 'sleepy']:
            os.makedirs(os.path.join(split_dir, cls), exist_ok=True)

    # Parse MRL Filenames: s0001_00001_0_0_0_0_0_01.png
    # Filename format: subject_id_image_id_state_gender_glasses_reflection_lighting_sensor
    # 5th element (index 4 in 0-based split by '_') indicates state: 0 = closed (sleepy), 1 = open (awake)
    all_files = []
    for root, _, files in os.walk(temp_extract_dir):
        for f in files:
            if f.endswith('.png') or f.endswith('.jpg'):
                all_files.append(os.path.join(root, f))

    np.random.seed(42)
    np.random.shuffle(all_files)

    total = len(all_files)
    train_end = int(0.6 * total)
    val_end = int(0.8 * total)

    for i, file_path in enumerate(all_files):
        fname = os.path.basename(file_path)
        parts = fname.split('_')
        # Check eye state flag
        state_flag = parts[4] if len(parts) > 4 else '1'
        label = 'awake' if state_flag == '1' else 'sleepy'

        if i < train_end:
            dest_dir = os.path.join(train_dir, label)
        elif i < val_end:
            dest_dir = os.path.join(val_dir, label)
        else:
            dest_dir = os.path.join(test_dir, label)

        dest_path = os.path.join(dest_dir, fname)
        os.rename(file_path, dest_path)

    print(f"✅ MRL Dataset structured: {total} total images split into train ({train_end}), val ({val_end - train_end}), test ({total - val_end}).")

def create_synthetic_dataset(output_dir="dataset", samples_per_class=150, image_size=(64, 64)):
    """
    Generates synthetic Awake/Open and Sleepy/Closed eye sample images (including hand-covered / occluded eyes)
    for training PyTorch Drowsiness & Safety Classification models.
    """
    print(f"📦 Generating synthetic dataset at '{output_dir}' ({samples_per_class} samples/class)...")
    
    classes = ['awake', 'sleepy']
    for cls in classes:
        cls_dir = os.path.join(output_dir, cls)
        os.makedirs(cls_dir, exist_ok=True)
    
    np.random.seed(42)
    
    for cls in classes:
        cls_dir = os.path.join(output_dir, cls)
        is_closed = (cls == 'sleepy')
        
        for i in range(samples_per_class):
            # Base skin tone canvas
            skin_val = np.random.randint(170, 220)
            img_np = np.ones((image_size[1], image_size[0], 3), dtype=np.uint8) * skin_val
            
            # Add random lighting/noise
            noise = np.random.normal(0, 12, img_np.shape).astype(np.int16)
            img_np = np.clip(img_np.astype(np.int16) + noise, 0, 255).astype(np.uint8)
            
            img = Image.fromarray(img_np)
            draw = ImageDraw.Draw(img)
            
            center_x, center_y = image_size[0] // 2, image_size[1] // 2
            
            if is_closed:
                # 50% chance: Eyelids Shut | 50% chance: Hand covering eyes (occlusion)
                if i % 2 == 0:
                    # Eyelids Shut
                    line_y = center_y + np.random.randint(-2, 3)
                    draw.arc([center_x - 20, line_y - 8, center_x + 20, line_y + 8], start=10, end=170, fill=(40, 30, 25), width=3)
                    for lx in range(center_x - 18, center_x + 18, 5):
                        draw.line([lx, line_y + 2, lx + np.random.randint(-2, 3), line_y + 6], fill=(30, 20, 20), width=1)
                else:
                    # Hand Covering Eyes (Occlusion)
                    hand_y = center_y - np.random.randint(10, 25)
                    draw.rectangle([10, hand_y, image_size[0] - 10, hand_y + 35], fill=(215, 170, 140), outline=(160, 120, 90), width=2)
                    for fx in range(15, image_size[0] - 15, 12):
                        draw.line([fx, hand_y, fx, hand_y + 35], fill=(180, 135, 105), width=2)
            else:
                # Open Eye
                eye_width = np.random.randint(22, 28)
                eye_height = np.random.randint(12, 18)
                
                # Sclera (White)
                draw.ellipse([center_x - eye_width, center_y - eye_height, center_x + eye_width, center_y + eye_height], 
                             fill=(245, 245, 245), outline=(50, 40, 35), width=2)
                
                # Iris
                iris_r = np.random.randint(6, 10)
                draw.ellipse([center_x - iris_r, center_y - iris_r, center_x + iris_r, center_y + iris_r], 
                             fill=(60, 40, 20), outline=(20, 10, 5))
                
                # Pupil
                pupil_r = iris_r // 2
                draw.ellipse([center_x - pupil_r, center_y - pupil_r, center_x + pupil_r, center_y + pupil_r], 
                             fill=(10, 10, 10))
                
                # Catchlight
                draw.ellipse([center_x - 2, center_y - 4, center_x, center_y - 2], fill=(255, 255, 255))
            
            filename = f"synthetic_{cls}_{i:04d}.jpg"
            img.save(os.path.join(cls_dir, filename))

    print(f"✅ Dataset generated under '{output_dir}/awake' and '{output_dir}/sleepy'!")

if __name__ == "__main__":
    setup_mrl_dataset()

