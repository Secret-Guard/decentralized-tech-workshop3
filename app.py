from flask import Flask, request, jsonify
import joblib
import numpy as np

# Load the trained model
model = joblib.load('iris_model.pkl')

app = Flask(__name__)

@app.route('/predict', methods=['GET'])
def predict():
    features = request.args.get('features')
    features = np.array([float(x) for x in features.split(',')]).reshape(1, -1)
    
    prediction = model.predict(features)
    return jsonify({'prediction': int(prediction[0])})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
