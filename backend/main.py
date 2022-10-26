from serve import Serve
import db
from os.path import exists

if __name__ == '__main__':

    if not(exists("./data/data.db")):
        db.create_tables()

    # init and start the backend server
    serveClient = Serve()
