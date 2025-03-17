"""
NAMES DB
This script has all names listed on a social security card between 1880 and 2023.
This data is pulled from the US Social Security Administration's Baby Names from Social Security Card Applications - National Dataset.
This data can be pulled from this link: https://catalog.data.gov/dataset/baby-names-from-social-security-card-applications-national-data
This script will insert the data into a MySQL database.

Why? I was bored also why not?

Some things to keep in note:
- As of 2024 there are around 2,117,219 rows in the database.
- The data is stored in a folder called "names" in the same directory as this script.
- Names with 5 or less occurrences with the sex and year are defaulted to 5 by the SSA to protect privacy
- The data is stored in a MySQL database with the following schema:
    - name VARCHAR(255),
    - sex CHAR(1),
    - amount INT,
    - year INT
- The sex is a single character, either "M" or "F" for Male or Female.
- The year is the year the person was born, NOT registered.

Planned Features (when i get bored again):
- Add a new column for the state the name was registered/possibly create a new database to store the state data.
- Create a web interface to search for names and display the data.
- Graphs! Who doesn't love graphs?
- An exported db file for those who don't want to set up a MySQL server :D
"""
import mysql.connector
import os
import time
import argparse
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv('.env.local')

def create_database(db_config):
    db_config['database'] = os.getenv('DATABASE_NAM')    
    print(f"Connecting to MySQL server at {db_config['host']}...")
    
    conn = mysql.connector.connect(**db_config)
    c = conn.cursor()
    
    # # Create table if it doesn't exist already
    # table_name = os.getenv('DB_TABLE_NAM', 'names')
    # c.execute(f'''
    #     CREATE TABLE IF NOT EXISTS {table_name} (
    #         name VARCHAR(255),
    #         sex CHAR(1),
    #         amount INT,
    #         year INT
    #     )
    # ''')
    conn.commit()
    return conn

def process_files(folder_path, db_conn, total_rows, batch_size):
    files = [f for f in os.listdir(folder_path) if f.endswith('.txt')]
    processed_rows = 0
    total_time = 0
    batch_count = 0
    
    print(f"Processing files with batch size: {batch_size}")
    
    for file in files:
        year = int(file[3:7])  # Extract year from filename "yobYYYY.txt"
        batch_data = []
        file_start_time = time.time()
        
        with open(os.path.join(folder_path, file), 'r') as f:
            for line in f:
                name, sex, amount = line.strip().split(',')
                batch_data.append((name, sex, int(amount), year))
                processed_rows += 1
                
                if len(batch_data) >= batch_size:
                    batch_start_time = time.time()
                    insert_batch(db_conn, batch_data)
                    batch_time = time.time() - batch_start_time
                    total_time += batch_time
                    batch_count += 1
                    
                    print_progress(processed_rows, total_rows, batch_data[-1][0], year, batch_data[-1][1], batch_time)
                    batch_data = []
        
        if batch_data:
            batch_start_time = time.time()
            insert_batch(db_conn, batch_data)
            batch_time = time.time() - batch_start_time
            total_time += batch_time
            batch_count += 1
            
            print_progress(processed_rows, total_rows, batch_data[-1][0], year, batch_data[-1][1], batch_time)
        
        file_time = time.time() - file_start_time
        print(f"Processed file for year {year} in {timedelta(seconds=file_time)}")
    
    if batch_count > 0:
        avg_batch_time = total_time / batch_count
        print(f"\nPerformance Summary:")
        print(f"Total processing time: {timedelta(seconds=total_time)}")
        print(f"Average batch processing time: {timedelta(seconds=avg_batch_time)}")
        print(f"Rows per second: {total_rows / total_time:.2f}")

def insert_batch(conn, batch_data):
    c = conn.cursor()
    table_name = os.getenv('DB_TABLE_NAM', 'names')
    
    query = f'''
        INSERT INTO {table_name} (name, sex, amount, year) 
        VALUES (%s, %s, %s, %s)
    '''
    
    c.executemany(query, batch_data)
    conn.commit()

def print_progress(current, total, name, year, sex, batch_time=None):
    percentage = (current / total) * 100
    if sex == "F": sex = "Female"
    elif sex == "M": sex = "Male"
    else: sex = "Unknown"
    
    progress_msg = f"Processed {current}/{total} rows ({percentage:.2f}%) ({sex} {name} for {year})"
    if batch_time is not None:
        progress_msg += f" - Batch inserted in {batch_time:.2f}s"
    
    print(progress_msg)

def parse_arguments():
    parser = argparse.ArgumentParser(description='Import name data into MySQL database')
    parser.add_argument('--batch-size', type=int, default=100000,
                        help='Number of records to insert in a single batch (default: 10000)')
    return parser.parse_args()

def main():
    start_time = time.time()
    
    args = parse_arguments()
    
    if not os.getenv('DATABASE_HST'):
        load_dotenv()
        
    db_config = {
        'user': os.getenv('DATABASE_USR'),
        'password': os.getenv('DATABASE_PWD'),
        'host': os.getenv('DATABASE_HST'),
        'raise_on_warnings': True
    }
    
    folder_path = os.getenv('FOLDER_PATH')  # path to the folder containing the files
    total_rows = 2117219  # you can calculate this automatically if you really wanted
    # as of 2023, the total rows is 2,117,219. This is the total number of rows in all files combined.
    
    try:
        conn = create_database(db_config)
    except Exception as e:
        print(f"Error creating database: {e}")
        print(f"Attempted to connect to: {db_config['host']}")
        return
    
    try:
        process_files(folder_path, conn, total_rows, 1000000)
    except Exception as e:
        print("Error processing files:", e)
    
    conn.close()
    
    total_time = time.time() - start_time
    print(f"\nTotal script execution time: {timedelta(seconds=total_time)}")

if __name__ == '__main__':
    main()
