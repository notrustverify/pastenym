import asyncio
import json
import websocket
from pasteNym import PasteNym
import utils
import rel

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

    def on_close(self, ws):
        print(f"Connection to nym-client closed")

    def on_message(self, ws, message):
        if self.firstRun:
            self_address = json.loads(message)
            print("our address is: {}".format(self_address["address"]))
            self.firstRun = False
            return

        received_message = json.loads(message)
        print(received_message)

        try:
            recipient = received_message['message'].split("/")[0]
            command = received_message['message'].split("/")[1]
            message = received_message['message'].split("/")[2]
        except IndexError as e:
            err_msg = "error parsing message, {e}"
            print(err_msg)
            reply_message=err_msg
            Serve.createPayload(recipient, reply_message)
            return

        reply = ""

        if command == CMD_NEW_TEXT:
            reply = self.newText(recipient, message)
        elif command == CMD_GET_TEXT:
            reply = self.getText(recipient, message)

        print(f"sending {reply} over the mix network. Cmd {command}")
        self.ws.send(reply)

    def newText(self, recipient, message):

        if len(message) <= utils.PASTE_MAX_LENGTH:
            urlId = self.pasteNym.newText(message)

            try:
                if len(urlId) > 0:
                    reply_message = urlId[0].get('url_id')
                else:
                    reply_message = "error"
            except IndexError as e:
                print(e)
                reply_message = "error"
        else:
            reply_message = f"Text too long. Max is {utils.PASTE_MAX_LENGTH}"

        return Serve.createPayload(recipient, reply_message)

    def getText(self, recipient, message):
        text = self.pasteNym.getTextById(message)
        try:
            if text is not None:
                reply_message = text
            else:
                reply_message = "Text not found"
        except IndexError as e:
            print(e)
            reply_message = "error"

        return Serve.createPayload(recipient, reply_message)
