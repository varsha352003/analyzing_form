from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from datetime import date
from werkzeug.security import check_password_hash
from flask_cors import CORS
from utils.nlp_feedback_analysis import run_feedback_analysis, get_sentiment_timeseries, clean_text
from utils.nlp_feedback_analysis import perform_advanced_topic_modeling
import pandas as pd
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False

db = SQLAlchemy(app)
CORS(app, 
     supports_credentials=True, 
     origins=["http://localhost:3000", "http://127.0.0.1:3000"],
     allow_headers=["Content-Type"],
     methods=["GET", "POST"])


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

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if 'admin' in session:
        return jsonify({'authenticated': True, 'username': session['admin']})
    return jsonify({'authenticated': False}), 401

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


@app.route('/api/analyze_topics', methods=['POST'])
def analyze_topics():
    if 'admin' not in session:
        return jsonify({'message': 'Unauthorized'}), 401
    try:
        data = request.get_json()
        if not data or "feedback" not in data or not isinstance(data["feedback"], list):
            return jsonify({"error": "Request must be JSON with a 'feedback' key containing a list of objects."}), 400

        feedback_list = data["feedback"]
        if not feedback_list:
            return jsonify({"error": "The 'feedback' list cannot be empty."}), 400

        df = pd.DataFrame(feedback_list)

        if 'course' not in df.columns or 'feedback_text' not in df.columns:
            return jsonify({"error": "Each object in 'feedback' must have 'course' and 'feedback_text' keys."}), 400

       
        min_feedback_count = data.get("min_feedback_count", 5)

        results = perform_advanced_topic_modeling(df, min_feedback_count=min_feedback_count)

        return jsonify(results), 200 #

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Unexpected server error: {str(e)}"}), 500

@app.route('/api/analysis', methods=['GET'])
def api_analysis():
    if 'admin' not in session:
        return jsonify({'message': 'Unauthorized'}), 401

    feedbacks = Feedback.query.all()
    if not feedbacks:
        return jsonify({
            "summary": {},
            "average_rating": {},
            "sentiment_distribution": {},
            "feedback_data": [] 
        })

    data = [{
        'id': f.id, 
        'course': f.course,
        'rating': f.rating,
        'feedback_text': f.feedback_text,
        'date_submitted': f.date_submitted.isoformat()
    } for f in feedbacks]

   
    df = pd.DataFrame(data)
    df['date_submitted'] = pd.to_datetime(df['date_submitted'])

    all_courses = df['course'].unique().tolist()
    active_courses = len(all_courses)
    total_feedback = len(df)

    return jsonify({
        "total_feedback": total_feedback,
        "active_courses": active_courses,
        "feedback_data": data
    })


if __name__ == '__main__':
    app.run(debug=True, host='localhost')