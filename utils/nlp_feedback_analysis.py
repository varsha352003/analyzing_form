from transformers import pipeline
from collections import Counter
import pandas as pd
import re
import spacy
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
sentiment_model_name = "cardiffnlp/twitter-roberta-base-sentiment"
sentiment_tokenizer = AutoTokenizer.from_pretrained(sentiment_model_name)
sentiment_model = AutoModelForSequenceClassification.from_pretrained(sentiment_model_name)

sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model=sentiment_model,
    tokenizer=sentiment_tokenizer
)

nlp = spacy.load("en_core_web_sm", disable=["ner", "parser"])  

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
        if token.is_alpha                              
        and not token.is_stop                         
        and token.pos_ not in ["PRON", "DET", "CCONJ"]  
    ]

    return " ".join(cleaned_tokens)


def summarize_feedback_by_course(df, column='feedback_text'):
    summaries = {}
    grouped = df.groupby('course')

    for course, group in grouped:
        merged_text = " ".join(group[column].dropna().tolist())
        if len(merged_text.split()) < 30:
            summaries[course] = merged_text 
        else:
            summary = summarizer(merged_text, max_length=100, min_length=30, do_sample=False)[0]['summary_text']
            summaries[course] = summary

    return summaries


def calculate_average_rating(df):
    return round(df.groupby("course")['rating'].mean(), 1)

def get_sentiment_distribution(df, column='cleaned'):
    
    label_map = {
        'LABEL_0': 'Negative',  
        'LABEL_1': 'Neutral',   
        'LABEL_2': 'Positive'   
    }
    
    
    df["sentiment_label"] = df[column].apply(
        lambda text: label_map[sentiment_analyzer(text)[0]['label']]
    )
    
   
    sentiment_dist = (
        df.groupby('course')['sentiment_label']
        .value_counts()
        .unstack(fill_value=0)
    )
    
    
    sentiment_dist = sentiment_dist[['Negative', 'Neutral', 'Positive']]
    
    return sentiment_dist



def run_feedback_analysis(df):
    df['cleaned'] = df['feedback_text'].apply(clean_text)

    result = {
        "summary":summarize_feedback_by_course(df),
        "average_rating": calculate_average_rating(df),
        "sentiment_distribution": get_sentiment_distribution(df),
        
    }
    return result


def get_sentiment_timeseries(df):
    sentiment_ts = (
        df.groupby(['course', 'month', 'sentiment_label'])
        .size()
        .unstack(fill_value=0)
        .reset_index()
    )

    sentiment_ts = sentiment_ts.reindex(columns=['course', 'month', 'Negative', 'Neutral', 'Positive'], fill_value=0)

    return sentiment_ts



