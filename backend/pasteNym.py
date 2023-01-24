from datetime import datetime

import cron
import db
import utils
import html
import json
import base64
import ipfsHandler
import dateparser


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
            burn_view = 0
            if data.get('burn') and type(data.get('burn')) == bool:
                burn = data.get('burn')

                if data.get('burn_view') and type(data.get('burn_view')) == int and 0 < data.get('burn_view') <= 10000:
                    burn_view = data.get('burn_view')
                else:
                    burn_view = 1

            expiration_time = None
            if data.get('expiration_time') and type(data.get('expiration_time')) == str:
                rel_expiration_time = data.get('expiration_time')
                try:
                    # transform relative time from string to timestamp add in keyword to specify in future
                    expiration_time = dateparser.parse("in " + rel_expiration_time).timestamp()
                except Exception as e:
                    print(f"Parsing time error, set to 0, {e}")
                    expiration_time = 0

            expiration_height = None
            if data.get('expiration_height') and type(
                    data.get('expiration_height')) == int and data.get('expiration_height') > 0:
                if utils.BITCOIN_RPC_URL:
                    currentActual = cron.Cron.getCurrentHeight()
                    if currentActual > 0:
                        expiration_height = data.get('expiration_height') + currentActual
                    else:
                        print("error: with current height")
                        return None
                else:
                    print("error: Bitcoin block not working")
                    return None

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
                    encParamsB64 = str(base64.b64encode(json.dumps(encParams).encode("utf-8")), 'utf-8')
                else:
                    print("Provided encryption parameters are not valid")
                    return None

            # if ipfs is used we have to get the hash that represent the paste on IPFS
            if ipfs and private:
                toStore = {'text': html.escape(text), 'encryption_params_b64': encParamsB64, 'is_private': private,
                           'is_burn': burn, 'is_ipfs': ipfs, "created_on": datetime.isoformat(
                        datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0))}

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

                return self.db.insertText(html.escape(text), urlId, encParamsB64, burn_view, private, burn, ipfs,
                                          expiration_time, expiration_height)


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
