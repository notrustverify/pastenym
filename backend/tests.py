import ast
import json

from pasteNym import PasteNym
from secrets import token_urlsafe

if __name__ == '__main__':
    pasteService = PasteNym()
    text = 'testing insertion'
    urlId = pasteService.newText(text)[0]['url_id']
    print(f"URL id is: {urlId}")

    retrievedText = pasteService.getTextById(urlId)
    print(retreivedText)

    assert(text, retrievedText)