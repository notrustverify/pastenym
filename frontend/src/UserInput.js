/* eslint-disable no-unused-vars */
import * as React from 'react'
import { CssVarsProvider, useColorScheme, extendTheme } from '@mui/joy/styles'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Textarea from '@mui/joy/Textarea'
import Header from './Header'
import Footer from './Footer'
import Box from '@mui/joy/Box'
import SendIcon from '@mui/icons-material/Send'
import CircularProgress from '@mui/joy/CircularProgress'
import { withRouter } from './components/withRouter'
import ErrorModal from './components/ErrorModal'
import SuccessUrlId from './components/SuccessUrlId'
import Checkbox from '@mui/joy/Checkbox'
import Tooltip from '@mui/joy/Tooltip'
import ShowText from './components/ShowText'
import Stack from '@mui/joy/Stack'
import TextField from '@mui/joy/TextField'
import ScreenSearchDesktopIcon from '@mui/icons-material/ScreenSearchDesktop'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { createNymMixnetClient } from '@nymproject/sdk'

let recipient = process.env.REACT_APP_NYM_CLIENT_SERVER

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
            publicKey: null,
            privateKey: null,
            burnChecked: false,
            textReceived: null,
            urlIdGet: null,
            buttonGetClick: false,
        }

        this.sendText = this.sendText.bind(this)
        this.getPaste = this.getPaste.bind(this)
    }

    async componentDidMount() {
        this.nym = await createNymMixnetClient()

        const validatorApiUrl = 'https://validator.nymtech.net/api'
        const preferredGatewayIdentityKey =
            'E3mvZTHQCdBvhfr178Swx9g4QG3kkRUun7YnToLMcMbM'

        this.nym.events.subscribeToTextMessageReceivedEvent((e) => {
            this.displayReceived(e.args.payload)
        })

        this.nym.events.subscribeToConnected((e) => {
            if (e.args.address) {
                this.setState({
                    self_address: e.args.address,
                    ready: true,
                })
            }
        })

        // start the client and connect to a gateway
        await this.nym.client.start({
            clientId: 'pastenymClient',
            validatorApiUrl,
            preferredGatewayIdentityKey,
        })
    }

    componentWillUnmount() {}

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
        } else {
            console.log(content)
        }
    }

    isJson(item) {
        item = typeof item !== 'string' ? JSON.stringify(item) : item

        try {
            item = JSON.parse(item)
        } catch (e) {
            return false
        }

        if (typeof item === 'object' && item !== null) {
            return true
        }

        return false
    }

    async sendMessageTo(payload) {
        if (!this.nym) {
            console.error(
                'Could not send message because worker does not exist'
            )
            return
        }
        console.log({
            payload,
            recipient,
        })
        await this.nym.client.sendMessage({
            payload,
            recipient,
        })
    }

    getPaste() {
        if (!this.nym) {
            console.error(
                'Could not send message because worker does not exist'
            )
            return
        }

        this.setState({
            textReceived: null,
            buttonGetClick: true,
        })

        let urlId = ''

        //keep only urlid part, remove http...
        if (this.state.urlIdGet.split('/#/').length > 1 || this.state.urlIdGet.split('/').length > 1 )

            urlId = this.state.urlIdGet.split('/').reverse()[0]
        else urlId = this.state.urlIdGet

        //remove key
        if (urlId.split('?').length > 1) urlId.split('?')[0]

        const data = {
            event: 'getText',
            sender: this.state.self_address,
            data: {
                urlId: urlId,
            },
        }
        const message = JSON.stringify(data)

        this.nym.client.sendMessage({
            payload: message,
            recipient,
        })
    }

    sendText() {
        if (this.state.text.length <= 100000 && this.state.text.length > 0) {
            this.setState({
                buttonSendClick: true,
            })

            // As soon SURB will be implemented in wasm client, we will use it
            const data = {
                event: 'newText',
                sender: this.state.self_address,
                data: {
                    text: this.state.text,
                    private: true,
                    burn: this.state.burnChecked,
                },
            }
            this.sendMessageTo(JSON.stringify(data))
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
                                <SuccessUrlId urlId={this.state.urlId} />
                            ) : (
                                ''
                            )
                        }
                        {this.state.open ? (
                            <ErrorModal textError={this.state.textError} />
                        ) : (
                            ''
                        )}
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
