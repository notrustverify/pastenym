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
import WorkerBuilder from './worker/worker-builder'
import {Nym} from './worker/worker-nym'

let pasteNymClientId = process.env.REACT_APP_NYM_CLIENT_SERVER

class UserInput extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            client: null,
            self_address: '',
            text: '',
            textError: null,
            loading: false,
            open: false,
            urlId: null,
            buttonSendClick: false,
            publicKey: null,
            privateKey: null,
            burnChecked: false,
        }

        this.sendText = this.sendText.bind(this)
    }

    componentDidMount() {

        this.instance = new WorkerBuilder(Nym)
    
        
        const loadWasm = async () => {
            let client = null
            const wasm = await import('@nymproject/nym-client-wasm')
            wasm.set_panic_hook()
            const validator = 'https://validator.nymtech.net/api'
            client = new wasm.NymClient(validator)
            const gatewayEndpoint = await get_gateway(validator, preferredGateway);
            gatewayEndpoint.gateway_listener = "wss://gateway1.nymtech.net:443";

            const on_message = (msg) => this.displayReceived(msg)
            const on_connect = () =>
                console.log(
                    'Established (and authenticated) gateway connection!'
                )

            client.set_on_gateway_connect(on_connect)
            client.set_on_message(on_message)

            // this is current limitation of wasm in rust - for async methods you can't take self my reference...
            // I'm trying to figure out if I can somehow hack my way around it, but for time being you have to re-assign
            // the object (it's the same one)
            client = await client.initial_setup()

            this.setState({
                client: client,
                self_address: client.self_address(),
            })
        }

        loadWasm().catch(console.error)
        this.setState({
            loading: true,
        })
    }

    componentWillUnmount() {}

    displayReceived(message) {
        const content = message.message
        const replySurb = message.replySurb

        console.log(message)

        if (content.length > 0) {
            if (content.toLowerCase().includes('error')) {
                this.setState({
                    open: true,
                    textError: content,
                })
            } else {
                //use a wrapper, withRouter to use navigate hooks
                //this.props.navigate('/' + content)
                this.setState({
                    urlId: content,
                    buttonSendClick: false,
                })
            }
        } else {
            console.log(content)
        }
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    async sendMessageTo(content) {
        const client = await this.state.client.send_message(
            content,
            pasteNymClientId
        )

        this.setState({
            client: client,
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
                    <Header />
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
                                {this.state.client ? (
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
                                {this.state.client ? (
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
                            disabled={this.state.client ? false : true}
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
