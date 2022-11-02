import * as React from 'react'
import { Icon } from '@iconify/react'
import Typography from '@mui/joy/Typography'
import Link from '@mui/joy/Link'
import EmailIcon from '@mui/icons-material/Email'
import TelegramIcon from '@mui/icons-material/Telegram'
import Medium from '@iconify-icons/bi/medium'
import Matrix from '@iconify/icons-simple-icons/matrix'
import TwitterIcon from '@mui/icons-material/Twitter'
import GitHubIcon from '@mui/icons-material/GitHub';

import { CssVarsProvider, useColorScheme } from '@mui/joy/styles'

function Copyright() {
    return (
        <CssVarsProvider>
            <Typography variant="body2" color="text.secondary" align="center">
                Powered by{' '}
                <Link href="https://nymtech.net" underline="none">
                    Nym
                </Link>
                <br />
                Developed by{' '}
                <Link href="https://notrustverify.ch" underline="none">
                    No Trust Verify
                </Link>
                <br />
                <Link
                    href="mailto:hello@notrustverify.ch"
                    underline="none"
                    color="primary"
                >
                    <EmailIcon />{' '}
                </Link>{' '}
                <Link
                    href="https://t.me/notrustverify"
                    underline="none"
                    color="primary"
                >
                    <TelegramIcon />{' '}
                </Link>{' '}
                <Link href="https://medium.com/notrustverify" color="primary">
                    <Icon icon={Medium} />{' '}
                </Link>{' '}
                <Link
                    href="https://matrix.to/#/#no-trust-verify:mandragot.org"
                    color="primary"
                >
                    <Icon icon={Matrix} />{' '}
                </Link>{' '}
                <Link href="https://twitter.com/notrustverif" color="primary">
                    <TwitterIcon />
                </Link>
                <Link href="https://github.com/notrustverify/pastenym/" color="primary">
                    <GitHubIcon />{' '}
                </Link>

            </Typography>
        </CssVarsProvider>
    )
}

class Footer extends React.Component {
    render() {
        return <Copyright />
    }
}

export default Footer
