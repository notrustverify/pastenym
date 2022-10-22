import * as React from 'react'
import Alert from '@mui/joy/Alert'
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import { ColorPaletteProp,CssVarsProvider } from '@mui/joy/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ReportIcon from '@mui/icons-material/Report';
import Link from '@mui/joy/Link'
import Box from '@mui/joy/Box'

class HttpDetection extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
          <main>
          <Box sx={{ display: 'flex', gap: 2, width: 'auto', flexDirection: 'column',
          mx: 4,
          py: 3
           // padding top & bottom
        }}>
            <Alert
          sx={{ alignItems: 'flex-start' }}
          startDecorator={React.cloneElement(<ReportIcon />, {
            sx: { mt: '2px', mx: '4px' },
            fontSize: 'xl2',
          })}
          variant="soft"
          color='danger'
          endDecorator={
            <IconButton variant="soft" size="sm" color='danger'>
             
            </IconButton>
          }
        >
          <div>
            <Typography fontWeight="lg" mt={0.25}>
              Error: HTTPS will not work for now
            </Typography>
            <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
                Please use <Link href={"http://paste.notrustverify.ch"} >HTTP</Link> version                
            </Typography>
          </div>
        </Alert>
        </Box>
        </main>
      )
    }
        
    
}


export default HttpDetection