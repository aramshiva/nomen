import argparse
import os
import time
from datetime import timedelta

import mysql.connector
from dotenv import load_dotenv

load_dotenv('.env.local')


def create_database(db_config):
    db_config['database'] = os.getenv('DATABASE_NAM')
    print(f"Connecting to MySQL server at {db_config['host']}...")
    
    conn = mysql.connector.connect(**db_config)
    c = conn.cursor()
    
    state_table_name = 'namesbyarea'
    c.execute(f'''
        CREATE TABLE IF NOT EXISTS {state_table_name} (
            name VARCHAR(255),
            sex CHAR(1),
            amount INT,
            year INT,
            state CHAR(2)
        )
    ''')
    
    conn.commit()
    return conn


def process_state_files(folder_path, db_conn, batch_size):
    if not os.path.exists(folder_path):
        print(f"Error: Folder path '{folder_path}' does not exist")
        return
    
    files = [f for f in os.listdir(folder_path) if f.endswith('.TXT')]
    if not files:
        print(f"Error: No .TXT files found in '{folder_path}'")
        return
        
    processed_rows = 0
    total_rows = 0
    total_time = 0
    batch_count = 0
    
    print(f"Processing state files with batch size: {batch_size}")
    
    for file in files:
        with open(
            os.path.join(folder_path, file), 
            'r', 
            encoding='utf-8'
        ) as f:
            total_rows += sum(1 for _ in f)
    
    print(f"Found {total_rows} total rows in state files")
    
    for file in files:
        state = file.split('.')[0]
        batch_data = []
        file_start_time = time.time()
        
        print(f"Processing file {file} for state {state}...")
        
        with open(
            os.path.join(folder_path, file), 
            'r', 
            encoding='utf-8'
        ) as f:
            for line in f:
                parts = line.strip().split(',')
                if len(parts) == 5:
                    state_code, sex, year, name, amount = parts
                    try:
                        batch_data.append(
                            (name, sex, int(amount), int(year), state_code)
                        )
                        processed_rows += 1
                    except ValueError as e:
                        print(f"Error parsing line: {line.strip()} - {e}")
                        continue
                    
                    if len(batch_data) >= batch_size:
                        batch_start_time = time.time()
                        insert_state_batch(db_conn, batch_data)
                        batch_time = time.time() - batch_start_time
                        total_time += batch_time
                        batch_count += 1
                        
                        print_state_progress(
                            processed_rows, 
                            total_rows, 
                            name, 
                            year, 
                            sex, 
                            state_code, 
                            batch_time
                        )
                        batch_data = []
        
        if batch_data:
            batch_start_time = time.time()
            insert_state_batch(db_conn, batch_data)
            batch_time = time.time() - batch_start_time
            total_time += batch_time
            batch_count += 1
            
            print_state_progress(
                processed_rows, 
                total_rows, 
                batch_data[-1][0],  # name
                batch_data[-1][3],  # year
                batch_data[-1][1],  # sex
                batch_data[-1][4],  # state
                batch_time
            )
        
        file_time = time.time() - file_start_time
        print(f"Processed file for state {state} in {timedelta(seconds=file_time)}")
    
    if batch_count > 0:
        avg_batch_time = total_time / batch_count
        print("\nState Data Performance Summary:")
        print(f"Total processing time: {timedelta(seconds=total_time)}")
        print(f"Average batch processing time: {timedelta(seconds=avg_batch_time)}")
        print(f"Rows per second: {processed_rows / total_time:.2f}")


def insert_state_batch(conn, batch_data):
    """
    Insert a batch of state data records into the database.
    
    Args:
        conn: Database connection object
        batch_data: List of data tuples to insert
    """
    c = conn.cursor()
    table_name = 'namesbyarea'
    
    query = f'''
        INSERT INTO {table_name} (name, sex, amount, year, state)
        VALUES (%s, %s, %s, %s, %s)
    '''
    
    try:
        c.executemany(query, batch_data)
        conn.commit()
    except mysql.connector.Error as e:
        print(f"Database error during batch insert: {e}")
        conn.rollback()


def print_state_progress(
    current, 
    total, 
    name, 
    year, 
    sex, 
    state, 
    batch_time=None
):
    """
    Print progress information for state data processing.
    
    Args:
        current: Current number of processed rows
        total: Total number of rows to process
        name: Current name being processed
        year: Year of the current record
        sex: Sex associated with the current record
        state: State code for the current record
        batch_time: Time taken to process the current batch
    """
    percentage = (current / total) * 100
    if sex == "F":
        sex = "Female"
    elif sex == "M":
        sex = "Male"
    else:
        sex = "Unknown"
    
    progress_msg = (
        f"Processed {current}/{total} rows "
        f"({percentage:.2f}%) "
        f"({sex} {name} for {year} in {state})"
    )
    if batch_time is not None:
        progress_msg += f" - Batch inserted in {batch_time:.2f}s"
    
    print(progress_msg)


def parse_arguments():
    """
    Parse command-line arguments for the script.
    
    Returns:
        Parsed arguments object
    """
    parser = argparse.ArgumentParser(
        description='Import state name data into MySQL database'
    )
    parser.add_argument(
        '--batch-size', 
        type=int, 
        default=10000,
        help='Number of records to insert in a single batch (default: 10000)'
    )
    parser.add_argument(
        '--folder', 
        type=str,
        default='state',
        help='Path to folder containing state data files (default: state)'
    )
    return parser.parse_args()


def main():
    """
    Main function to run the state data import process.
    
    Handles environment setup, database connection, and orchestrates
    the data import process.
    """
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
    
    state_folder_path = args.folder
    
    if not os.path.isabs(state_folder_path):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        state_folder_path = os.path.join(script_dir, state_folder_path)
    
    print(f"Using state folder path: {state_folder_path}")
    
    batch_size = args.batch_size
    
    try:
        conn = create_database(db_config)
    except mysql.connector.Error as e:
        print(f"Error creating database: {e}")
        print(f"Attempted to connect to: {db_config['host']}")
        return
    
    try:
        print("Processing state data...")
        process_state_files(state_folder_path, conn, batch_size)
    except Exception as e:
        print(f"Error processing files: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()
    
    total_time = time.time() - start_time
    print(f"\nTotal script execution time: {timedelta(seconds=total_time)}")


if __name__ == '__main__':
    main()