import utils
from serve import Serve
import db
from os.path import exists
import ipfsHandler
import cron

if __name__ == '__main__':

    if not(exists("./data/data.db")):
        print("Create database done")
        db.create_tables()

    # init and start the backend server
    serveClient = Serve()


