import asyncio
import json
import websocket
from pasteNym import PasteNym
import utils
import rel
from datetime import datetime
import traceback

self_address_request = json.dumps({
    "type": "selfAddress"
})

CMD_NEW_TEXT = "newText"
CMD_GET_TEXT = "getText"

NYM_KIND_TEXT=b'\x00'*8 #uint8
NYM_KIND_BINARY=b'\x01'

NYM_HEADER_SIZE_TEXT=b'\x00' #set to 0 if it's a text
NYM_HEADER_BINARY=b'\x00' # not used now, to investigate later


class Serve:

    @staticmethod
    def createPayload(recipient, reply_message,is_text=True):
        if is_text:
            metadata = (NYM_KIND_TEXT+NYM_HEADER_SIZE_TEXT).decode('utf-8')
        else:
             # not used now, to investigate later 
            metadata = (NYM_KIND_BINARY+NYM_HEADER_BINARY).decode('utf-8')

        return json.dumps({
            "type": "send",
            "message": metadata+reply_message, # append \x00 because of "kind" message is non binary and equal 0 + 1 bytes because no header are set
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
        self.ws.run_forever(dispatcher=rel)
        rel.signal(2, rel.abort)  # Keyboard Interrupt
        rel.dispatch()

    def on_open(self, ws):
        self.ws.send(self_address_request)

    def on_error(self, ws, message):
        try:
            print(f"Error ws: {message}")
            traceback.print_exc()
        except UnicodeDecodeError as e:
            print("Unicode error, nothing to do about, {e}")
            return
        
        exit()
       
        

    def on_close(self, ws):
        print(f"Connection to nym-client closed")

    def on_message(self, ws, message):
        try:
            if self.firstRun:
                self_address = json.loads(message)
                print("our address is: {}".format(self_address["address"]))
                self.firstRun = False
                return
            received_message = json.loads(message)
           
            recipient = None
        except UnicodeDecodeError as e:
            print("Unicode error, nothing to do about, {e}")
            return

        # we received the data in a json
        try:
            # received data with padding, remove them
            received_data = json.loads(received_message['message'].replace("\x00",""))
            
            recipient = received_data['sender']
            event = received_data['event']
            data = received_data['data']
            print(received_message)
        except (IndexError,KeyError,json.JSONDecodeError) as e:
            if recipient is not None:
                err_msg = f"error parsing message, {e}"
                print(err_msg)
                reply_message = err_msg
                Serve.createPayload(recipient, reply_message)
            else:
                print(f"no recipient found in message {received_message}")

            

        reply = ""
    
        if recipient is not None:
            if event == CMD_NEW_TEXT:
                reply = self.newText(recipient, data)
            elif event == CMD_GET_TEXT:
                reply = self.getText(recipient, data)
            else:
                reply = f"Error event {event} not found"

            print(f"sending {reply} over the mix network. Cmd {event}")
            self.ws.send(reply)
        else:
            print(f"no recipient found in message {received_message}")

    def newText(self, recipient, message):

        if len(message) <= utils.PASTE_MAX_LENGTH:
            urlId = self.pasteNym.newText(message)

            if urlId is not None:
                try:
                    if len(urlId) > 0:
                        reply_message = urlId[0].get('url_id')
                    else:
                        reply_message = "error"
                except IndexError as e:
                    print(e)
                    reply_message = "error"
            else:
                reply_message = f"Error with text to share"
        else:
            reply_message = f"Error text too long. Max is {utils.PASTE_MAX_LENGTH}"

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
