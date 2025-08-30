# Student Feedback Analysis Dashboard
An intelligent web application designed to help educational institutions analyze and understand student feedback at scale. This dashboard leverages Generative AI and Large Language Models (LLMs) to move beyond simple ratings, using advanced NLP techniques to uncover hidden themes and sentiment from qualitative feedback. By automatically generating human-readable topic labels and insightful summaries, it provides actionable insights for course improvement.

## ✨ Key Features
AI-Powered Topic Modeling: Automatically discovers and groups recurring themes and topics from thousands of feedback entries. It uses BERTopic and Large Language Models (llama-3.3-70b-versatile via Groq) to generate concise, human-readable topic labels.

Sentiment Analysis  : Gauges the underlying sentiment (Positive, Neutral, Negative) of feedback to quickly identify areas of student satisfaction or concern.

Course-Specific Insights: Allows administrators to dynamically filter feedback data by course, providing a granular view of performance.

Data-Driven Summaries: Generates AI-powered summaries for each course, highlighting key strengths and weaknesses mentioned by students.

Secure & Professional UI: A clean, modern, and secure dashboard built with React for a seamless user experience.

## 🛠️ Technology Stack
This project is a full-stack application composed of a Python/Flask backend and a React frontend.

### Backend:

Framework: Flask

Database: SQLAlchemy (with SQLite as the default database)

### NLP & AI:

langchain-groq: For fast and powerful LLM inference.

bertopic: For advanced topic modeling.

transformers: For sentiment analysis pipelines (using cardiffnlp/twitter-roberta-base-sentiment).

spacy: For efficient text preprocessing and cleaning.

Data Handling: Pandas

### Frontend:

Library: React.js

Styling: Plain CSS with a professional green and white theme.

## Project Structure
<img width="665" height="259" alt="image" src="https://github.com/user-attachments/assets/bcfdf2d1-c7ef-4e3a-91c6-b38d2e6f8d94" />

## Running the Application
1. Start Flask Backend
   python app.py
2. Start React Frontend
   cd static/react_dashboard/dashboard-frontend
   npm start

### Acknowledgements
-Acknowledgments
-BERTopic
-LangChain
-React.js
-Flask

