import os
import pandas as pd
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

DATA_FOLDER = os.getenv('DATA_FOLDER')

def create_database_and_table():
    print("Connecting to the database server...")
    connection = mysql.connector.connect(
        host=DB_CONFIG['host'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password']
    )
    cursor = connection.cursor()
    print(f"Creating database '{DB_CONFIG['database']}' if it doesn't exist...")
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
    connection.database = DB_CONFIG['database']
    print("Creating table 'mortality_data' if it doesn't exist...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mortality_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            gender ENUM('M', 'F'),
            year INT,
            age INT,
            probability_of_death FLOAT
        )
    """)
    connection.commit()
    print("Database and table setup complete.")
    cursor.close()
    connection.close()

def process_and_insert_data():
    print("Connecting to the database...")
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor()

    print(f"Processing files in folder: {DATA_FOLDER}")
    for file_name in os.listdir(DATA_FOLDER):
        if file_name.endswith('.csv'):
            print(f"Processing file: {file_name}")
            gender = file_name.split('-')[0]
            year_range = file_name.split('-')[1].replace('.csv', '')

            file_path = os.path.join(DATA_FOLDER, file_name)
            df = pd.read_csv(file_path, skiprows=1)
            print(f"File '{file_name}' loaded into DataFrame. Transforming data...")
            df = df.melt(id_vars=['Year'], var_name='Age', value_name='Probability_of_Death')
            df['Gender'] = gender

            print(f"Preparing data for batch insertion from '{file_name}'...")
            data_to_insert = [
                (row['Gender'], row['Year'], row['Age'], row['Probability_of_Death'])
                for _, row in df.iterrows()
            ]

            print(f"Inserting data from '{file_name}' into the database...")
            cursor.executemany("""
                INSERT INTO mortality_data (gender, year, age, probability_of_death)
                VALUES (%s, %s, %s, %s)
            """, data_to_insert)

    connection.commit()
    print("All data has been inserted into the database.")
    cursor.close()
    connection.close()

if __name__ == '__main__':
    print("Starting database setup...")
    create_database_and_table()
    print("Starting data processing and insertion...")
    process_and_insert_data()
    print("All tasks completed.")