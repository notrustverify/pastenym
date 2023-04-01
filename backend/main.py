import utils
from serve import Serve
import db
from os.path import exists
import ipfsHandler
import cron
import time

if __name__ == '__main__':

    if not(exists("./data/data.db")):
        print("Create database done")
        db.create_tables()

    # wait for nym-cloent to start, init and start the backend server
    time.sleep(6)
    serveClient = Serve()
