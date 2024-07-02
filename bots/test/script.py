import datetime

def main():
    with open('/home/oralx/paineloralx/bots/meu_script_output.log', 'a') as f:
        f.write(f"Script executado em: {datetime.datetime.now()}\n")

if __name__ == "__main__":
    main()
