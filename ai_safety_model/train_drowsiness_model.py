import os
import sys
import time
import argparse
import numpy as np
from PIL import Image

# Ensure stdout handles UTF-8 on Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import transforms, datasets, models

try:
    from sklearn.metrics import roc_auc_score, accuracy_score
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

# ==========================================
# 1. AI Neural Network Architectures
# ==========================================
class EyeSleepNet(nn.Module):
    """
    Lightweight, highly accurate Convolutional Neural Network (CNN) 
    designed specifically for real-time Eye Sleep & Drowsiness Classification (Awake vs Sleepy).
    """
    def __init__(self, num_classes=2):
        super(EyeSleepNet, self).__init__()
        
        self.features = nn.Sequential(
            # Conv Block 1
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2), # 64x64 -> 32x32
            
            # Conv Block 2
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2), # 32x32 -> 16x16
            
            # Conv Block 3
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2), # 16x16 -> 8x8
        )
        
        self.classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(128 * 8 * 8, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

def build_resnet50(num_classes=2):
    """
    Transfer learning option using ResNet50 pretrained backbone + Dropout(0.5) head.
    """
    try:
        model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    except AttributeError:
        model = models.resnet50(pretrained=True)
        
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(num_ftrs, num_classes)
    )
    return model

def build_inceptionv3(num_classes=2):
    """
    Transfer learning option using InceptionV3 pretrained backbone.
    """
    try:
        model = models.inception_v3(weights=models.Inception_V3_Weights.DEFAULT)
    except AttributeError:
        model = models.inception_v3(pretrained=True)
        
    model.aux_logits = False
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(num_ftrs, num_classes)
    )
    return model

def build_mobilenet(num_classes=2):
    """
    Transfer learning option using MobileNetV2 pretrained backbone.
    """
    try:
        model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    except AttributeError:
        model = models.mobilenet_v2(pretrained=True)
        
    model.classifier[1] = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(model.last_channel, num_classes)
    )
    return model

# ==========================================
# 2. Model Training & Evaluation Engine
# ==========================================
def train_model(data_dir, model_type="resnet50", batch_size=32, epochs=10, lr=1e-4, save_dir="export", patience=5):
    os.makedirs(save_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[+] Initializing Drowsiness AI Training on device: {device}")
    
    img_size = (299, 299) if model_type.lower() == "inceptionv3" else (224, 224) if model_type.lower() in ["resnet50", "mobilenet"] else (64, 64)
    
    # Image Transformations & Augmentation
    data_transforms = {
        'train': transforms.Compose([
            transforms.Resize(img_size),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(10),
            transforms.ColorJitter(brightness=0.2, contrast=0.2),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(img_size),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }
    
    # Auto-prepare dataset if missing
    train_dir = os.path.join(data_dir, "train")
    if not os.path.exists(train_dir) and not os.path.exists(os.path.join(data_dir, "awake")):
        print(f"[!] Dataset directory '{data_dir}' not found. Downloading / preparing dataset...")
        from dataset_downloader import setup_mrl_dataset
        setup_mrl_dataset(output_dir=data_dir)
        
    target_data_dir = train_dir if os.path.exists(train_dir) else data_dir
    full_dataset = datasets.ImageFolder(target_data_dir, transform=data_transforms['train'])
    class_names = full_dataset.classes
    print(f"[*] Detected Classes: {class_names} (Total samples: {len(full_dataset)})")
    
    val_dir = os.path.join(data_dir, "val")
    if os.path.exists(val_dir):
        train_dataset = full_dataset
        val_dataset = datasets.ImageFolder(val_dir, transform=data_transforms['val'])
    else:
        # Split 80% train / 20% val
        train_size = int(0.8 * len(full_dataset))
        val_size = len(full_dataset) - train_size
        train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
        val_dataset.dataset.transform = data_transforms['val']
        
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    
    # Instantiate Neural Network Model
    m_type = model_type.lower()
    if m_type == "resnet50":
        model = build_resnet50(num_classes=len(class_names))
        print("[*] Model Architecture: ResNet50 (Transfer Learning + Dropout 0.5)")
    elif m_type == "inceptionv3":
        model = build_inceptionv3(num_classes=len(class_names))
        print("[*] Model Architecture: InceptionV3 (Transfer Learning)")
    elif m_type == "mobilenet":
        model = build_mobilenet(num_classes=len(class_names))
        print("[*] Model Architecture: MobileNetV2 (Transfer Learning)")
    else:
        model = EyeSleepNet(num_classes=len(class_names))
        print("[*] Model Architecture: EyeSleepNet (Custom Lightweight CNN)")
        
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-2)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=2)
    
    # Mixed precision setup
    scaler = torch.amp.GradScaler('cuda') if device.type == 'cuda' else None
    
    best_auc = 0.0
    patience_counter = 0
    start_time = time.time()
    
    for epoch in range(epochs):
        print(f"\n--- Epoch {epoch+1}/{epochs} ---")
        
        # Training Phase
        model.train()
        running_loss = 0.0
        running_corrects = 0
        total_train = 0
        
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            
            if device.type == 'cuda':
                with torch.amp.autocast('cuda'):
                    outputs = model(inputs)
                    loss = criterion(outputs, labels)
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()
            else:
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
            _, preds = torch.max(outputs, 1)
            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)
            total_train += inputs.size(0)
            
        epoch_loss = running_loss / total_train
        epoch_acc = running_corrects.double() / total_train
        
        # Validation Phase & AUC Calculation
        model.eval()
        val_loss = 0.0
        val_corrects = 0
        total_val = 0
        all_labels = []
        all_probs = []
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                
                if device.type == 'cuda':
                    with torch.amp.autocast('cuda'):
                        outputs = model(inputs)
                        loss = criterion(outputs, labels)
                else:
                    outputs = model(inputs)
                    loss = criterion(outputs, labels)
                    
                probs = torch.softmax(outputs, dim=1)
                _, preds = torch.max(outputs, 1)
                
                val_loss += loss.item() * inputs.size(0)
                val_corrects += torch.sum(preds == labels.data)
                total_val += inputs.size(0)
                
                all_labels.extend(labels.cpu().numpy())
                all_probs.extend(probs[:, 1].cpu().numpy())
                
        val_loss = val_loss / total_val
        val_acc = val_corrects.double() / total_val
        
        val_auc = roc_auc_score(all_labels, all_probs) if HAS_SKLEARN and len(np.unique(all_labels)) > 1 else val_acc.item()
        scheduler.step(val_auc)
        
        print(f"Train Loss: {epoch_loss:.4f} | Train Acc: {epoch_acc*100:.2f}%")
        print(f"  Val Loss: {val_loss:.4f} |   Val Acc: {val_acc*100:.2f}% | Val AUC: {val_auc:.4f}")
        
        # Save best model checkpoint
        if val_auc >= best_auc:
            best_auc = val_auc
            patience_counter = 0
            pt_path = os.path.join(save_dir, "drowsiness_model.pt")
            torch.save({
                'epoch': epoch + 1,
                'model_type': model_type,
                'model_state_dict': model.state_dict(),
                'best_auc': best_auc,
                'class_names': class_names
            }, pt_path)
            print(f"  [+] Saved Best Model Checkpoint to '{pt_path}' (Val AUC: {val_auc:.4f})")
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"[!] Early stopping triggered at epoch {epoch+1} (patience={patience}).")
                break
            
    elapsed = time.time() - start_time
    print(f"\n[+] Training Complete in {elapsed:.1f}s | Best Validation AUC: {best_auc:.4f}")
    
    # Export Model to ONNX
    try:
        model.eval()
        dummy_input = torch.randn(1, 3, img_size[0], img_size[1]).to(device)
        onnx_path = os.path.join(save_dir, "drowsiness_model.onnx")
        torch.onnx.export(
            model, 
            dummy_input, 
            onnx_path,
            export_params=True,
            opset_version=11,
            do_constant_folding=True,
            input_names=['input_image'],
            output_names=['output_probs'],
            dynamic_axes={'input_image': {0: 'batch_size'}, 'output_probs': {0: 'batch_size'}}
        )
        print(f"[+] Successfully exported ONNX Model to '{onnx_path}' for Web & Edge deployment!")
    except Exception as e:
        print(f"[!] ONNX Export note: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Safety AI Eye Sleep & Drowsiness Classification Model")
    parser.add_argument("--dataset", type=str, default="data", help="Path to dataset folder")
    parser.add_argument("--model", type=str, default="resnet50", choices=["resnet50", "inceptionv3", "mobilenet", "eyesleepnet"])
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--output", type=str, default="export", help="Output export directory")
    parser.add_argument("--patience", type=int, default=5, help="Early stopping patience")
    
    args = parser.parse_args()
    train_model(data_dir=args.dataset, model_type=args.model, batch_size=args.batch_size, epochs=args.epochs, lr=args.lr, save_dir=args.output, patience=args.patience)


