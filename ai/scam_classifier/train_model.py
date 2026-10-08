from pathlib import Path

import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report


# ==============================
# PROJECT PATHS
# ==============================

BASE_DIR = Path(__file__).resolve().parent

SMS_DATA_FILE = BASE_DIR / "data" / "SMSSpamCollection"
SECURITY_DATA_FILE = BASE_DIR / "data" / "security_training.csv"

MODEL_DIR = BASE_DIR / "model"
MODEL_FILE = MODEL_DIR / "scam_model.pkl"

MODEL_DIR.mkdir(exist_ok=True)


# ==============================
# LOAD ORIGINAL SMS DATASET
# ==============================

print("Loading SMS Spam dataset...")

sms_df = pd.read_csv(
    SMS_DATA_FILE,
    sep="\t",
    header=None,
    names=["label", "text"],
    encoding="utf-8"
)

print(f"SMS dataset: {len(sms_df)} messages")


# ==============================
# LOAD TRUSTGUARD SECURITY DATA
# ==============================

print("Loading TrustGuard security dataset...")

security_df = pd.read_csv(
    SECURITY_DATA_FILE,
    encoding="utf-8"
)

print(f"Security dataset: {len(security_df)} messages")


# ==============================
# COMBINE DATASETS
# ==============================

df = pd.concat(
    [sms_df, security_df],
    ignore_index=True
)

# Remove invalid/empty rows
df = df.dropna(subset=["label", "text"])

# Normalize labels
df["label"] = (
    df["label"]
    .astype(str)
    .str.strip()
    .str.lower()
)

df["label"] = df["label"].map({
    "ham": 0,
    "spam": 1
})

# Remove rows with invalid labels
df = df.dropna(subset=["label"])

df["label"] = df["label"].astype(int)

print(f"Combined dataset: {len(df)} messages")
print()
print("Class distribution:")
print(df["label"].value_counts())


# ==============================
# PREPARE DATA
# ==============================

X = df["text"].astype(str)
y = df["label"]


# ==============================
# TRAIN / TEST SPLIT
# ==============================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ==============================
# MACHINE LEARNING MODEL
# ==============================

model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            stop_words="english",

            # Learn individual words,
            # two-word phrases and three-word phrases.
            ngram_range=(1, 3),

            # Ignore extremely rare noise.
            min_df=1,

            # Give more importance to meaningful terms.
            sublinear_tf=True,

            max_features=30000
        )
    ),

    (
        "classifier",
        LogisticRegression(
            max_iter=1500,

            # Helps compensate for the smaller SPAM class.
            class_weight="balanced",

            random_state=42
        )
    )
])


# ==============================
# TRAIN MODEL
# ==============================

print()
print("Training upgraded TrustGuard AI model...")

model.fit(X_train, y_train)


# ==============================
# TEST MODEL
# ==============================

predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print()
print("==============================")
print("MODEL RESULTS")
print("==============================")

print(f"Accuracy: {accuracy:.4f}")

print()
print("Classification Report:")

print(
    classification_report(
        y_test,
        predictions,
        target_names=["HAM", "SPAM"],
        zero_division=0
    )
)


# ==============================
# SAVE MODEL
# ==============================

joblib.dump(
    model,
    MODEL_FILE
)

print("==============================")
print("MODEL SAVED SUCCESSFULLY")
print("==============================")

print(f"Location: {MODEL_FILE}")