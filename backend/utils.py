import os
from secrets import token_urlsafe
from dotenv import load_dotenv


load_dotenv()

ID_LENGTH = 6
NYM_CLIENT_ADDR = os.getenv("NYM_CLIENT_ADDR",'127.0.0.1')
PASTE_MAX_LENGTH = 1000000

def generateRandomString(length):
    return token_urlsafe(nbytes=length)
