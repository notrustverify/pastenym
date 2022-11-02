import * as React from 'react'
import Alert from '@mui/joy/Alert'
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import { ColorPaletteProp,CssVarsProvider } from '@mui/joy/styles'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import WarningIcon from '@mui/icons-material/Warning'
import Link from '@mui/joy/Link'
import Box from '@mui/joy/Box'

class Disclaimer extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
          <main>
          <Box sx={{ display: 'flex', gap: 1, width: 'auto', flexDirection: 'column',
          mx: 3,
          py: 2
           // padding top & bottom
        }}>
            <Alert
            size="sm"
          sx={{ alignItems: 'flex-start' }}
          startDecorator={React.cloneElement(<WarningIcon />, {
            sx: { mt: '1px', mx: '3px' },
            fontSize: 'xl2',
          })}
          variant="soft"
          color='warning'
          endDecorator={
            <IconButton variant="soft" size="sm" color='warning'>
             
            </IconButton>
          }
        >
          <div>
            <Typography fontWeight="lg" mt={0.25}>
              Disclaimer
            </Typography>
            <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
            Pastenym is in alpha stage and shouldn't be used to share sensitive information.
            <b>The authors decline any responsibility for the information transmitted using this service.</b>
            </Typography>
          </div>
        </Alert>
        </Box>
        </main>
      )
    }
        
    
}


export default Disclaimer
