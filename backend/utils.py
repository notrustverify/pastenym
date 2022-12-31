
import os
import base64
from secrets import token_urlsafe
from cid import make_cid
from dotenv import load_dotenv

load_dotenv()

ID_LENGTH = 6
NYM_CLIENT_ADDR = os.getenv("NYM_CLIENT_ADDR", '127.0.0.1')
PASTE_MAX_LENGTH = 10 ** 100  # very big limit because right now we accept file
DEBUG = bool(os.getenv("DEBUG", 'False').lower() in ('true', '1', 't'))

IPFS_HOST = os.getenv("IPFS_HOST", "localhost")
IPFS_CLUSTER_HOST = os.getenv("IPFS_CLUSTER_HOST", None)


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

def isBase32(sb):
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
        return base64.b32encode(base64.b32decode(sb_bytes)) == sb_bytes
    except Exception:
        return False

def isIpfsCID(urlId):
    # to be improved, lib is not supported
    try:
        make_cid(urlId)
    except Exception:
        return False

    return True


def areEncParamsOk(encParams):
    thingThatIsWrong = ""

    # consider it as public
    if encParams.get('iv') == "" and encParams.get('adata') == "" and encParams.get('salt') == "":
        return 0 == len(thingThatIsWrong),False

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
            'mode') not in ['ccm', 'ocb2', 'gcm']:
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

    return 0 == len(thingThatIsWrong),True
