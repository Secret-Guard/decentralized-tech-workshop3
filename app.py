from flask import Flask, request, jsonify
import joblib
import numpy as np
import json

# Load models
model1 = joblib.load('model_1.pkl')
model2 = joblib.load('model_2.pkl')

# Load balance file
def load_balance():
    try:
        with open('models_balance.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return {}

# Save balance to file
def save_balance(balance_data):
    with open('models_balance.json', 'w') as file:
        json.dump(balance_data, file, indent=4)

app = Flask(__name__)

@app.route('/predict', methods=['GET'])
def predict():
    features = request.args.get('features')
    features = np.array([float(x) for x in features.split(',')]).reshape(1, -1)
    
    # Get the current balance data
    balance_data = load_balance()
    
    # Get predictions from both models
    pred1 = model1.predict(features)[0]
    pred2 = model2.predict(features)[0]
    
    # Calculate the final prediction using weighted average
    weight1 = balance_data.get('model_1', {}).get('weight', 1)
    weight2 = balance_data.get('model_2', {}).get('weight', 1)
    
    weighted_prediction = (pred1 * weight1 + pred2 * weight2) / (weight1 + weight2)
    final_prediction = round(weighted_prediction)
    
    # Simulate correct answer (this should be dynamic in real use)
    correct_answer = 0  # Assume the correct answer is 0 for demonstration
    
    # Track errors (update based on actual vs predicted)
    if final_prediction != correct_answer:
        if 'model_1' in balance_data:
            balance_data['model_1']['errors'] += 1
        if 'model_2' in balance_data:
            balance_data['model_2']['errors'] += 1
    
    # Apply slashing logic (reduce weight if accuracy drops too low)
    for model in balance_data:
        if balance_data[model]['errors'] >= 5:  # If the model makes 5 mistakes, slash weight
            balance_data[model]['weight'] *= 0.5  # Slash weight by 50%
            balance_data[model]['errors'] = 0  # Reset error count after slashing
    
    # Save the updated balance data
    save_balance(balance_data)
    
    # Return prediction
    return jsonify({'prediction': final_prediction})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
