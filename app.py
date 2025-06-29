from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from datetime import date
from werkzeug.security import check_password_hash
from flask_cors import CORS
from utils.nlp_feedback_analysis import run_feedback_analysis, get_sentiment_timeseries, clean_text
import pandas as pd
import os

from flask_cors import CORS



app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True  

db = SQLAlchemy(app)
CORS(app, supports_credentials=True)



REACT_BUILD_PATH = os.path.join('static', 'react_dashboard', 'dashboard-frontend', 'build')


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    feedback_text = db.Column(db.Text, nullable=False)
    date_submitted = db.Column(db.Date, default=date.today)



@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    full_path = os.path.join(REACT_BUILD_PATH, path)
    if path != "" and os.path.exists(full_path):
        return send_from_directory(REACT_BUILD_PATH, path)
    else:
        
        return send_from_directory(REACT_BUILD_PATH, 'index.html')


@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    admin = Admin.query.filter_by(username=username).first()
    if admin and check_password_hash(admin.password, password):
        session['admin'] = username  
        return jsonify({'message': 'Login successful'})
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('admin', None) 
    return jsonify({'success': True})

@app.route('/api/submit_feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    course = data.get('course')
    rating = data.get('rating')
    feedback_text = data.get('feedback_text')

    new_feedback = Feedback(
        course=course,
        rating=int(rating),
        feedback_text=feedback_text
    )
    db.session.add(new_feedback)
    db.session.commit()

    return jsonify({'success': True})

@app.route('/api/analysis', methods=['GET'])
def api_analysis():
    if 'admin' not in session:
        return jsonify({'message': 'Unauthorized'}), 401

    feedbacks = Feedback.query.all()
    data = [{
        'course': f.course,
        'rating': f.rating,
        'feedback_text': f.feedback_text,
        'date_submitted': f.date_submitted
    } for f in feedbacks]

    df = pd.DataFrame(data)
    df['cleaned'] = df['feedback_text'].apply(clean_text)
    df['date_submitted'] = pd.to_datetime(df['date_submitted'])
    df['month'] = df['date_submitted'].dt.strftime('%Y-%m')

    result = run_feedback_analysis(df)
    sentiment_monthly = get_sentiment_timeseries(df).to_dict(orient='records')
    avg_rating_monthly = (
        df.groupby(['course', 'month'])['rating']
        .mean().round(1).reset_index()
        .rename(columns={'rating': 'average_rating'})
        .to_dict(orient='records')
    )

    return jsonify({
        "summary": result["summary"],
        "average_rating": result["average_rating"].to_dict(),
        "sentiment_distribution": result["sentiment_distribution"].to_dict(),
        "sentiment_monthly": sentiment_monthly,
        "rating_monthly": avg_rating_monthly
    })


if __name__ == '__main__':
    app.run(debug=True, host='localhost')
