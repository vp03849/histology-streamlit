from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io




app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:5173",
])

device = torch.device(
    "cuda" if torch.cuda.is_available()
    else "mps" if torch.backends.mps.is_available()
    else "cpu"
)

checkpoint = torch.load(
    "resnet18_breakhis_binary.pth",
    map_location=device,
    weights_only=True,
)

model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, 2)
model.load_state_dict(checkpoint["model_state"])
model.to(device).eval()

CLASS_NAMES = checkpoint["class_names"]  # ["benign", "malignant"]

transform = transforms.Compose([
    transforms.Resize(255),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != 'RGB':
        image = image.convert('RGB')
    image_tensor = transform(image)
    image_tensor = image_tensor.unsqueeze(0)
    return image_tensor.to(device)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        image_bytes = file.read()
        image_tensor = preprocess_image(image_bytes)
        
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
            
            prob_benign = probabilities[0][0].item() * 100
            prob_malignant = probabilities[0][1].item() * 100
            
            prediction = 'benign' if predicted.item() == 0 else 'malignant'
            confidence_score = confidence.item() * 100
        
        result = {
            'prediction': prediction,
            'confidence': round(confidence_score, 2),
            'probabilities': {
                'benign': round(prob_benign, 2),
                'malignant': round(prob_malignant, 2)
            }
        }
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model': 'ResNet18',
        'device': str(device)
    }), 200

if __name__ == '__main__':
    print(f"Model loaded successfully on {device}")
    print("Starting Flask server...")
    app.run(debug=False, host='0.0.0.0', port=5001)