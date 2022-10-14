# pastenym

This project is inspired from [pastebin](https://pastebin.com/) service.
The main goal is to offer a solution for sharing text with [Nym](https://nymtech.net/) products
to offer full anonymity, even on metadata level

## What Nym is developping ?
> Nym is developing the infrastructure to prevent this data leakage by protecting every packet’s metadata at the network and application layers.

### Architecture

<img src="./resources/img/nym-platform.png" alt="drawing" width="30%"/>

## How pastenym service will use Nym product
Your text is sent to a client which is connected to the Nym network and which stores it in a database (eventually a more distributed solution will be considered),



This system allows you to share information while respecting your privacy by protecting your data and metadata.

On the side of No Trust Verify we only see an anonymous id when sending the text, and therefore impossible to know who is behind and from where the data was sent.

**One point we need to work on is how to avoid the correlation between the connection to the website and the reception of the text because there is a possibility to find out
which IP address shared this information and therefore to find the person**

### Schema

<img src="./resources/img/paste.jpg" alt="drawing" width="60%"/>

## Structure

* `backend/` manage the websockets connections and DB
* `js-example/` temporary frontend, just for the demo, will be replaced
* `nym-client/` store the 