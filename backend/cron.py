import json
import time
import traceback
from bitcoinrpc.authproxy import AuthServiceProxy
import db
import utils

TIME_EXECUTION_TIME_MINUTES = 1


class Cron:

    def __init__(self):
        self.db = db.BaseModel()
        self.firstRun = True

        timestampNow = time.time()
        self.lastExecutionTime = timestampNow

        if Cron.bitcoinExpirationEnabled():
            try:
                self.rpc_connection = AuthServiceProxy(
                    f"http://{utils.BITCOIN_USER}:{utils.BITCOIN_PASSWORD}@{utils.BITCOIN_RPC_URL}:{utils.BITCOIN_RPC_URL_PORT}")
                self.lastExecutionHeight = Cron.getCurrentHeight()
            except Exception:
                print("Error connection to bitcoin core rpc")
                traceback.print_exc()

    def executeCron(self):

        if self.firstRun:
            print("First run delete job")
            print(f"Number paste time deleted: {self.deleteExpiredTimePaste()}")
            if Cron.bitcoinExpirationEnabled():
                print(f"Number paste height deleted: {self.deleteExpiredHeightPaste(self.lastExecutionHeight)}")

            self.firstRun = False
            return

        timestampNow = time.time()

        # only execute delete paste every 1 minute
        if self.lastExecutionTime <= timestampNow - TIME_EXECUTION_TIME_MINUTES * 60:
            print(f"Number paste time deleted: {self.deleteExpiredTimePaste()}")
            self.lastExecutionTime = timestampNow

        if Cron.bitcoinExpirationEnabled():
            heightNow = Cron.getCurrentHeight()
            if self.lastExecutionHeight <= heightNow:
                print(f"Number paste height deleted: {self.deleteExpiredHeightPaste(heightNow)}")
                self.lastExecutionHeight = heightNow

    def deleteExpiredTimePaste(self):
        return self.db.deletePasteExpirationTime(Cron.getCurrentTime())

    def deleteExpiredHeightPaste(self, heightNow):
        if heightNow > 0:
            return self.db.deletePasteExpirationHeight(heightNow)
        else:
            print("error with current height, cannot remove the paste")

    @staticmethod
    def getCurrentHeight():

        try:
            rpc_connection = AuthServiceProxy(
                f"http://{utils.BITCOIN_USER}:{utils.BITCOIN_PASSWORD}@{utils.BITCOIN_RPC_URL}:{utils.BITCOIN_RPC_URL_PORT}")
            if rpc_connection.getblockchaininfo()['initialblockdownload']:
                print("Be careful fullnode is not synced")
            numBlocks = rpc_connection.getblockcount()
            return numBlocks
        except Exception:
            traceback.print_exc()
            return 0

    @staticmethod
    def getCurrentTime():
        return time.time()

    @staticmethod
    def bitcoinExpirationEnabled():
        return True if utils.BITCOIN_RPC_URL is not None else False
