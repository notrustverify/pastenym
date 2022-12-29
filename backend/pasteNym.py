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

                def areEncParamsOk(encParams):
                    thingThatIsWrong = ""

                    if not encParams.get('iv') or type(encParams.get('iv')) != str or not isBase64(encParams.get('iv')):
                        thingThatIsWrong = "iv"
                    elif not encParams.get('v') or type(encParams.get('v')) != int:
                        thingThatIsWrong = "v"
                    elif not encParams.get('iter') or type(encParams.get('iter')) != int:
                        thingThatIsWrong = "iter"
                    elif not encParams.get('ks') or type(encParams.get('ks')) != int or encParams.get('ks') not in [128,
                                                                                                                    192,
                                                                                                                    256]:
                        thingThatIsWrong = "ks"
                    elif not encParams.get('ts') or type(encParams.get('ts')) != int or encParams.get('ts') not in [64,
                                                                                                                    96,
                                                                                                                    128]:
                        thingThatIsWrong = "ts"
                    elif not encParams.get('mode') or type(encParams.get('mode')) != str or encParams.get(
                            'mode') not in ['ccm', 'ocb2','gcm']:
                        thingThatIsWrong = "mode"
                    # adata field is supposed to be empty so should not be "get"
                    elif encParams.get('adata') or type(encParams.get('adata')) != str or 0 != len(
                            encParams.get('adata')):
                        thingThatIsWrong = "adata"
                    elif not encParams.get('cipher') or type(encParams.get('cipher')) != str or encParams.get(
                            'cipher') not in ['aes']:
                        thingThatIsWrong = "cipher"
                    elif not encParams.get('salt') or type(encParams.get('salt')) != str or not isBase64(
                            encParams.get('salt')) or 8 != len(base64.b64decode(encParams.get('salt'))):
                        thingThatIsWrong = "salt"

                    if 0 != len(thingThatIsWrong):
                        print(f"Encryption params have wrong {thingThatIsWrong}")

                    return 0 == len(thingThatIsWrong)

                # We check that the provided params are of right types and string length (to avoid storing other undesired values)
                if areEncParamsOk(encParams):
                    encParamsB64 = base64.b64encode(json.dumps(encParams).encode("utf-8"))
                else:
                    print("Provided encryption parameters are not valid")
                    return None

            urlId = utils.generateRandomString(self.idLength)

            while self.db.idExists(urlId) is not None:
                urlId = utils.generateRandomString(self.idLength)

            # if ipfs is used we have to get the hash that represent the paste on IPFS
            if ipfs:
                text = self.ipfsClient.storeData(text)

            return self.db.insertText(html.escape(text), urlId, encParamsB64, private, burn, ipfs)

        except (KeyError, AttributeError) as e:
            print(f"Key not found in newText data: {e}")
            return None

    def getTextById(self, data):

        if len(data) >= 1:
            if len(data) > 1:
                print(
                    f"{data[0].get('urlId')} has {len(data)} associated texts.. This should not happen.. Return the first one",
                    file=sys.stderr)
                data = data[0]

            try:
                if data.get('urlId') and (type(data.get('urlId')) == str or type(data.get('urlId')) == dict):
                    urlId = data.get('urlId').strip()
                    retreivedText = self.db.getTextByUrlId(urlId)

                    if retreivedText:
                        if retreivedText.get("encryption_params_b64"):
                            retreivedText["encParams"] = json.loads(
                                base64.b64decode(retreivedText["encryption_params_b64"]).decode("utf-8"))
                            del retreivedText["encryption_params_b64"]

                        if retreivedText.get('is_ipfs'):
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
