from utils.nlp_feedback_analysis import run_topic_modeling

sample_feedbacks = [
    "The course was excellent with real-world examples.",
    "Too much theory and less hands-on practice.",
    "The instructor was supportive and explained everything well.",
    "I wish there were more coding assignments.",
    "The sessions were too long and boring.",
    "Great course structure and very informative.",
    "Some concepts were not explained clearly.",
    "I enjoyed the discussions and interactive sessions."
]

result = run_topic_modeling(sample_feedbacks, num_topics=3, sample_count=2)

# Print the result to see the topics
import json
print(json.dumps(result, indent=4))
