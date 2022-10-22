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
import Box from '@mui/joy/Box'
import { useParams } from 'react-router-dom'
import he from 'he'
import CircularProgress from '@mui/joy/CircularProgress'
import Divider from '@mui/joy/Divider'
import { deepmerge } from '@mui/utils'
import { experimental_extendTheme as extendMuiTheme } from '@mui/material/styles'
import colors from '@mui/joy/colors'
import Skeleton from '@mui/material/Skeleton'

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
    return props => <Component {...props} params={useParams()} />;
  }

let pasteNymClientId = process.env.REACT_APP_NYM_CLIENT_SERVER

class Texts extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            client: null,
            self_address: '',
            text: null,
            urlId: null,
        }

        this.sendText = this.sendText.bind(this)
    }

    displayReceived(message) {
        const content = message.message
        const replySurb = message.replySurb


        this.setState({
            text: he.decode(content),
        })
    }

     componentDidMount() {
        this.setState({
            urlId: this.props.params.urlId
        })


        const loadWasm = async () => {
            let client = null

            const wasm = await import('@nymproject/nym-client-wasm')
            wasm.set_panic_hook()
            const validator = 'https://validator.nymtech.net/api'
            client = new wasm.NymClient(validator)

            const on_message = (message) => this.displayReceived(message)
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
                self_address: client.self_address()
            })
            
        }

        loadWasm().catch(console.error)

        this.setState({
            loading: true,
        })

      
    }

    componentWillUnmount() {}

    sendText() {
        this.sendMessageTo('getText',this.state.urlId)
    }

    //generate Uncaught (in promise) Error: null pointer passed to rust
    async sendMessageTo(cmd,content) {
        const message = this.state.self_address + '/' + cmd + '/' + content
        await this.state.client.send_message(message, pasteNymClientId)
    }


    render() {
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
                        <Typography level="h4">
                            <b>Pastenym</b>
                        </Typography>
                        <Typography fontSize="sm" sx={{
                          overflow: "hidden",
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          
                        }}>
                            <b>Client id</b>{' '}
                            {this.state.client ? (
                                this.state.self_address.split('@')[0].slice(0, 60) + '...'
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
                        <Typography fontSize="sm" sx={{
                          overflow: "hidden",
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          
                        }}>
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
                    <Divider />
                    {this.state.client ? this.sendText() : ''}
                    <Box
                        sx={{
                            display: 'flex',
                            whiteSpace: 'pre-wrap',
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
