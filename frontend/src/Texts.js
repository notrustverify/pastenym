import * as React from 'react'
import {
    extendTheme as extendJoyTheme,
    CssVarsProvider,
    useColorScheme,
} from '@mui/joy/styles'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'
import Header from './Header'
import Footer from './Footer'
import { useParams } from 'react-router-dom'
import he from 'he'
import CircularProgress from '@mui/joy/CircularProgress'
import Divider from '@mui/joy/Divider'
import { deepmerge } from '@mui/utils'
import { experimental_extendTheme as extendMuiTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import colors from '@mui/joy/colors'
import Skeleton from '@mui/material/Skeleton'
import TextStats from './components/TextStats'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import WarningIcon from '@mui/icons-material/Warning'
import Alert from '@mui/joy/Alert'
import IconButton from '@mui/joy/IconButton'
import { createNymMixnetClient } from 'ntv-sdk'


const muiTheme = extendMuiTheme({
    // This is required to point to `var(--joy-*)` because we are using `CssVarsProvider` from Joy UI.
    cssVarPrefix: 'joy',
    colorSchemes: {
        light: {
            palette: {
                primary: {
                    main: colors.blue[500],
                },
                grey: colors.grey,
                error: {
                    main: colors.red[500],
                },
                info: {
                    main: colors.purple[500],
                },
                success: {
                    main: colors.green[500],
                },
                warning: {
                    main: colors.yellow[200],
                },
                common: {
                    white: '#FFF',
                    black: '#09090D',
                },
                divider: colors.grey[200],
                text: {
                    primary: colors.grey[800],
                    secondary: colors.grey[600],
                },
            },
        },
        dark: {
            palette: {
                primary: {
                    main: colors.blue[600],
                },
                grey: colors.grey,
                error: {
                    main: colors.red[600],
                },
                info: {
                    main: colors.purple[600],
                },
                success: {
                    main: colors.green[600],
                },
                warning: {
                    main: colors.yellow[300],
                },
                common: {
                    white: '#FFF',
                    black: '#09090D',
                },
                divider: colors.grey[800],
                text: {
                    primary: colors.grey[100],
                    secondary: colors.grey[300],
                },
            },
        },
    },
})

const joyTheme = extendJoyTheme()

// You can use your own `deepmerge` function.
// joyTheme will deeply merge to muiTheme.
const theme = deepmerge(muiTheme, joyTheme)

function withParams(Component) {
    return (props) => <Component {...props} params={useParams()} />
}

let recipient = process.env.REACT_APP_NYM_CLIENT_SERVER

class Texts extends React.Component {
    constructor(props) {
        super(props)
        this.nym = null

        this.state = {
            self_address: null,
            text: null,
            num_view: null,
            urlId: this.props.params.urlId,
            created_on: null,
            ready: false,
            isPasteRetrieved: false,
        }


        this.getPaste = this.getPaste.bind(this)
        }

    getPaste() {
        if (!this.nym) {
            console.error(
                'Could not send message because worker does not exist'
            )
            return
        }

        const data = {
            event: 'getText',
            sender: this.state.self_address,
            data: {
                urlId: this.state.urlId,
            },
        }
        const message = JSON.stringify(data)

        this.sendMessageTo(message)
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
            gatewayListener: "wss://gateway1.nymtech.net:443"
        })
    }

    componentDidUpdate() {}

    displayReceived(message) {
        const data = JSON.parse(message)
        const replySurb = message.replySurb

        if (!data.hasOwnProperty('error')) {
            this.setState({
                text: he.decode(data['text']),
                num_view: data['num_view'],
                created_on: data['created_on'],
                is_burn: data['is_burn'],
            })
        } else {
            this.setState({
                text: he.decode(data['error']),
            })
        }
        this.setState({
            isPasteRetrieved: true,
        })
    }

    componentWillUnmount() {}

    async sendMessageTo(payload) {
        if (!this.nym) {
            console.error(
                'Could not send message because worker does not exist'
            )
            return
        }
  
        await this.nym.client.sendMessage({
            payload,
            recipient,
        })
    }

    render() {
        if (this.state.ready && this.state.isPasteRetrieved !== true) this.getPaste()

        return (
            <CssVarsProvider theme={theme}>
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

                        <Divider />
                        {this.state.is_burn ? (
                            <Alert
                                sx={{ alignItems: 'flex-start' }}
                                startDecorator={React.cloneElement(
                                    <WarningIcon />,
                                    {
                                        sx: { mt: '2px', mx: '2px' },
                                        fontSize: 'xl2',
                                    }
                                )}
                                variant="soft"
                                color="warning"
                                endDecorator={
                                    <IconButton
                                        variant="soft"
                                        size="sm"
                                        color="warning"
                                    ></IconButton>
                                }
                            >
                                <div>
                                    <Typography fontWeight="lg" mt={0.25}>
                                        Burn after reading paste
                                    </Typography>
                                    <Typography
                                        fontSize="sm"
                                        sx={{ opacity: 0.8 }}
                                    >
                                        The paste is now deleted
                                    </Typography>
                                </div>
                            </Alert>
                        ) : (
                            <div>
                                {this.state.num_view ? (
                                    <TextStats
                                        num_view={this.state.num_view}
                                        created_on={this.state.created_on}
                                    />
                                ) : (
                                    ''
                                )}
                            </div>
                        )}
                        <b>Paste</b>
                        <Box
                            sx={{
                                display: 'flex',
                                whiteSpace: 'pre-wrap',
                                border: '1px solid  rgb(211,211,211)',
                                borderRadius: '5px',
                                p: 1,
                            }}
                        >
                            {this.state.text ? (
                                this.state.text
                            ) : (
                                <Skeleton
                                    variant="rounded"
                                    width="100%"
                                    height={60}
                                />
                            )}
                        </Box>
                    </Sheet>
                </main>
                <footer>
                    <Footer />
                </footer>
            </CssVarsProvider>
        )
    }
}

export default withParams(Texts)
