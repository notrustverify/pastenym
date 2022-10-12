import asyncio
import json
import websockets
from pasteNym import PasteNym
import utils

self_address_request = json.dumps({
    "type": "selfAddress"
})

pasteNym = PasteNym()


def createPayload(recipient, reply_message):
    return json.dumps({
        "type": "send",
        "message": reply_message,
        "recipient": recipient,
        "withReplySurb": False
        # "replySurb": reply_surb
    })


def getText(recipient, message):
    text = pasteNym.getTextById(message)
    print(message)
    try:
        if text is not None:
            reply_message = text
        else:
            reply_message = "Text not found"
    except IndexError as e:
        print(e)
        reply_message = "error"
    print(reply_message)

    return createPayload(recipient, reply_message)


def newText(recipient, message):
    urlId = pasteNym.newText(message)
    print(message)
    try:
        if len(urlId) > 0:
            reply_message = urlId[0].get('url_id')
        else:
            reply_message = "error"
    except IndexError as e:
        print(e)
        reply_message = "error"
    print(reply_message)

    return createPayload(recipient, reply_message)


async def send_text_with_reply(websocket):
    accessibleData = "newText"
    getTextCmd = "getText"

    await websocket.send(self_address_request)
    self_address = json.loads(await websocket.recv())
    # use the received surb to send an anonymous reply!

    print("our address is: {}".format(self_address["address"]))
    while True:
        try:
            received_message = json.loads(await websocket.recv())
            print(received_message)
            # reply_surb = received_message["replySurb"]
        except websockets.WebSocketException as e:
            print(e)
            return

        try:
            recipient = received_message['message'].split("/")[0]
            command = received_message['message'].split("/")[1]
            message = received_message['message'].split("/")[2]
        except IndexError as e:
            print(f"error parsing message, {e}")
            reply_message = f"error parsing message, {e}"
            print(reply_message)
            createPayload(recipient, reply_message)
            return

        reply = ""

        if command == accessibleData:
            reply = newText(recipient, message)
        elif command == getTextCmd:
            reply = getText(recipient, message)

        print("sending '{}' over the mix network...".format(reply))
        await websocket.send(reply)

        '''
            print("waiting to receive a message from the mix network...")
            received_message = await websocket.recv()
            print("received '{}' from the mix network".format(received_message))
        '''


async def main():
    url = f"ws://{utils.NYM_CLIENT_ADDR}:1977"
    async with websockets.connect(url) as ws:
        await send_text_with_reply(ws)
        await asyncio.Future()  # run forever


print("Start serve")
asyncio.run(main())
