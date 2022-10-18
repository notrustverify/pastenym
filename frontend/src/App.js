import * as React from 'react';
import { CssVarsProvider, useColorScheme,extendTheme } from '@mui/joy/styles';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import TextField from '@mui/joy/TextField';
import Button from '@mui/joy/Button';
import Link from '@mui/joy/Link';
import Textarea from '@mui/joy/Textarea';
import Header from './Header';
import Footer from './Footer'
import Box from '@mui/joy/Box';
import {Navigate,useNavigate} from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import ReportIcon from '@mui/icons-material/Report';
import Alert from '@mui/joy/Alert';
import IconButton from '@mui/joy/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CircularProgress from '@mui/joy/CircularProgress';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';


// current limitation of rust-wasm for async stuff : (
let client = null;
let pasteNymClientId = process.env.REACT_APP_NYM_CLIENT_SERVER;
let self_address = null







function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);

  // necessary for server-side rendering
  // because mode is undefined on the server
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }
}




const theme = extendTheme({
  components: {
    
  },
});



function App() {
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [wasm, setWasm] = React.useState(null);
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(!loading);

    const loadWasm = async () => {
        
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

      }
    
    };
    
    loadWasm().catch(console.error);
   
    return () => { isMounted = false };
  },[]);
    
  async function sendMessageTo(cmd,content) {  
    const message = self_address+"/"+cmd+"/"+content;

    client = await client.send_message(message, pasteNymClientId);

}


    

function displayReceived(message) {
  const content = message.message;
  const replySurb = message.replySurb;
  console.log(content.length)

  if ( content.length > 0) {
    if (content === "text too long"){
      setOpen(true);
    } else {
      navigate("/"+content);
    }
  } else {
  console.log(content);
}
  
}

function ErrorModal(){
  

  return (
    <Modal
    aria-labelledby="modal-title"
    aria-describedby="modal-desc"
    open={open}
    onClose={() => setOpen(false)}
    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
  >

    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 500,
        borderRadius: 'md',
        p: 3,
        boxShadow: 'lg',
      }}
    >
      <ModalClose
        variant="outlined"
        sx={{
          top: 'calc(-1/4 * var(--IconButton-size))',
          right: 'calc(-1/4 * var(--IconButton-size))',
          boxShadow: '0 2px 12px 0 rgba(0 0 0 / 0.2)',
          borderRadius: '50%',
          bgcolor: 'background.body',
        }}
      />
      <Typography
        component="h2"
        id="modal-title"
        level="h4"
        textColor="inherit"
        fontWeight="lg"

        mb={1}
      >
        Error
      </Typography>
      <Typography id="modal-desc" textColor="text.tertiary">
        Too many char
      </Typography>
    </Sheet>
  </Modal>
      )
}

  const sendText = () =>  {
    console.log("button click");

    if (text.length <= 10000)
      sendMessageTo("newText",text);
    else
      setOpen(true)
    
  }

  return (
  

<CssVarsProvider theme={theme}>
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
              <b>Pastenym {loading}</b>
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
          
          <Textarea
          sx={{
            
          }}
          label="Text to share"
        placeholder="Type in here…"
        minRows={10}
        fullwidth="true"
        required
        disabled={wasm ? false: true}
        value={text}
        onChange={(event) => setText(event.target.value)}
        startDecorator={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            
          </Box>
        }
        endDecorator={
          <Typography level="body3" sx={{ ml: 'auto' }}>
            {text.length} character(s)
          </Typography>
        }
       
       />
          <Button
          loading={wasm ? false: true}
          onClick={sendText}
          endDecorator={<SendIcon />}
          sx={{ mt: 1 /* margin top */ }}>

            Send
              
          </Button>
          <ErrorModal />
        </Sheet>
      
      </main>
      <footer>
      <Footer/>
      </footer>
    </CssVarsProvider>
  );
}

export default App;
