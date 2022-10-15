import * as React from 'react';
import { CssVarsProvider, useColorScheme,extendTheme } from '@mui/joy/styles';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import TextField from '@mui/joy/TextField';
import Button from '@mui/joy/Button';
import Link from '@mui/joy/Link';
import Header from './Header';
import Footer from './Footer'
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import AspectRatio from '@mui/joy/AspectRatio';
import ImageIcon from '@mui/icons-material/Image';
import { useParams } from 'react-router-dom'

function Text() {
    const { urlId } = useParams();
    const [state, setState] = React.useState({ 
        urlId: `${urlId}`,
        text: null
    });
    
    React.useEffect(() => {
        // get text linked text to urlID axios.get(`${urlId}`)
        setState({urlId: `${urlId}`,text:"dfsdkfhsfjhsdfsd"})
    },[]);

    return (
  
  <CssVarsProvider>
        <header>
        <Header/>
        </header>
        <main>
          
          <Sheet
            sx={{
              width: 'auto',
              height: '100%',
              mx: 'auto', // margin left & right
              borderRadius: 'sm',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              boxShadow: 'md',
              mx:4,
              px: 3,
              my: 4, // margin top & botom
              py: 3, // padding top & bottom
            }}
            variant="outlined"
          >
            <div>
              <Typography level="h4" component="h1">
                <b>Pastenym</b>
              </Typography>
              
            </div>

            <div>
                {state.text}
            </div>
            
            
          </Sheet>
        
        </main>
        <footer>
        <Footer/>
        </footer>
      </CssVarsProvider>
    );
  }
  
  export default Text;
  