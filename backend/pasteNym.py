from datetime import datetime

import db
import sys
import utils
import html
import json
import base64
import ipfsHandler
from utils import isBase64


class PasteNym:

    def __init__(self, idLength=utils.ID_LENGTH):
        self.idLength = idLength
        self.db = db.BaseModel()
        self.ipfsClient = ipfsHandler.IPFS()

    def newText(self, data):
        if len(data) <= 0:
            return None

        try:
            # text is a mandatory field
            if data.get('text') and (type(data.get('text')) == str or type(data.get('text')) == dict):
                text = str(data.get('text'))
            else:
                print("Error with paste content")
                return None

            # by default all paste are private
            private = True
            if data.get('private') and type(data.get('private')) == bool:
                private = data.get('private')

            # by default all paste will not be burn
            burn = False
            if data.get('burn') and type(data.get('burn')) == bool:
                burn = data.get('burn')

            # by default the pastes are not uploaded to IPFS
            ipfs = False
            if data.get('ipfs') and type(data.get('ipfs')) == bool:
                ipfs = data.get('ipfs')

            # by default encryption is not mandatory
            encParamsB64 = None
            if 'encParams' in data.keys() and data.get('encParams') and type(data.get('encParams')) == dict:
                encParams = data.get('encParams')

                # We check that the provided params are of right types and string length (to avoid storing other undesired values)
                encParamOk, private = utils.areEncParamsOk(encParams)
                if encParamOk:
                    encParamsB64 = str(base64.b64encode(json.dumps(encParams).encode("utf-8")),'utf-8')
                else:
                    print("Provided encryption parameters are not valid")
                    return None

            # if ipfs is used we have to get the hash that represent the paste on IPFS
            if ipfs and private:
                toStore = {'text': html.escape(text), 'encryption_params_b64': encParamsB64, 'is_private': private,
                        'is_burn': burn,'is_ipfs': ipfs,"created_on":datetime.isoformat(datetime.utcnow().replace(hour=0,minute=0,second=0,microsecond=0))}

                ipfsCID = self.ipfsClient.storeData(json.dumps(toStore))

                if ipfsCID is None:
                    print("Error with IPFS")
                    return None

                return [{'url_id': ipfsCID, 'is_private': private,
                         'is_burn': burn, 'is_ipfs': ipfs, 'hash': ipfsCID}]
            elif ipfs and not private:
                print("Public share on IPFS are not authorized")
                return None
            elif not ipfs:
                urlId = utils.generateRandomString(self.idLength)

                while self.db.idExists(urlId) is not None:
                    urlId = utils.generateRandomString(self.idLength)

                return self.db.insertText(html.escape(text), urlId, encParamsB64, private, burn, ipfs)


        except (KeyError, AttributeError) as e:
            print(f"Key not found in newText data: {e}")
            return None


    def getTextById(self, data):
        if len(data) >= 1:

            try:
                if data.get('urlId') and (type(data.get('urlId')) == str or type(data.get('urlId')) == dict):

                    urlId = data.get('urlId').strip()
                    retreivedText = None

                    if utils.isIpfsCID(urlId):
                        try:
                            ipfsData = self.ipfsClient.getData(urlId)
                            if ipfsData:
                                retreivedText = json.loads(ipfsData)
                        except json.JSONDecodeError as e:
                            print(f"error with decoding JSON from IPFS, {e}")
                            return None
                    else:
                        retreivedText = self.db.getTextByUrlId(urlId)

                    if retreivedText:
                        if retreivedText.get("encryption_params_b64"):
                            retreivedText["encParams"] = json.loads(
                                base64.b64decode(retreivedText["encryption_params_b64"]).decode("utf-8"))
                            del retreivedText["encryption_params_b64"]

                        if retreivedText.get('is_ipfs') and not utils.isIpfsCID(urlId):
                            try:

                                dataFromIpfs = self.ipfsClient.getData(retreivedText['text'])

                                if dataFromIpfs is not None:
                                    retreivedText['text'] = dataFromIpfs
                                else:
                                    return None

                            except KeyError:
                                print("this shouldn't happen")
                                return None

                        return retreivedText

            except KeyError as e:
                print(f"Key not found in getTextId data: {e}")
                return None

        return None
