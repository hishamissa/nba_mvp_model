import os
import pandas as pd
import matplotlib.pyplot as plt

from model import load_model_bundle, MODEL_DIR

# Load the trained model bundle
model_path = os.path.join(
    MODEL_DIR,
    "mvp_random_forest_2016_2023_train_award_share.pkl"
)
model, feature_cols, metadata = load_model_bundle(model_path)

# Extract feature importance scores
importances = model.feature_importances_
df_imp = pd.DataFrame({
    "feature": feature_cols,
    "importance": importances
})
df_imp = df_imp.sort_values("importance", ascending=False)

# Plot top 20 features
top_k = 20
df_top = df_imp.head(top_k)

plt.figure(figsize=(10, 8))
plt.barh(df_top["feature"][::-1], df_top["importance"][::-1])
plt.xlabel("Feature Importance Score")
plt.title(f"Top {top_k} Most Important Features (Random Forest MVP Model)")
plt.tight_layout()
plt.show()