import os
import base64
from secrets import token_urlsafe
from dotenv import load_dotenv

load_dotenv()

ID_LENGTH = 6
NYM_CLIENT_ADDR = os.getenv("NYM_CLIENT_ADDR",'127.0.0.1')
PASTE_MAX_LENGTH = 1000000



def generateRandomString(length):
    return token_urlsafe(nbytes=length)

def isBase64(sb):
    """
    Check if is base64 encoded.
    From: https://stackoverflow.com/a/45928164
    """
    try:
        if isinstance(sb, str):
            # If there's any unicode here, an exception will be thrown and the function will return false
            sb_bytes = bytes(sb, 'ascii')
        elif isinstance(sb, bytes):
            sb_bytes = sb
        else:
            raise ValueError("Argument must be string or bytes")
        return base64.b64encode(base64.b64decode(sb_bytes)) == sb_bytes
    except Exception:
        return False