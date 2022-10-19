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
import { useParams } from 'react-router-dom';
import he from 'he';
import CircularProgress from '@mui/joy/CircularProgress';


// current limitation of rust-wasm for async stuff : (
  let client = null;
  let pasteNymClientId = process.env.REACT_APP_NYM_CLIENT_SERVER;
  let self_address = null



function Texts() {
    // get param urlid from URL
    const { urlId } = useParams();

    const [state, setState] = React.useState({ 
        urlId: null,
        text: null
    });
    
    
    const [wasm, setWasm] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    React.useEffect(() => {
      let isMounted = true;
                 // note mutable flag
      const loadWasm = async () => {
        try {
          
          const wasm = await import('@nymproject/nym-client-wasm');
          if (isMounted) {
          
          
          wasm.set_panic_hook();
          const validator = "https://validator.nymtech.net/api";
    
        client = new wasm.NymClient(validator);

        const on_message = (msg) => displayReceived(msg);
        const on_connect = () => console.log("Established (and authenticated) gateway connection!");
    

        client.set_on_gateway_connect(on_connect);
        client.set_on_message(on_message);
    
    
        // this is current limitation of wasm in rust - for async methods you can't take self my reference...
        // I'm trying to figure out if I can somehow hack my way around it, but for time being you have to re-assign
        // the object (it's the same one)
        client = await client.initial_setup();
            
        self_address = client.self_address();
        console.log(client.self_address());
        setWasm(client);
        await sendMessageTo("getText",self_address);
        
        }
        
        setLoading(true);
        
    
        } finally {
          setLoading(false);
        }
      };
      
      loadWasm().catch(console.error);
      
      return () => { isMounted = false };
    },[]);
      
    async function sendMessageTo(cmd,self_address) {  
      const message = self_address+"/"+cmd+"/"+urlId;
  
      client = await client.send_message(message, pasteNymClientId);
  
  }
      

  function displayReceived(message) {
    const content = message.message;
    const replySurb = message.replySurb;
    console.log(content)

    setState({
      urlId: `${urlId}`,
    text: he.decode(content)
  })


}

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
              <Typography fontSize="sm">
                <b>Client id</b> {wasm ? (self_address.split("@")[0].slice(0,60)+"...") : <CircularProgress sx={{
                                "--CircularProgress-size": "20px",
                                "--CircularProgress-track-thickness": "3px",
                                "--CircularProgress-progress-thickness": "3px"}} />}
              </Typography >
              <Typography fontSize="sm">
                <b>Connected Gateway</b> {wasm ? (self_address.split("@")[1]) : <CircularProgress sx={{
                                "--CircularProgress-size": "20px",
                                "--CircularProgress-track-thickness": "3px",
                                "--CircularProgress-progress-thickness": "3px"}} />}
              </Typography>
              
            </div>

            <Box sx={{ 
              display: 'flex', 
              whiteSpace: 'pre-wrap'
            }}>
              {state.text ? state.text : <Button startDecorator={<CircularProgress variant="solid" thickness={2} />}>
                                          Loading…
                                          </Button>}
            </Box>

            
            
          </Sheet>
        
        </main>
        <footer>
        <Footer/>
        </footer>
      </CssVarsProvider>
    );
  }
  
  export default Texts;
  