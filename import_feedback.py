import sqlite3
import pandas as pd


csv_path = 'instance/synthetic_feedback_dataset.csv'


df = pd.read_csv(csv_path)

conn = sqlite3.connect('instance/data.db')


df.to_sql('feedback', conn, if_exists='replace', index=False)

conn.close()

print(" Imported feedback data into 'feedback' table successfully!")
