from transformers import pipeline
from collections import Counter
import pandas as pd
import re
import spacy
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda
from langchain_groq import ChatGroq
from bertopic import BERTopic
from bertopic.representation import LangChain
from hdbscan import HDBSCAN
import random
import os
from dotenv import load_dotenv

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

model = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=groq_api_key)
parser = StrOutputParser()


prompt_template = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful summarization assistant."),
    ("user", "{text}")
])
summarization_chain = prompt_template | model | parser

sentiment_model_name = "cardiffnlp/twitter-roberta-base-sentiment"
sentiment_tokenizer = AutoTokenizer.from_pretrained(sentiment_model_name)
sentiment_model = AutoModelForSequenceClassification.from_pretrained(sentiment_model_name)

sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model=sentiment_model,
    tokenizer=sentiment_tokenizer
)

nlp = spacy.load("en_core_web_sm", disable=["ner", "parser"])

def create_topic_name(topic, documents):
   
    try:
     
        if isinstance(topic, list) and topic:
            keywords = [f"{word} ({score:.2f})" for word, score in topic[:5]]
            raw_keywords = [word for word, _ in topic[:5]]
        else:
            return "General Topic"
        
     
        sample_docs = documents[:2] if documents else []
        
      
        prompt = f"""As an AI expert in educational feedback analysis, examine these topic elements:

        Keywords (with relevance scores): {', '.join(keywords)}
        Example feedback: {' | '.join(sample_docs[:2])}

        Task: Create a clear, specific topic label that:
        1. Uses 2-4 words maximum
        2. Captures the main educational theme
        3. Focuses on {raw_keywords[0]} and {raw_keywords[1]} as primary concepts

        Return only the topic label, no explanations or quotes."""

       
        result = model.invoke([
            {"role": "system", "content": "You are an expert in analyzing educational feedback and creating precise topic labels."},
            {"role": "user", "content": prompt}
        ])
        
      
        topic_name = result.content.strip()
        topic_name = re.sub(r'["\']', '', topic_name)
        topic_name = re.sub(r'\s+', ' ', topic_name)
       
        if len(topic_name.split()) > 4:
            topic_name = ' '.join(topic_name.split()[:4])
        
        return topic_name

    except Exception as e:
        print(f"Error in create_topic_name: {e}")
       
        if isinstance(topic, list) and len(topic) >= 2:
            return f"{topic[0][0].title()}-{topic[1][0].title()}"
        return "General Topic"

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    doc = nlp(text)
    cleaned_tokens = [
        token.lemma_ for token in doc
        if token.is_alpha and not token.is_stop and token.pos_ not in ["PRON", "DET"]
    ]
    return " ".join(cleaned_tokens)

def summarize_feedback_by_course(df, column='feedback_text'):
    summaries = {}
    grouped = df.groupby('course')
    for course, group in grouped:
        texts = group[column].dropna().tolist()
        all_text = " ".join(texts)
        if len(all_text.split()) < 30:
            summaries[course] = all_text
            continue
        result = summarization_chain.invoke({"text": f"Summarize the following student feedback into a single clear very short paragraph highlighting strengths and weaknesses:\n{all_text}"})
        summaries[course] = result.strip()
    return summaries

def calculate_average_rating(df):
    return round(df.groupby("course")['rating'].mean(), 1)

def get_sentiment_distribution(df, column='cleaned'):
    sentiment_dist = (
        df.groupby('course')['sentiment_label']
        .value_counts()
        .unstack(fill_value=0)
    )
    sentiment_dist = sentiment_dist.reindex(columns=['Negative', 'Neutral', 'Positive'], fill_value=0)
    return sentiment_dist

def run_feedback_analysis(df):
    df['cleaned'] = df['feedback_text'].apply(clean_text)
    label_map = {'LABEL_0': 'Negative', 'LABEL_1': 'Neutral', 'LABEL_2': 'Positive'}
    df["sentiment_label"] = df['cleaned'].apply(lambda text: label_map[sentiment_analyzer(text)[0]['label']])
    summaries = summarize_feedback_by_course(df)
    avg_rating = calculate_average_rating(df)
    sentiment_dist = get_sentiment_distribution(df)
    sentiment_distribution_dict = sentiment_dist.T.to_dict()
    return {
        "summary": summaries,
        "average_rating": avg_rating,
        "sentiment_distribution": sentiment_distribution_dict
    }

def get_sentiment_timeseries(df):
    sentiment_ts = (
        df.groupby(['course', 'month', 'sentiment_label'])
        .size()
        .unstack(fill_value=0)
        .reset_index()
    )
    sentiment_ts = sentiment_ts.reindex(columns=['course', 'month', 'Negative', 'Neutral', 'Positive'], fill_value=0)
    return sentiment_ts

def perform_advanced_topic_modeling(df: pd.DataFrame, min_feedback_count: int = 5):
  
    if not model or not nlp:
        return {"error": "NLP models are not initialized. Check server logs."}

  
    all_course_topics = {}
    
    for course_id in df['course'].unique():
        print(f"Processing course: {course_id}")
        
        course_docs_raw = df[df['course'] == course_id]['feedback_text'].dropna().tolist()
        course_docs_cleaned = [clean_text(doc) for doc in course_docs_raw if isinstance(doc, str) and doc.strip()]
        
      
        course_docs_cleaned = [doc for doc in course_docs_cleaned if len(doc.split()) > 3]
        
        if len(course_docs_cleaned) < min_feedback_count:
            all_course_topics[course_id] = {
                "status": "Skipped", 
                "reason": f"Insufficient valid feedback. A minimum of {min_feedback_count} is required, but found {len(course_docs_cleaned)}."
            }
            continue
            
        try:
            
            topic_model = BERTopic(
                min_topic_size=max(2, len(course_docs_cleaned) // 10),
                verbose=False,
                calculate_probabilities=False,
                nr_topics="auto"
            )
            
            print(f"Fitting model for course {course_id} with {len(course_docs_cleaned)} documents")
            topics, probabilities = topic_model.fit_transform(course_docs_cleaned)
            
            
            topic_info = topic_model.get_topic_info()
            
        
            topic_info = topic_info[topic_info.Topic != -1]
            
            if topic_info.empty:
                all_course_topics[course_id] = {"status": "Success", "topics": []}
                continue
            
            course_results = []
            for _, row in topic_info.iterrows():
                topic_id = row['Topic']
                
               
                try:
                    topic_keywords = topic_model.get_topic(topic_id)
                    keywords = [word for word, score in topic_keywords[:10]]
                except Exception as e:
                    print(f"Warning: Could not get keywords for topic {topic_id}: {e}")
                    keywords = []
                
            
                topic_docs = [doc for doc, topic_num in zip(course_docs_cleaned, topics) if topic_num == topic_id]
                examples = topic_docs[:3] if topic_docs else []  
                
                course_results.append({
                    "topic_name": f"Topic {topic_id + 1}",  
                    "keywords": keywords,
                    "count": int(row['Count']) if 'Count' in row else 0,
                    "examples": [doc for doc in topic_docs[:3]]
                })
            
            all_course_topics[course_id] = {"status": "Success", "topics": course_results}
            print(f"Successfully processed course {course_id} with {len(course_results)} topics")
            
        except Exception as e:
            print(f"Error processing course {course_id}: {str(e)}")
            all_course_topics[course_id] = {"status": "Failed", "reason": f"Error during modeling: {str(e)}"}
    
    return all_course_topics