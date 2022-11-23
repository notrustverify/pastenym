import * as React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Breadcrumbs from '@mui/joy/Breadcrumbs'
import Link from '@mui/joy/Link'
import Box from '@mui/joy/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Button from '@mui/material/Button'
import { deepmerge } from '@mui/utils'
import { experimental_extendTheme as extendMuiTheme } from '@mui/material/styles'
import colors from '@mui/joy/colors'
import {
    extendTheme as extendJoyTheme,
    CssVarsProvider,
    useColorScheme,
} from '@mui/joy/styles'

import HttpDetection from './components/HttpDetection'
import Disclaimer from './components/Disclaimer'
import UserInput from './UserInput'

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
const theme = deepmerge(muiTheme, joyTheme)

class Header extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <CssVarsProvider theme={theme}>
                <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Link component={RouterLink} to="/">
                        <Button size="small">New paste</Button>
                    </Link>
                    <Typography color="inherit" size="small" level="body1">
                        /
                    </Typography>
                    <Link component={RouterLink} to="/about">
                        <Button size="small">About</Button>
                    </Link>
                    <Typography color="inherit" size="small" level="body1">
                        /
                    </Typography>
                    <Typography
                        component="h2"
                        variant="h5"
                        color="inherit"
                        align="center"
                        noWrap
                        sx={{ flex: 1 }}
                    >
                        <Link
                            component={RouterLink}
                            to="/"
                            underline="none"
                            color="inherit"
                            variant="outlined"
                        >
                            Pastenym
                        </Link>
                    </Typography>
                    <Button variant="outlined" size="small" disabled>
                        Connect with Nym
                    </Button>
                </Toolbar>
                <Toolbar
                    component="nav"
                    variant="dense"
                    sx={{ justifyContent: 'space-between', overflowX: 'auto' }}
                ></Toolbar>

                <Disclaimer />
            </CssVarsProvider>
        )
    }
}

export default Header
