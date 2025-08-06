import mysql.connector
import os
import time
import argparse
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv('.env.local')

def create_db(db_config): # create db if it doesn't exist.
    db_config['database'] = os.getenv('DATABASE_NAM')    
    print(f"Connecting to MySQL server at {db_config['host']}...")
    
    conn = mysql.connector.connect(**db_config)
    c = conn.cursor()
    
    table_name = os.getenv('DB_TABLE_NAM', 'names')
    c.execute(f'''
        CREATE TABLE IF NOT EXISTS {table_name} (
            name VARCHAR(255),
            sex CHAR(1),
            amount INT,
            year INT
        )
    ''')
    conn.commit()
    return conn

def process_files(folder_path, db_conn, total_rows, batch_size): 
    # folder path is where your storing the SSA's data files
    # db_conn is just the connection to db
    # total_rows is the total number of entries in the db (so you can calculate progress if you have a small batch size)
    # batch_size is how many rows you want to insert at once, 
    # i recommend something high, or else it will take a long time.
    # You can change this by using the `--batch-size` argument when running the program, default is 10000.
    files = [f for f in os.listdir(folder_path) if f.endswith('.txt')]
    processed_rows = 0
    total_time = 0
    batch_count = 0
    
    print(f"Processing files with batch size: {batch_size}") 
    
    for file in files:
        year = int(file[3:7])  # extract year from filename "yobYYYY.txt"
        batch_data = []
        file_start_time = time.time()
        
        with open(os.path.join(folder_path, file), 'r', encoding='utf-8') as f:
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
        print("Performance Summary:")
        print(f"Total processing time: {timedelta(seconds=total_time)}")
        print(f"Average batch processing time: {timedelta(seconds=avg_batch_time)}")
        print(f"Rows per second: {total_rows / total_time:.2f}")
        # just some stats ¯\_(ツ)_/¯

def insert_batch(conn, batch_data): # this is the actual code that inserts the batch into the db.
    c = conn.cursor()
    table_name = os.getenv('DB_TABLE_NAM', 'names')
    
    query = f'''
        INSERT INTO {table_name} (name, sex, amount, year) 
        VALUES (%s, %s, %s, %s)
    '''
    
    c.executemany(query, batch_data)
    conn.commit()

def print_progress(current, total, name, year, sex, batch_time=None): # progress tracking stuff
    percentage = (current / total) * 100
    if sex == "F": sex = "Female"
    elif sex == "M": sex = "Male"
    else: sex = "Unknown"
    
    progress_msg = f"Processed {current}/{total} rows ({percentage:.2f}%) ({sex} {name} for {year})"
    if batch_time is not None:
        progress_msg += f" - Batch inserted in {batch_time:.2f}s"
    
    print(progress_msg)

def parse_arguments(): # parse batch size arg
    parser = argparse.ArgumentParser(description='Import name data into MySQL database')
    parser.add_argument('--batch-size', type=int, default=100000,
                        help='Number of records to insert in a single batch (default: 10000)')
    return parser.parse_args()

def main():
    start_time = time.time() # stats stuff
    
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
    total_rows = 2149123  # you can calculate this automatically if you really wanted, im lazy and haven't yet LOL.
    try:
        conn = create_db(db_config)
    except mysql.connector.Error as e:
        print(f"Error creating database: {e}")
        print(f"Attempted to connect to: {db_config['host']}")
        return
    
    try:
        process_files(folder_path, conn, total_rows, args.batch_size)
    except (mysql.connector.Error, FileNotFoundError, IOError) as e:
        print("Error processing files:", e)
    
    total_time = time.time() - start_time
    print(f"\nTotal main db script execution time: {timedelta(seconds=total_time)}")
    
    print("Now creating uniquenames db...")
    table_name = os.getenv('DB_TABLE_NAM', 'names')
    create_query = """
    CREATE TABLE `uniquenames` (
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
"""
    query = f"INSERT INTO `uniquenames` (`name`) SELECT DISTINCT `name` FROM `{table_name}`;"
    try:
        cursor = conn.cursor()
        cursor.execute(create_query)
        cursor.execute(query)
        conn.commit()
        print("`uniquenames` table created successfully.")
    except mysql.connector.Error as e:
        print(f"Error creating `uniquenames` table: {e}")
    finally:
        cursor.close()
    print("now creating `unique_names` table...")
    table_name = os.getenv('DB_TABLE_NAM', 'names')
    create_query = """
    CREATE TABLE IF NOT EXISTS `unique_names` (
        `name` varchar(255) DEFAULT NULL,
        `sex` char(1) DEFAULT NULL,
        `amount` int(11) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci
    """
    query = f"""
    INSERT INTO `unique_names` (`name`, `sex`, `amount`)
    SELECT `name`, `sex`, SUM(`amount`) as `amount`
    FROM `{table_name}`
    GROUP BY `name`, `sex`
    """
    try:
        cursor = conn.cursor()
        cursor.execute(create_query)
        cursor.execute(query)
        conn.commit()
    except mysql.connector.Error as e:
        print(f"Error creating `unique_names` table: {e}")
    finally:
        cursor.close()
    print("`unique_names` table created successfully.")
    print("Names database import completed successfully. Please run the actuary/main.py file to generate actuarial data for number components.")
    print("Now closing connection...")
    conn.close()
    print("Connection closed.")
    print("All done! :)")
if __name__ == '__main__':
    main()
