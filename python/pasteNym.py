import utils
import db
import html


class PasteNym:

    def __init__(self,idLength=utils.ID_LENGTH):
        self.idLength = idLength
        self.db = db.BaseModel()

    def newText(self, text):
        if len(text) <= 0:
            return []

        urlId = utils.generateRandomString(self.idLength)

        while self.db.idExists(urlId) is not None:
            print(urlId)
            urlId = utils.generateRandomString(self.idLength)

        return self.db.insertText(html.escape(text), urlId)

    def getTextById(self, urlId):
        return self.db.getTextByUrlId(urlId)
