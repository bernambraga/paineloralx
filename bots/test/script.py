import datetime
import os

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    log_file = os.path.join(script_dir, 'logfile.log')

    with open(log_file, 'a') as f:
        f.write(f"\nScript executado em: {datetime.datetime.now()}")

if __name__ == "__main__":
    main()
