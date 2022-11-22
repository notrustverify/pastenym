[![Node.js CI](https://github.com/notrustverify/pastenym/actions/workflows/frontend.yml/badge.svg)](https://github.com/notrustverify/pastenym/actions/workflows/frontend.yml)

# pastenym

This project is inspired from [pastebin](https://pastebin.com/) service.
The main goal is to offer a solution for sharing text with [Nym](https://nymtech.net/) products
to offer full anonymity, even on metadata level

#### Demo
Get shared text: [https://pastenym.ch/#/cuc0yBM7&key=331362fb93d7d7730ae182660edba661](https://pastenym.ch/#/cuc0yBM7&key=331362fb93d7d7730ae182660edba661)

Share a text: [http://pastenym.ch/](http://pastenym.ch/)

## What Nym is developping ?
> Nym is developing the infrastructure to prevent this data leakage by protecting every packet’s metadata at the network and application layers.

### Architecture

<img src="./resources/img/nym-platform.png" alt="drawing" width="50%"/>

## How pastenym service will use Nym product
Your text is sent to a client which is connected to the Nym network and which stores it in a database (eventually a more distributed solution will be considered),



This system allows you to share information while respecting your privacy by protecting your data and metadata.

On the side of No Trust Verify we only see an anonymous id when sending the text, and therefore impossible to know who is behind and from where the data was sent. Moreover, data is end-to-end encrypted: your browser generates a key used to encrypt the text, the key is placed in the URL you share with your friends and is used in their browser to decrypt the text received by the server.

### Schema

<img src="./resources/img/paste.jpg" alt="drawing" width="60%"/>

## Init the project

### Nym client
1. Download [nym-client](https://github.com/nymtech/nym/releases/tag/nym-binaries-1.1.0)
2. Give exec permissions and init the client
```bash
chmod u+x nym-client
./nym-client init --id pastenym --gateway EBT8jTD8o4tKng2NXrrcrzVhJiBnKpT1bJy5CMeArt2w
```
3. Run the client `./nym-client run --id pastenym`

### Backend
It uses [pipenv](https://pipenv.pypa.io/en/latest/install/)

1. Go to `backend/`
2. `pipenv shell` to start the python env
3. `pipenv install` to install the dependancies from the PipFile
4. `python main.py` to start the service. On the first run, it will create and initialize a local database at `backend/data/data.db`.

## Contribute

If you wish to contribute to the project, you will need to run the Nym client and Backend as explained in the Init part above AND run a local frontend.

### Frontend
NodeJS (`v16.13.1`) and NPM (`v8.19.2`) are used for the frontend.

1. Go to the `frontend/` directory
2. Create a `.env` file with the same keys are in `.env.example` with your values. The `REACT_APP_NYM_CLIENT_SERVER` value should match the address displayed by the backend.
3. Run `npm install` and grab a cup of coffee
4. Run `npm run start` and go to [http://localhost:8080](http://localhost:8080) in your favorite browser.

## Docker

1. Download the [custom nym-client](https://nym.notrustverify.ch/resources/nym-client). It just a recompiled version that can listen to `0.0.0.0`
2. Init the nym-client and copy files 
```bash
cd nym-client
chmod u+x nym-client
./nym-client init --id docker-client --gateway EBT8jTD8o4tKng2NXrrcrzVhJiBnKpT1bJy5CMeArt2w
cp -r ~/.nym/clients/docker-client nym-data/clients
```

3. Change path in config.toml. For example with user root, search `/home/root` and replace by `/home/user`
4. `docker compose up --build -d`

## Structure

* `backend/` manage the websockets connections and DB
* `frontend/` web application
* `nym-client/` store the configuration,keys for the nym-client
* `resources/` store img or files for documentation
