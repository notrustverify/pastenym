import utils
import db
import html
import json


class PasteNym:

    def __init__(self, idLength=utils.ID_LENGTH):
        self.idLength = idLength
        self.db = db.BaseModel()

    def newText(self, data):
        if len(data) <= 0:
            return None

        try:
            urlId = utils.generateRandomString(self.idLength)

            while self.db.idExists(urlId) is not None:
                urlId = utils.generateRandomString(self.idLength)

            # text is a mandatory field

            if data.get('text') and type(data.get('text')) == str:
                text = data.get('text')
            else:
                return None

            # by default all paste are private
            private=True
            if data.get('private') and type(data.get('private')) == bool:
                private = data.get('private')

            # by default all paste are private
            burn=False            
            if data.get('burn') and type(data.get('burn')) == bool:
                burn = data.get('burn')

            return self.db.insertText(html.escape(text), urlId, private=private,burn=burn)
        except KeyError as e:
            print(f"Key not found in newText data as {e}")
            return None

    def getTextById(self, data):

        if len(data) <= 0:
            return None

        try:

            if data.get('urlId') and type(data.get('urlId')) == str:
                urlId = data.get('urlId')
            else:
                return None

            return self.db.getTextByUrlId(urlId)
        except KeyError as e :
            print(f"Key not found in getTextId data as {e}")
            return None
