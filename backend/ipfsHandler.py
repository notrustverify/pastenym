import traceback
from ipyfs import Files
import json
import requests, urllib
import tempfile
from io import StringIO

import utils


class IPFS:

    def __init__(self):
        self.ipfsApi = f"http://{utils.IPFS_HOST}:5001/api/v0"

    def storeData(self,data):
        # at first get only get hash file because we use this as the name
        with StringIO(data) as f:
            try:
                response = requests.post(f"{self.ipfsApi}/add", files={"file": f.read()},params={'cid-version':1,"only-hash":1})

            except requests.RequestException as e:
                print(f"Error for getting hash {e}")
                return None

            if response.ok:
                hashFile = response.json()["Hash"]

                # go back to the beginning
                f.seek(0)
                response = requests.post(f"{self.ipfsApi}/add", files={f"{hashFile}": f.read()},
                                         params={'cid-version': 1})
                if not response.ok:
                    return None
            else:
                return None

        return hashFile



    def getData(self,hash):
        try:
            response = requests.post(f"{self.ipfsApi}/cat",params={'arg':hash})

            if response.ok:
                return response.content.decode()
            else:
                print("Hash not found")
                return None
        except requests.RequestException as e:
            print(f"Error for cat text {e}")
            print(traceback.print_exc())
            return None
