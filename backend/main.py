from serve import Serve
import db

if __name__ == '__main__':

    if not (exists("./data/data.db")):
        db.create_tables()

    serveClient = Serve()
    serveClient.start()
