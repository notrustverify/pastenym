import asyncio
import json
import websocket
from pasteNym import PasteNym
import utils
import rel
from datetime import datetime
import traceback
from PIL import Image

self_address_request = json.dumps({
    "type": "selfAddress"
})

CMD_NEW_TEXT = "newText"
CMD_GET_TEXT = "getText"

NYM_KIND_TEXT = b'\x00'  # uint8
NYM_KIND_BINARY = b'\x01'

NYM_HEADER_SIZE_TEXT = b'\x00'*8  # set to 0 if it's a text
NYM_HEADER_BINARY = b'\x00'*8  # not used now, to investigate later


class Serve:

    @staticmethod
    def createPayload(recipient, reply_message, is_text=True):
        if is_text:
            metadata = (NYM_KIND_TEXT+NYM_HEADER_SIZE_TEXT).decode('utf-8')
        else:
            # not used now, to investigate later
            metadata = (NYM_KIND_BINARY+NYM_HEADER_BINARY).decode('utf-8')

        return json.dumps({
            "type": "send",
            # append \x00 because of "kind" message is non binary and equal 0 + 1 bytes because no header are set
            "message": metadata+reply_message,
            "recipient": recipient,
            "withReplySurb": False
            # "replySurb": reply_surb
        })

    def __init__(self):
        url = f"ws://{utils.NYM_CLIENT_ADDR}:1977"
        self.firstRun = True
        self.pasteNym = PasteNym()

        websocket.enableTrace(False)
        self.ws = websocket.WebSocketApp(url,
                                         on_message=lambda ws, msg: self.on_message(
                                             ws, msg),
                                         on_error=lambda ws, msg: self.on_error(
                                             ws, msg),
                                         on_close=lambda ws:     self.on_close(
                                             ws),
                                         on_open=lambda ws:     self.on_open(ws))

        # Set dispatcher to automatic reconnection

        self.ws.run_forever(dispatcher=rel, ping_interval=30,
                            ping_timeout=10, ping_payload=self_address_request)

        rel.signal(2, rel.abort)  # Keyboard Interrupt
        rel.dispatch()
        self.ws.close()

    def on_ping(self, ws):
        pass

    def on_pong(self, ws):
        pass

    def on_open(self, ws):
        self.ws.send(self_address_request)

    def on_error(self, ws, message):
        try:
            print(f"Error ws: {message}")
            traceback.print_exc()
        except UnicodeDecodeError as e:
            print("Unicode error, nothing to do about: {e}")
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
            recipient = None

        except UnicodeDecodeError as e:
            print("Unicode error, nothing to do about: {e}")
            return

        kindReceived = bytes(received_message['message'][0:8], 'utf-8')[0:1]
        
        # we received the data in a json
        try:
            # received data with padding, start at the 9th byte
            payload = bytes(received_message['message'][9:], 'utf-8').decode()
            
            if kindReceived == NYM_KIND_TEXT:
                pass
            elif kindReceived == NYM_KIND_BINARY:
                extractData = payload.split("#####")

                if len(extractData) > 0 :
                    #no header
                    if len(extractData[0]) < 0:
                        data = extractData[1]
                        fileData = extractData[2]
                        headers = None
                    else:
                        headers = extractData[0]
                        data = extractData[1]
                        fileData = extractData[2]
                        
                print(data,extractData,fileData)
                ff = open('test.jpg',"wb")
                ff.write(bytes(fileData,'utf-8'))
                ff.close()
                received_data = json.loads(data)
            
            recipient = received_data['sender']
            event = received_data['event']
            data = received_data['data']
            print(f"-> Got {received_message}")

        except (IndexError, KeyError, json.JSONDecodeError) as e:
            if recipient is not None:
                err_msg = f"Error parsing message: {e}"
                print(err_msg)
                reply_message = err_msg
                Serve.createPayload(recipient, reply_message)
            else:
                print(f"No recipient found in message {received_message}")

        reply = ""

        if recipient is not None:
            if event == CMD_NEW_TEXT:
                reply = self.newText(recipient, data)
            elif event == CMD_GET_TEXT:
                reply = self.getText(recipient, data)
            else:
                reply = f"Error event {event} not found"

            print(f"-> Rcv {event} - answers {reply} over the mix network.")
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
                            reply_message = urlId[0].get('url_id')
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

        return Serve.createPayload(recipient, reply_message)

    def getText(self, recipient, message):
        text = self.pasteNym.getTextById(message)

        try:
            if text is not None:

                # append a Z to be in iso format that JS Date can understand
                text['created_on'] = datetime.isoformat(
                    text.get('created_on'))+'Z'
                reply_message = json.dumps(text, default=str)

            else:
                reply_message = json.dumps({"error": "text not found"})
        except IndexError as e:
            print(e)
            reply_message = "error"

        return Serve.createPayload(recipient, reply_message)
