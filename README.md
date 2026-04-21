# Similar Stories Retrieval System

A simple, beginner-friendly FastAPI backend designed for finding similar articles/stories in a dataset based on text similarity.


## Features
1. **Health Check:** `GET /health` ensures the API is running.
2. **List Articles:** `GET /articles` fetches a paginated list of uploaded articles with a short text snippet.
3. **Get Article:** `GET /articles/{article_id}` fetches reading snippets for a specific article.
4. **Similar Articles:** `GET /articles/{article_id}/similar?k=5` retrieves the top-K similar articles for any chosen article using Machine Learning (Cosine Similarity).
5. **Upload Dataset:** `POST /articles/upload` allows administrators to upload custom CSV or JSON datasets to the system.
6. **Retrain Model:** `POST /admin/retrain` takes the uploaded data, generates Machine Learning artifacts (TF-IDF, PCA, KMeans), and prepares the system for serving similarity requests.


## Setup Instructions

### 1. Create a Virtual Environment
It's strongly recommended to use a virtual environment (`venv`) to keep your project dependencies isolated. Ensure you have Python 3.9+ installed, then run:

**On Windows:**
```bash
python -m venv venv
```

**On macOS/Linux:**
```bash
python3 -m venv venv
```

### 2. Activate the Virtual Environment
Before installing dependencies or running the server, you must activate the virtual environment:

**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies
Once the virtual environment is activated, download and install all required text processing and backend libraries (Make sure `python-multipart` is included in your text space so file uploads work!):

```bash
pip install -r requirements.txt
```

*(Note: If you run into an error regarding `python-multipart` being missing while starting the app, you can manually install it by running `pip install python-multipart`)*.

### 4. Run the Application
Start the FastAPI server through `uvicorn`:

```bash
uvicorn app.main:app --reload
```

The application will now be running on `http://127.0.0.1:8000`.

### 5. API Documentation
FastAPI automatically generates interactive API documentation. You can access it via:
- **Swagger UI:** `http://127.0.0.1:8000/docs`


## Project Structure

- **`app/main.py`**: The entrypoint to the backend. Registers all endpoints.
- **`app/database.py`**: Creates a simple local SQLite connection.
- **`app/models.py`**: Contains simple SQLAlchemy DB schemas.
- **`app/schemas.py`**: Contains Pydantic models for data validation.
- **`app/crud.py`**: Defines reusable database operations (Create, List, Get).
- **`app/upload.py`**: Contains logic for receiving a `.csv` or `.json` file and cleaning it.
- **`app/retrain.py`**: Loads the CSV dataset, runs scikit-learn metrics, and dumps the trained models into `artifacts/`.
- **`app/ml.py`**: Loads the models dynamically into memory on startup and runs cosine similarity calculation.


## Usage Workflow (For Beginners)

1. First start the server.
2. Go to `http://127.0.0.1:8000/docs` and use `POST /articles/upload` to upload a basic CSV file with columns: `article_id`, `content`, `category`.
3. Use `POST /admin/retrain` to calculate vectors. Wait until it completes.
4. Try out `GET /articles/{article_id}/similar` to immediately find the most matching text using Cosine Similarity!
