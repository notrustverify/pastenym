import asyncio
import json
import websocket
from pasteNym import PasteNym
import utils
import rel
from datetime import datetime

self_address_request = json.dumps({
    "type": "selfAddress"
})

CMD_NEW_TEXT = "newText"
CMD_GET_TEXT = "getText"


class Serve:

    @staticmethod
    def createPayload(recipient, reply_message):
        return json.dumps({
            "type": "send",
            "message": reply_message,
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
        print(f"Error: {message}")
        exit()
        

    def on_close(self, ws):
        print(f"Connection to nym-client closed")

    def on_message(self, ws, message):
        if self.firstRun:
            self_address = json.loads(message)
            print("our address is: {}".format(self_address["address"]))
            self.firstRun = False
            return

        received_message = json.loads(message)
        recipient = None
        print(received_message)

        # we received the data in a json
        try:
            received_data = json.loads(received_message['message'])
            recipient = received_data['sender']
            event = received_data['event']
            data = received_data['data']

        except (IndexError, KeyError, json.decoder.JSONDecodeError) as e:
            err_msg = "error parsing message, {e}"
            print(err_msg)
            reply_message = err_msg
            Serve.createPayload(recipient, reply_message)
            return

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
