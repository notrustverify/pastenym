/* eslint-disable no-unused-vars */
import * as React from 'react'
import { CssVarsProvider, useColorScheme, extendTheme } from '@mui/joy/styles'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Textarea from '@mui/joy/Textarea'
import Box from '@mui/joy/Box'
import SendIcon from '@mui/icons-material/Send'
import CircularProgress from '@mui/joy/CircularProgress'
import Checkbox from '@mui/joy/Checkbox'
import Tooltip from '@mui/joy/Tooltip'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import Header from './Header'
import Footer from './Footer'
import E2EEncryptor from './e2e'
import ShowText from './components/ShowText'
import { withRouter } from './components/withRouter'
import ErrorModal from './components/ErrorModal'
import SuccessUrlId from './components/SuccessUrlId'
import { connectMixnet } from './context/createConnection'

const recipient = process.env.REACT_APP_NYM_CLIENT_SERVER

class UserInput extends React.Component {
    constructor(props) {
        super(props)

        this.nym = null

        this.state = {
            self_address: null,
            text: '',
            textError: null,
            open: false,
            urlId: null,
            buttonSendClick: false,
            burnChecked: false,
            textReceived: null,
            //urlIdGet: null,
            buttonGetClick: false,
            files: null,
            isFileAttached: false,
        }

        this.files = null

        // Instanciating a new encryptor will generate new key by default
        this.encryptor = new E2EEncryptor()

        this.sendText = this.sendText.bind(this)
        //this.getPaste = this.getPaste.bind(this)
        this.handleFileUploadError = this.handleFileUploadError.bind(this)
        this.handleFilesChange = this.handleFilesChange.bind(this)
        this.modalHandler = this.modalHandler.bind(this)
    }

    async componentDidMount() {
        this.nym = await connectMixnet()

        this.nym.events.subscribeToTextMessageReceivedEvent((e) => {
            this.displayReceived(e.args.payload)
        })

        this.nym.events.subscribeToConnected((e) => {
            if (e.args.address) {
                this.setState({
                    self_address: e.args.address,
                })
            }
        })
    }

    componentWillUnmount() {}

    handleFileUploadError = (error) => {
        // Do something...
    }

    modalHandler(status) {
        this.setState({ open: status })
    }

    handleFilesChange(files) {
        //reset the state for the modal, workaround, would have to change
        // handle validations
        const fileSize = files.target.files[0].size
        const limitSize = 320_000
        if (fileSize > limitSize) {
            this.setState({
                open: true,
                textError: 'Files are limited to 300 KB',
                isFileAttached: false,
            })

            return
        }

        this.setState({
            files: [...files.target.files],
            isFileAttached: true,
            estimatedTime: Math.floor(fileSize / 3000), //totally random, but it can help user to not break the app
        })
    }

    displayReceived(message) {
        const content = message

        if (content.length > 0) {
            if (content.toLowerCase().includes('error')) {
                this.setState({
                    open: false,
                })

                let textError = content

                if (this.isJson(content))
                    textError = JSON.parse(content)['error']

                this.setState({
                    open: true,
                    textError: textError,
                    buttonGetClick: false,
                })
            } else {
                if (!this.isJson(content)) {
                    this.setState({
                        urlId: content,
                        buttonSendClick: false,
                    })

                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    })
                } else {
                    this.setState({
                        textReceived: JSON.parse(content),
                        buttonGetClick: false,
                    })
                }
            }
        }
    }

    isJson(item) {
        item = typeof item !== 'string' ? JSON.stringify(item) : item

        try {
            item = JSON.parse(item)
        } catch (e) {
            return false
        }

        return typeof item === 'object' && item !== null
    }

    mergeUInt8Arrays(a1, a2) {
        // sum of individual array lengths
        var mergedArray = new Uint8Array(a1.length + a2.length)
        mergedArray.set(a1)
        mergedArray.set(a2, a1.length)
        return mergedArray
    }

    // do not use this
    async sendBinaryMessageTo(data, payload) {
        if (!this.nym) {
            console.error(
                'Could not send message because worker does not exist'
            )
            return
        }
        let fileArray = undefined
        let headers = undefined

        const dataArray = Uint8Array.from(
            '####'.split('').map((x) => x.charCodeAt())
        )
        console.log(payload)
        await Promise.all(
            payload.map(async (f) => {
                const buffer = await f.arrayBuffer()
                fileArray = new Uint8Array(buffer)
                headers = { filename: f.name, mimeType: f.type, data: data }
            })
        )

        try {
            await this.nym.client.sendBinaryMessage({
                payload: this.mergeUInt8Arrays(dataArray, fileArray),
                recipient: recipient,
                headers: JSON.stringify(headers),
            })
        } catch (e) {
            console.log('Failed to send file', e)
        }
        return undefined
    }

    async sendMessageTo(payload) {
        if (!this.nym) {
            console.error(
                'Could not send message because worker does not exist'
            )
            return
        }

        await this.nym.client.sendMessage({ payload, recipient })

        this.setState({
            files: null,
            isFileAttached: false,
        })
    }

    // Should remove this method and switch to Texts instead...
    /*
    getPaste() {
        if (!this.nym) {
            console.error('Could not send message because worker does not exist')
            return
        }

        this.setState({
            textReceived: null,
            buttonGetClick: true,
        })

        let urlId = null == this.state.urlIdGet ? "" : this.state.urlIdGet

        // Keep only urlid part, remove http...
        if (this.state.urlIdGet.split('/#/').length > 1) {
            urlId = this.state.urlIdGet.split('/').reverse()[0]
        }

        const items = urlId.split('&')

        // Remove key
        if (items.length > 1) {
            urlId = items[0]
            key = items[1]
        }

        const data = {
            event: 'getText',
            sender: this.state.self_address,
            data: { urlId: urlId },
        }
        const message = JSON.stringify(data)

        this.nym.client.sendMessage({
            payload: message,
            recipient,
        })
    }
    */

    async sendText() {
        if (
            (this.state.text.length <= 100000 && this.state.text.length > 0) ||
            this.state.files.length > 0
        ) {
            this.setState({
                buttonSendClick: true,
            })

            if (this.state.files) {
                await Promise.all(
                    this.state.files.map(async (f) => {
                        const buffer = await f.arrayBuffer()
                        const fileArray = new Uint8Array(buffer)
                        this.files = {
                            data: fileArray,
                            filename: f.name,
                            mimeType: f.type,
                        }
                    })
                )
            }

            const clearObjectUser = {
                text: this.state.text,
                file: this.files,
            }

            // Encrypt text
            const encrypted = this.encryptor.encrypt(
                JSON.stringify(clearObjectUser)
            )
            if (!encrypted) {
                console.error('Failed to encrypt message.')
                return
            }

            // As soon SURB will be implemented in wasm client, we will use it
            const data = {
                event: 'newText',
                sender: this.state.self_address,
                data: {
                    text: encrypted[0],
                    private: true,
                    burn: this.state.burnChecked,
                    encParams: encrypted[1],
                },
            }

            /*if (this.state.text.length > 0)
                this.sendMessageTo(JSON.stringify(data))*/
            if (encrypted) await this.sendMessageTo(JSON.stringify(data))
        } else {
            this.setState({
                open: true,
                textError: "Too many char, limit is 100'000",
            })
        }
    }

    render() {
        return (
            //<CssVarsProvider theme={theme}>
            <CssVarsProvider>
                <header>
                    <Header state={this.state.self_address} />
                </header>
                <main>
                    <Sheet
                        sx={{
                            width: 'auto',
                            height: '100%',
                            borderRadius: 'sm',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            boxShadow: 'md',
                            mx: 4,
                            px: 3,
                            my: 4, // margin top & botom
                            py: 3, // padding top & bottom
                        }}
                        variant="outlined"
                    >
                        <div>
                            <Typography
                                level="h4"
                                component="h1"
                                sx={{
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                <b>Anon text sharing service</b>
                            </Typography>

                            <Typography
                                fontSize="sm"
                                sx={{
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                <b>Client id</b>{' '}
                                {this.state.self_address ? (
                                    this.state.self_address
                                        .split('@')[0]
                                        .slice(0, 60) + '...'
                                ) : (
                                    <CircularProgress
                                        sx={{
                                            '--CircularProgress-size': '20px',
                                            '--CircularProgress-track-thickness':
                                                '3px',
                                            '--CircularProgress-progress-thickness':
                                                '3px',
                                        }}
                                    />
                                )}
                            </Typography>
                            <Typography
                                fontSize="sm"
                                sx={{
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                <b>Connected Gateway</b>{' '}
                                {this.state.self_address ? (
                                    this.state.self_address.split('@')[1]
                                ) : (
                                    <CircularProgress
                                        sx={{
                                            '--CircularProgress-size': '20px',
                                            '--CircularProgress-track-thickness':
                                                '3px',
                                            '--CircularProgress-progress-thickness':
                                                '3px',
                                        }}
                                    />
                                )}
                            </Typography>
                        </div>

                        {
                            // use buttonClick to reload the message
                            this.state.urlId && !this.state.buttonSendClick ? (
                                <SuccessUrlId
                                    urlId={this.state.urlId}
                                    encKey={this.encryptor.getKey()}
                                />
                            ) : (
                                ''
                            )
                        }
                        {this.state.open ? (
                            <ErrorModal
                                open={this.state.open}
                                handler={this.modalHandler}
                                textError={this.state.textError}
                            />
                        ) : (
                            ''
                        )}

                        {/* Removed from now, will be migrated to the header, next to the "New paste link" and will redirect to Texts.js
                        <Box
                            sx={{
                                gap: 4,
                                width: 'auto',
                                justifyContent: 'left',
                            }}
                        >
                            <TextField
                                placeholder="Enter the URL ID"
                                variant="outlined"
                                startDecorator={<ScreenSearchDesktopIcon />}
                                onChange={(event) =>
                                    this.setState({
                                        urlIdGet: event.target.value,
                                    })
                                }
                                endDecorator={
                                    <Button
                                        size="sm"
                                        loading={this.state.buttonGetClick}
                                        disabled={
                                            this.state.self_address
                                                ? false
                                                : true
                                        }
                                        onClick={this.getPaste}
                                    >
                                        <SendIcon size="sm" />
                                    </Button>
                                }
                            />
                        </Box>
                        */}

                        {this.state.textReceived ? (
                            <ShowText data={this.state.textReceived} />
                        ) : (
                            ''
                        )}

                        <Typography
                            fontSize="sm"
                            sx={{
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            <b>New paste</b>
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                gap: 4,
                                width: '100%',
                                justifyContent: 'left',
                            }}
                        >
                            <Tooltip
                                title="message will be deleted when read"
                                size="sm"
                                placement="bottom"
                            >
                                <Checkbox
                                    onChange={(event) =>
                                        this.setState({
                                            burnChecked: event.target.checked,
                                        })
                                    }
                                    size="sm"
                                    label="Burn after reading"
                                />
                            </Tooltip>
                        </Box>

                        <Textarea
                            sx={{}}
                            label="New paste"
                            placeholder="Type in here…"
                            minRows={10}
                            fullwidth="true"
                            required
                            autoFocus
                            value={this.state.text}
                            onChange={(event) =>
                                this.setState({ text: event.target.value })
                            }
                            startDecorator={
                                <Box sx={{ display: 'flex', gap: 0.5 }}></Box>
                            }
                            endDecorator={
                                <Typography level="body3" sx={{ ml: 'auto' }}>
                                    {this.state.text.length} character(s)
                                </Typography>
                            }
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            color="secondary"
                        >
                            {' '}
                            <UploadFileIcon sx={{ mr: 1 }} />
                            {this.state.isFileAttached ? (
                                <>
                                    <Typography
                                        fontSize="sm"
                                        sx={{
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        File {this.state.files[0].name} is
                                        attached.
                                        <br />
                                        Time to send: ~
                                        {
                                            //https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
                                            new Date(
                                                (this.state.estimatedTime %
                                                    86400) *
                                                    1000
                                            )
                                                .toUTCString()
                                                .replace(
                                                    /.*(\d{2}):(\d{2}):(\d{2}).*/,
                                                    '$2m $3s'
                                                )
                                        }
                                    </Typography>
                                </>
                            ) : (
                                <Typography
                                    fontSize="sm"
                                    sx={{
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    Attach file (Limit: 300KB)
                                </Typography>
                            )}
                            <input
                                type="file"
                                hidden
                                onChange={(file) =>
                                    this.handleFilesChange(file)
                                }
                            />
                        </Button>
                        <Button
                            disabled={this.state.self_address ? false : true}
                            loading={this.state.buttonSendClick}
                            onClick={this.sendText}
                            endDecorator={<SendIcon />}
                            sx={{ mt: 1 /* margin top */ }}
                        >
                            Send
                        </Button>
                    </Sheet>
                </main>
                <footer>
                    <Footer />
                </footer>
            </CssVarsProvider>
        )
    }
}

export default withRouter(UserInput)
