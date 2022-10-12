import ast
import json

from pasteNym import PasteNym
from secrets import token_urlsafe

if __name__ == '__main__':
    pasteService = PasteNym()
    print(f"URL id is: {pasteService.newText('testing insertion')[0]['url_id']}")
    print(pasteService.getTextById("YrgZZNCO"))





