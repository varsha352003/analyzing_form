# Student Feedback Analysis Dashboard
An intelligent web application designed to help educational institutions analyze and understand student feedback at scale. This dashboard leverages advanced Natural Language Processing (NLP) to move beyond simple ratings, uncovering hidden themes, topics, and sentiment from qualitative feedback to provide actionable insights for course improvement.

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
