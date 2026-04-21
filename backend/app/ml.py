"""
Key details:
- Handles loading the machine learning models (TF-IDF, PCA, K-Means) and trained vectors into memory.
- Uses them to calculate cosine similarity to find and return the top-k most similar articles.
- Global variables to keep artifacts in memory.
- Load the trained vectors and article IDs into memory.
- Find top-k similar articles based on cosine similarity of their vectors.
- Find the index of the requested article.
- Compute cosine similarity between the target vector and all vectors.
- Get indices of most similar articles, descending (k+1 to exclude itself).
"""
import numpy as np
import os
from sklearn.metrics.pairwise import cosine_similarity

user_models = {}

def load_artifacts(user_id: int):
    vectors_path = f"artifacts/vectors_{user_id}.npy"
    ids_path = f"artifacts/article_ids_{user_id}.npy"
    
    if os.path.exists(vectors_path) and os.path.exists(ids_path):
        vectors = np.load(vectors_path)
        article_ids = np.load(ids_path, allow_pickle=True)
        user_models[user_id] = {"vectors": vectors, "article_ids": article_ids}
        print(f"Model artifacts loaded successfully for user_id={user_id}.")
    else:
        print(f"Model artifacts not found for user_id={user_id}.")

def get_similar_articles(article_id: str, user_id: int, k: int = 5):
    if user_id not in user_models:
        load_artifacts(user_id)
        
    if user_id not in user_models:
        return {"error": "Model not loaded. Try retraining the model first."}
        
    vectors = user_models[user_id]["vectors"]
    article_ids = user_models[user_id]["article_ids"]
        
    try:
        idx = np.where(article_ids == article_id)[0][0]
    except IndexError:
        return {"error": f"Article ID {article_id} not found in the trained model."}
    
    target_vector = vectors[idx].reshape(1, -1)
    similarities = cosine_similarity(target_vector, vectors)[0]
    
    top_indices = similarities.argsort()[::-1][:k+1]
    
    results = []
    for i in top_indices:
        sim_id = str(article_ids[i])
        if sim_id != article_id:
            results.append({
                "article_id": sim_id,
                "similarity": float(similarities[i])
            })
            
        if len(results) >= k:
            break
            
    return results
