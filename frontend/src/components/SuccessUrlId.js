import * as React from 'react'

import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'
import ReportIcon from '@mui/icons-material/Report'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Box from '@mui/joy/Box'
import Alert from '@mui/joy/Alert'
import IconButton from '@mui/joy/IconButton'
import Typography from '@mui/joy/Typography'
import { ColorPaletteProp } from '@mui/joy/styles'
import Link from '@mui/joy/Link'
import Button from '@mui/joy/Button'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Tooltip from '@mui/joy/Tooltip'
import ClickAwayListener from '@mui/material/ClickAwayListener'

const SERVER_NAME = process.env.SERVER_NAME || 'https://pastenym.ch'

class SuccessUrlId extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            url:
                SERVER_NAME +
                '/#/' +
                this.props.urlId +
                (this.props.encKey ? '&key=' + this.props.encKey : ''),
            urlId: this.props.urlId,
            open: false,
            textButton: 'Copy to clipboard',
        }

        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit() {
        try {
            this.setState({
                open: true,
                textButton: 'Copied',
            })
            const textToCopy = this.state.url
            //from  https://stackoverflow.com/a/65996386
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy)
            } else {
                // text area method
                let textArea = document.createElement('textarea')
                textArea.value = textToCopy
                // make the textarea out of viewport
                textArea.style.position = 'fixed'
                textArea.style.left = '-999999px'
                textArea.style.top = '-999999px'
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                return new Promise((res, rej) => {
                    // here the magic happens
                    document.execCommand('copy') ? res() : rej()
                    textArea.remove()
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    render() {
        return (
            <Alert
                sx={{ alignItems: 'flex-start' }}
                startDecorator={React.cloneElement(<CheckCircleIcon />, {
                    sx: { mt: '2px', mx: '4px' },
                    fontSize: 'xl2',
                })}
                variant="soft"
                color="success"
                endDecorator={
                    <IconButton
                        variant="soft"
                        size="sm"
                        color="success"
                    ></IconButton>
                }
            >
                <div>
                    <Typography fontWeight="lg" mt={0.25}>
                        Text saved
                    </Typography>
                    <Typography
                        fontSize="sm"
                        sx={{ opacity: 0.8, wordBreak: 'break-word' }}
                    >
                        Your text is accessible at {this.state.url}
                        {'   '}
                        <ClickAwayListener
                            onClickAway={() => {
                                this.setState({
                                    open: false,
                                    textButton: 'Copy to clipboard',
                                })
                            }}
                        >
                            {
                                //To handle hover and on click tooltip are used
                            }
                            <Tooltip title={this.state.textButton}>
                                <Tooltip
                                    popperprops={{
                                        disablePortal: true,
                                    }}
                                    onClose={() => {
                                        this.setState({
                                            open: false,
                                            textButton: 'Copy to clipboard',
                                        })
                                    }}
                                    open={this.state.open}
                                    disableFocusListener
                                    disableTouchListener
                                    title={this.state.textButton}
                                >
                                    <IconButton
                                        variant="plain"
                                        color="neutral"
                                        onClick={this.handleSubmit}
                                        size="sm"
                                    >
                                        <ContentCopy />
                                    </IconButton>
                                </Tooltip>
                            </Tooltip>
                        </ClickAwayListener>
                    </Typography>
                </div>
            </Alert>
        )
    }
}

export default SuccessUrlId
