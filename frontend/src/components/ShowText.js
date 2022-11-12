import * as React from 'react'
import {
    extendTheme as extendJoyTheme,
    CssVarsProvider,
    useColorScheme,
} from '@mui/joy/styles'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'
import { useParams } from 'react-router-dom'
import he from 'he'
import CircularProgress from '@mui/joy/CircularProgress'
import Divider from '@mui/joy/Divider'
import { deepmerge } from '@mui/utils'
import { experimental_extendTheme as extendMuiTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import colors from '@mui/joy/colors'
import Skeleton from '@mui/material/Skeleton'
import TextStats from './TextStats'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import WarningIcon from '@mui/icons-material/Warning'
import Alert from '@mui/joy/Alert'
import IconButton from '@mui/joy/IconButton'

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

class ShowText extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            text: he.decode(this.props.data['text']),
            num_view: this.props.data['num_view'],
            urlId: this.props.urlId,
            created_on: this.props.data['created_on'],
            ready: false,
            isPasteRetrieved: false,
            is_burn: this.props.data['is_burn'],
        }
    }

    componentDidMount() {}

    componentDidUpdate() {}

    componentWillUnmount() {}

    render() {
        return (
            <CssVarsProvider theme={theme}>
                <Sheet variant="plain">
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
                                <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
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

                    <Box
                        sx={{
                            display: 'flex',
                            whiteSpace: 'pre-wrap',
                            border: '1px solid  rgb(211,211,211)',
                            borderRadius: '5px',
                            p: 1,
                            mt: 2
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
            </CssVarsProvider>
        )
    }
}

export default withParams(ShowText)
