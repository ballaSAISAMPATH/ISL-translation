import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

DATASET_DIR = "dataset"
MODEL_PATH = "gesture_model.pkl"

X = []
y = []

for file in os.listdir(DATASET_DIR):
    if not file.endswith(".csv"):
        continue

    label = file.replace(".csv", "")
    df = pd.read_csv(os.path.join(DATASET_DIR, file))

    features = df.iloc[:, :63].values
    labels = [label] * len(features)

    X.extend(features)
    y.extend(labels)

X = np.array(X)
y = np.array(y)
print("Training sample:", X[0][:6])

print("Samples:", X.shape)
print("Labels:", set(y))

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

preds = model.predict(X_test)
acc = accuracy_score(y_test, preds)

print("Accuracy:", acc)

joblib.dump(model, MODEL_PATH)
print("Model saved:", MODEL_PATH)
