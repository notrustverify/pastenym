import * as React from 'react'
import { useParams } from 'react-router-dom'
import {
    extendTheme as extendJoyTheme,
    CssVarsProvider,
    useColorScheme,
} from '@mui/joy/styles'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'
import he from 'he'
import CircularProgress from '@mui/joy/CircularProgress'
import Divider from '@mui/joy/Divider'
import { deepmerge } from '@mui/utils'
import { experimental_extendTheme as extendMuiTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import colors from '@mui/joy/colors'
import Skeleton from '@mui/material/Skeleton'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import WarningIcon from '@mui/icons-material/Warning'
import Alert from '@mui/joy/Alert'
import IconButton from '@mui/joy/IconButton'
import Link from '@mui/joy/Link'
import Header from './Header'
import Footer from './Footer'
import E2EEncryptor from './e2e'
import TextStats from './components/TextStats'
import { connectMixnet } from './context/createConnection'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import Button from '@mui/joy/Button'
import FileRender from './components/FileRender'


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

        const items = this.props.params.urlId
            .replace('#/', '')
            .replace('#', '')
            .split('&')
            .map((l) => l.split('='))
        const urlId = items[0][0]
        this.params = {}
        for (let elt of items) {
            let [key, val] = elt
            this.params[key] = val
        }

        this.state = {
            self_address: null,
            text: null,
            num_view: null,
            urlId: urlId,
            isKeyProvided:
                this.params.hasOwnProperty('key') && this.params.key.length > 1,
            created_on: null,
            ready: false,
            isPasteRetrieved: false,
            isFileRetrieved: false,
            isText: true,
            isDataRetrieved: false,
        }

        this.userFile = {}

        if (this.state.isKeyProvided) {
            this.encryptor = new E2EEncryptor(this.params.key)
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
        this.nym = await connectMixnet()

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
    }

    componentDidUpdate() {}

    displayReceived(message) {
        const data = JSON.parse(message)
        const replySurb = message.replySurb

        if (!data.hasOwnProperty('error')) {
            let userData = he.decode(data['text'])

            // Decrypt if text is encrypted
            if (
                data.hasOwnProperty('encParams') &&
                undefined != data['encParams']
            ) {
                if (!this.state.isKeyProvided) {
                    console.error(
                        'Text seems to be encrypted but no key is provided. Displaying encrypted text'
                    )
                } else {
                    const encParams = data['encParams']
                    userData = JSON.parse(
                        this.encryptor.decrypt(userData, encParams)
                    )
                }
            }

            //stats
            this.setState({
                num_view: data['num_view'],
                created_on: data['created_on'],
                is_burn: data['is_burn'],
            })

            if (userData['text'] !== '') {
                this.setState({
                    text: he.decode(userData['text']),
                })
                this.setState({
                    isPasteRetrieved: true,
                })
            } else {
                //no text share remove the textarea
                this.setState({
                    isText: false,
                })
            }
 
            if (userData.file) {
                // js object to array, remove the keys
                const fileData = Object.keys(userData.file['data']).map(
                    function (key) {
                        return userData.file['data'][key]
                    }
                )
                this.userFile = {
                    fileData: URL.createObjectURL(
                        new Blob([Uint8Array.from(fileData)], {
                            type: userData.file['mimeType'],
                        })
                    ),
                    filename: userData.file['filename'],
                    mimeType: userData.file['mimeType'],
                }
                this.setState({ isFileRetrieved: true })

            }

            //global state to stop sending message when text or file is fetched
            this.setState({ isDataRetrieved: true })
        } else {
            this.setState({
                text: he.decode(data['error']),
            })
        }
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
        if (this.state.ready && this.state.isDataRetrieved !== true)
            this.getPaste()

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

                        {this.state.isFileRetrieved && !this.userFile.mimeType.includes('image/') ? (
                            <Button
                                component="a"
                                href={this.userFile.fileData}
                                download={this.userFile.filename}
                                variant="soft"
                                endDecorator={<KeyboardArrowRight />}
                                color="success"
                                sx={{
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                Download {this.userFile.filename} file
                            </Button>
                        ) : (
                            ''
                        )}

                            {this.state.isFileRetrieved && this.userFile.mimeType.includes('image/') ? (
                            <FileRender fileData={this.userFile.fileData} />
                        ) : (
                            ''
                        )}
                        {
                            // if not text share don't render text area
                            this.state.isText ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        whiteSpace: 'pre-wrap',
                                        overflowWrap: 'anywhere',
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
                            ) : (
                                ''
                            )
                        }
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
