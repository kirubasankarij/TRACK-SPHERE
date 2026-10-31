# Drowsiness Detection — Eye State Classification

Binary classification of infrared eye images into **Awake** and **Sleepy** states using transfer learning on the **MRL Eye Dataset (~85K images)**.

---

## 📌 Overview
Driver drowsiness is one of the leading causes of road accidents. This project builds a deep learning classifier that detects eye state (open vs. closed) from infrared images — a core component of any real-time driver safety & drowsiness detection system.

Two pretrained transfer learning architectures are fine-tuned and compared:

| Model | Epochs | Val AUC | Train/Val Loss Tracking |
|---|---|---|---|
| **ResNet50** | 10 | **~0.9997** | Fast convergence, low generalization gap |
| **InceptionV3** | 15 | **~0.9993** | High stability across lighting conditions |

Both models converge fast and generalize well, with train/val loss tracking closely without significant overfitting.

---

## 📊 Dataset Breakdown

**MRL Eye Dataset** — Infrared eye images labeled as **Awake** or **Sleepy**.

| Split | Awake | Sleepy | Total |
|---|---|---|---|
| **Train** | 25,770 | 25,167 | 50,937 |
| **Validation** | 8,591 | 8,389 | 16,980 |
| **Test** | 8,591 | 8,390 | 16,981 |

- **37 human subjects**, multiple sensors, various head poses & lighting conditions.
- Well-balanced classes — no resampling required.
- Dataset Source: [mrl.cs.vsb.cz/eyedataset](http://mrl.cs.vsb.cz/eyedataset)

### Expected Directory Layout:
```
data/
├── train/
│   ├── awake/
│   └── sleepy/
├── val/
│   ├── awake/
│   └── sleepy/
└── test/
    ├── awake/
    └── sleepy/
```

---

## 🧠 Technical Approach

- **Transfer Learning**: Pretrained ImageNet weights provide foundational visual representations (edges, textures, shapes) that adapt quickly to infrared eye images.
- **Data Augmentation**: Applied light augmentation on training split only: Gaussian blur, brightness jitter, horizontal flip, and light rotation ($10^\circ$).
- **Optimizer & Regularization**: `AdamW` optimizer with learning rate ($10^{-4}$ or $10^{-5}$) and `Dropout(0.5)` before the ResNet/Inception classification head.
- **Mixed Precision Training**: Accelerated via PyTorch `torch.amp.autocast`.
- **Early Stopping**: Early stopping based on validation AUC with patience of 5 epochs.

---

## 📁 Project Structure

```
ai_safety_model/
├── Drowsiness_Detection.ipynb       # Full Jupyter Notebook pipeline: EDA → training → evaluation
├── train_drowsiness_model.py        # PyTorch CLI engine (ResNet50, InceptionV3, MobileNetV2, EyeSleepNet)
├── dataset_downloader.py            # Automated MRL dataset parser & downloader + synthetic fallback
├── infer_drowsiness.py              # OpenCV desktop webcam inference script
├── ResNet_AUC_LOSS_Curves.png       # AUC and Loss progression plots
├── ResNet_test_set_predictions.png  # Confusion matrix & test evaluation
└── README_AI_TRAINING.md            # Technical documentation & project spec
```

---

## ⚡ Quickstart Guide

### 1. Install Dependencies
```bash
pip install torch torchvision scikit-learn tqdm seaborn matplotlib opencv-python
```

### 2. Download & Structure MRL Dataset
```bash
python dataset_downloader.py
```

### 3. Run AI Training Pipeline
Train **ResNet50** fine-tuning:
```bash
python train_drowsiness_model.py --model resnet50 --epochs 10 --batch_size 32 --lr 1e-4
```

Train **InceptionV3** fine-tuning:
```bash
python train_drowsiness_model.py --model inceptionv3 --epochs 15 --batch_size 32 --lr 1e-4
```

### 4. Run Live Desktop Inference
```bash
python infer_drowsiness.py
```

---

## 📚 References
- Fusek, R. (2018). *Pupil localization using geodesic distance*. ICIAR 2018. [[Paper]](http://mrl.cs.vsb.cz/people/fusek/)
- MRL Eye Dataset: [http://mrl.cs.vsb.cz/eyedataset](http://mrl.cs.vsb.cz/eyedataset)
