import * as React from 'react'
import { useParams } from 'react-router-dom'
import {
    extendTheme as extendJoyTheme,
    CssVarsProvider,
    useColorScheme,
} from '@mui/joy/styles'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'
import { deepmerge } from '@mui/utils'
import { experimental_extendTheme as extendMuiTheme } from '@mui/material/styles'
import colors from '@mui/joy/colors'

import Header from './Header'
import Footer from './Footer'
import Link from '@mui/joy/Link'
import { Link as RouterLink } from 'react-router-dom'

import Launch from '@mui/icons-material/Launch'
import LinkIcon from '@mui/icons-material/Link'

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

class About extends React.Component {
    constructor(props) {
        super(props)
        this.width = 'auto'
        this.maxWidth = 1000
    }

    componentDidMount() {}

    componentDidUpdate() {}

    componentWillUnmount() {}

    render() {
        return (
            <CssVarsProvider theme={theme}>
                <header>
                    <Header />
                </header>
                <main>
                    <Sheet
                        color="neutral"
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
                        <Typography
                            level="h3"
                            id="pastenym"
                            startDecorator={
                                <Link
                                    component={RouterLink}
                                    variant="outlined"
                                    aria-labelledby="pastenym"
                                    to="#pastenym"
                                    fontSize="md"
                                    borderRadius="sm"
                                >
                                    <LinkIcon />
                                </Link>
                            }
                            sx={{ scrollMarginTop: 100, mt: 1 }}
                        >
                            What is this website?
                        </Typography>

                        <Typography level="body1" width={this.width} maxWidth={this.maxWidth}>
                            Pastenym is a site inspired by{' '}
                            <Link
                                href="https://github.com/sebsauvage/ZeroBin"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Zerobin
                            </Link>{' '}
                            and{' '}
                            <Link
                                href="https://pastebin.com"
                                target="_blank"
                                rel="noreferrer"
                            >
                                pastebin
                            </Link>
                            <br />
                            Thanks to{' '}
                            <Link
                                href="https://nymtech.net/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Nym's mixnet
                            </Link>
                            , your metadata are completely protected which means
                            that your ISP cannot know what you do on the
                            website.
                        </Typography>

                        <Typography
                            level="h3"
                            id="how"
                            startDecorator={
                                <Link
                                    component={RouterLink}
                                    variant="outlined"
                                    aria-labelledby="how"
                                    to="#how"
                                    fontSize="md"
                                    borderRadius="sm"
                                >
                                    <LinkIcon />
                                </Link>
                            }
                            sx={{ scrollMarginTop: 100, mt: 1 }}
                        >
                            How it works?
                        </Typography>

                        <Typography
                            level="body1"
                            width={this.width}
                            sx={{ fontStyle: 'italic' }}
                            maxWidth={this.maxWidth}
                        >
                            Nym protects privacy at the network layer by
                            encrypting and relaying your internet traffic
                            through a multi-layered network called a mixnet. In
                            each layer of the mixnet, mix nodes mix your
                            internet traffic with that of other users, making
                            communications private and hiding your metadata (IP
                            address, who you talk to, when and where, and more).
                            <br />
                            <br />
                            The Nym mixnet is incentivized and decentralized.
                            Users pay a fee in NYM to send their data through
                            the mixnet. By pledging an initial bond of NYM,
                            anyone can run a mix node. Node runners are then
                            rewarded in NYM tokens based on good quality of
                            service, doing the work of mixing packets and
                            providing privacy for the end users. This is called
                            'proof of mixing,' similar to how Bitcoin rewards
                            miners for mining new blocks. The reward mechanism
                            enables the mixnet to scale and decentralize.
                            <br />
                            <br />
                            Nym can work with any application. From Bitcoin to
                            ZCash, no current “layer 1” blockchain provides
                            “layer 0 privacy” for the peer-to-peer broadcasts
                            used in every transaction. Nym can provide
                            network-level privacy for any blockchain and other
                            generic applications. From Bitcoin to instant
                            messaging, developers can build their applications
                            on top of Nym for network layer and metadata
                            protection of their users.
                            <br />
                            <br />
                            For more information, check their{' '}
                            <Link
                                href="https://nymtech.net/about/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                website
                            </Link>
                        </Typography>

                        <Typography
                            level="h3"
                            id="team"
                            startDecorator={
                                <Link
                                    component={RouterLink}
                                    variant="outlined"
                                    aria-labelledby="team"
                                    to="#team"
                                    fontSize="md"
                                    borderRadius="sm"
                                >
                                    <LinkIcon />
                                </Link>
                            }
                            sx={{ scrollMarginTop: 100, mt: 1 }}
                        >
                            Who is behind pastenym?
                        </Typography>
                        <Typography
                            level="body1"
                            width={this.width}
                            maxWidth={this.maxWidth}
                        >
                            The{' '}
                            <Link
                                href="https://nym.notrustverify.ch/about"
                                target="_blank"
                                rel="noreferrer"
                            >
                                team
                            </Link>{' '}
                            who developed this website is{' '}
                            <Link
                                href="https://nym.notrustverify.ch/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                No Trust Verify
                            </Link>
                            . We run multiple mixnodes and gateway on the
                            mixnet.
                            <br />
                            If you are interested by staking with us, check the{' '}
                            <Link href="https://nym.notrustverify.ch/stake">
                                following
                            </Link>{' '}
                            tutorial and join us on{' '}
                            <Link
                                href="https://t.me/notrustverify"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Telegram
                            </Link>
                            or{' '}
                            <Link
                                href="https://matrix.to/#/#no-trust-verify:mandragot.org"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Matrix{' '}
                            </Link>
                        </Typography>

                        <Typography
                            level="h3"
                            id="code"
                            startDecorator={
                                <Link
                                    component={RouterLink}
                                    variant="outlined"
                                    aria-labelledby="code"
                                    to="#code"
                                    fontSize="md"
                                    borderRadius="sm"
                                >
                                    <LinkIcon />
                                </Link>
                            }
                            sx={{ scrollMarginTop: 100, mt: 1 }}
                        >
                            Where is the code?
                        </Typography>
                        <Typography
                            level="body1"
                            width={this.width}
                            maxWidth={this.maxWidth}
                        >
                            Very good question!
                            <br />
                            All the code is free and use the{' '}
                            <Link
                                href="https://github.com/notrustverify/pastenym/blob/main/LICENSE"
                                target="_blank"
                                rel="noreferrer"
                            >
                                GPLv3 licence
                            </Link>
                            , It is available on the follwing{' '}
                            <Link
                                href="https://github.com/notrustverify/pastenym/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                repository
                            </Link>
                        </Typography>
                    </Sheet>
                </main>
                <footer>
                    <Footer />
                </footer>
            </CssVarsProvider>
        )
    }
}

export default withParams(About)
