import base64
import json
import websocket

from cron import Cron
from pasteNym import PasteNym
import utils
from datetime import datetime
import traceback
import ipfsHandler
import rel

self_address_request = json.dumps({
    "type": "selfAddress"
})

CMD_NEW_TEXT = "newText"
CMD_GET_TEXT = "getText"
CMD_GET_PING = "ping"

NYM_KIND_TEXT = b'\x00'  # uint8
NYM_KIND_BINARY = b'\x01'

NYM_HEADER_SIZE_TEXT = b'\x00' * 8  # set to 0 if it's a text
NYM_HEADER_BINARY = b'\x00' * 8  # not used now, to investigate later


class Serve:

    @staticmethod
    def createPayload(recipient, reply_message, is_text=True):
        if is_text:
            metadata = (NYM_KIND_TEXT + NYM_HEADER_SIZE_TEXT).decode('utf-8')
        else:
            # not used now, to investigate later
            metadata = (NYM_KIND_BINARY + NYM_HEADER_BINARY).decode('utf-8')

        return json.dumps({
            "type": "send",
            # append \x00 because of "kind" message is non binary and equal 0 + 1 bytes because no header are set
            "message": metadata + reply_message,
            "recipient": recipient,
            "withReplySurb": False
            # "replySurb": reply_surb
        })

    def __init__(self):
        url = f"ws://{utils.NYM_CLIENT_ADDR}:1977"
        self.firstRun = True
        self.pasteNym = PasteNym()
        self.cron = Cron()
        self.cron.executeCron()

        websocket.enableTrace(False)
        self.ws = websocket.WebSocketApp(url,
                                         on_message=lambda ws, msg: self.on_message(
                                             ws, msg),
                                         on_error=lambda ws, msg: self.on_error(
                                             ws, msg),
                                         on_close=lambda ws: self.on_close(
                                             ws),
                                         on_open=lambda ws: self.on_open(ws),
                                         on_pong=lambda ws, msg: self.on_pong(ws, msg)
                                         )

        # Set dispatcher to automatic reconnection

        self.ws.run_forever(dispatcher=rel, ping_interval=30, ping_timeout=10)

        rel.signal(2, rel.abort)  # Keyboard Interrupt
        rel.dispatch()
        self.ws.close()

    def on_pong(self, ws, msg):
        self.cron.executeCron()
        ws.send(self_address_request)

    def on_open(self, ws):
        self.ws.send(self_address_request)

    def on_error(self, ws, message):
        try:
            print(f"Error ws: {message}")
            traceback.print_exc()
        except UnicodeDecodeError as e:
            print(f"Unicode error, nothing to do about: {e}")
            return
        finally:
            self.ws.close()
            exit(1)

    def on_close(self, ws):
        print(f"Connection to nym-client closed")

    def on_message(self, ws, message):
        try:
            if self.firstRun:
                self_address = json.loads(message)
                print("Our address is: {}".format(self_address["address"]))
                self.firstRun = False
                return

            received_message = json.loads(message)

            # test if it's ping answer message
            if received_message.get('address'):
                return

            recipient = None

        except UnicodeDecodeError as e:
            print(f"Unicode error, nothing to do about: {e}")
            return

        try:
            if utils.isBase64(received_message['message']):
                received_message['message'] = base64.b64decode(received_message['message'])
                kindReceived = received_message['message'][0:8][0:1]
            else:
                kindReceived = bytes(received_message['message'][0:8], 'utf-8')[0:1]
        except IndexError as e:
            print(f"Error getting message kind, {e}")
            traceback.print_exc()
            return

        # we received the data in a json
        try:
            # received data with padding, start at the 9th bytes
            payload = received_message['message'][9:]

            if kindReceived == NYM_KIND_TEXT:
                received_data = json.loads(payload)
            elif kindReceived == NYM_KIND_BINARY:
                print("bin data received. Don't know what to do")
                return
            else:
                print("no message kind received. Don't know what to do")
                return

            recipient = received_data['sender']
            event = received_data['event']
            data = received_data['data']

            if utils.DEBUG:
                print(f"-> Got {received_message}")
            else:
                print(f"-> Got {event} from {recipient}")

        except (IndexError, KeyError, json.JSONDecodeError) as e:
            if recipient is not None:
                err_msg = f"Error parsing message: {e}"
                reply_message = err_msg
                self.ws.send(Serve.createPayload(recipient, reply_message))
                print(f"send error message, data received {message}")
                return
            else:
                print(f"No recipient found in message {received_message}")
                return None

        reply = ""

        if recipient is not None:
            if event == CMD_NEW_TEXT:
                reply = self.newText(recipient, data)
            elif event == CMD_GET_TEXT:
                reply = self.getText(recipient, data)
            elif event == CMD_GET_PING:
                reply = self.getVersion(recipient)
            else:
                reply = f"Error event {event} not found"

            if utils.DEBUG:
                print(f"-> Rcv {event} - answers {reply} over the mix network.")
            else:
                print(f"-> Rcv {event} - answers to {recipient} over the mix network.")

            self.ws.send(reply)
        else:
            print(f"No recipient found in message {received_message}")

    def newText(self, recipient, message):

        reply_message = None
        if "text" in message.keys():
            if len(message.get('text')) <= utils.PASTE_MAX_LENGTH:
                urlId = self.pasteNym.newText(message)

                if urlId is not None:
                    try:
                        if len(urlId) > 0:
                            reply_message = {"ipfs": False}
                            if urlId[0].get('is_ipfs'):
                                reply_message['ipfs'] = urlId[0].get('is_ipfs')
                                reply_message.update({"hash": urlId[0].get('url_id')})

                            reply_message.update({"url_id": urlId[0].get('url_id')})
                        else:
                            reply_message = "Error"
                    except IndexError as e:
                        print(e)
                        reply_message = "Error"
                else:
                    reply_message = "Error with text to share"
            else:
                reply_message = f"Error text too long. Max is {utils.PASTE_MAX_LENGTH}"
        else:
            reply_message = "Message has no text!"

        return Serve.createPayload(recipient, json.dumps(reply_message))

    def getText(self, recipient, message):
        text = self.pasteNym.getTextById(message)

        try:
            if text is not None:

                # append a Z to be in iso format that JS Date can understand
                createdOn = text.get('created_on')

                if type(createdOn) == str:

                    # remove the microseconds
                    text['created_on'] = datetime.strptime(createdOn.split(".")[0], "%Y-%m-%dT%H:%M:%S")

                elif createdOn is not None:
                    text['created_on'] = datetime.isoformat(
                        createdOn) + 'Z'

                if text.get('expiration_time'):
                    text['expiration_time'] = datetime.isoformat(
                        text['expiration_time']) + 'Z'

                reply_message = json.dumps(text, default=str)

            else:
                reply_message = json.dumps({"error": "text not found"})
        except IndexError as e:
            print(e)
            reply_message = "error"

        return Serve.createPayload(recipient, reply_message)

    def getVersion(self, recipient):

        capabilities = {'ipfs_hosting': utils.IPFS_HOST is not None,
                        'expiration_bitcoin_height': utils.BITCOIN_RPC_URL is not None and self.cron.isBitcoinExpirationWorking() }
        reply_message = {"version": utils.VERSION, "alive": True, "capabilities": capabilities}
        return Serve.createPayload(recipient, json.dumps(reply_message))
