import traceback
from ipyfs import Files
import json
import requests, urllib
import tempfile
from io import StringIO

import utils


class IPFS:

    def __init__(self):
        pass

    def storeData(self,data):
        url = f"http://localhost:5001/api/v0/add"

        # at first get only get hash file because we use this as the name
        with StringIO(data) as f:
            try:
                response = requests.post(f"{utils.IPFS_HOST}/add", files={"file": f.read()},params={'cid-version':1,"only-hash":1})
            except requests.RequestException as e:
                print(f"Error for getting hash {e}")
                return None

            if response.ok:
                hashFile = response.json()["Hash"]
            else:
                return None

        with StringIO(data) as f:
            try:
                response = requests.post(f"{utils.IPFS_HOST}/add", files={f"{hashFile}": f.read()},params={'cid-version':1})

                if not response.ok:
                    return None

            except requests.RequestException as e:
                print(f"Error for add text {e}")
                print(traceback.print_exc())
                return None

        return hashFile



    def getData(self,hash):
        try:
            response = requests.post(f"{utils.IPFS_HOST}/cat",params={'arg':hash})
            if response.ok:
                return response.content.decode()
            else:
                print("Hash not found")
                return None
        except requests.RequestException as e:
            print(f"Error for cat text {e}")
            print(traceback.print_exc())
            return None
