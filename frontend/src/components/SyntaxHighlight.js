import * as React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import Select, { selectClasses } from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { deepmerge } from '@mui/utils'
import { experimental_extendTheme as extendMuiTheme } from '@mui/material/styles'
import colors from '@mui/joy/colors'
import {
    extendTheme as extendJoyTheme,
    CssVarsProvider,
    useColorScheme,
} from '@mui/joy/styles'

import { bottom } from '@mui/system'


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

class SyntaxHighlight extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <CssVarsProvider theme={theme}>
                {this.props.isInput ? (
                    <Autocomplete
                        disablePortal
                        id="language-box"
                        options={SyntaxHighlighter.supportedLanguages}
                        sx={{
                            width: "auto",
                            mt: -3
                        }}
                        onChange={(event) => {
                            this.props.setLanguageState({
                                language: event.target.textContent,
                            })
                        }}
                        size="small"
                        renderInput={(params) => (
                            <TextField {...params} label="Syntax Highlighting" placeholder="Name" />
                        )}
                    />
                ) : (
                    <SyntaxHighlighter
                        language={this.props.language}
                        style={docco}
                    >
                        {this.props.text}
                    </SyntaxHighlighter>
                )}
            </CssVarsProvider>
        )
    }
}

export default SyntaxHighlight
