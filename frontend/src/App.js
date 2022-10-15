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


// current limitation of rust-wasm for async stuff : (
let client = null;
let pasteNymClientId = "GEUpbQQg1ySd6tPk8h4CGmTYRLf6kv2KUzXoXzirVf3H.6yXK5WDwMboxS9vcVk1YyGDKGs8zMskiaHDR6TK3hvs8@GsGEZiDBz8SWfHGaK5SDmhfbTEM55v37WCYYcT9wTSxN";



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

  return (
    <Button
      variant="outlined"
      onClick={() => {
        setMode(mode === 'light' ? 'dark' : 'light');
      }}
    >
      {mode === 'light' ? 'Turn dark' : 'Turn light'}
    </Button>
  );
}


const theme = extendTheme({
  components: {
    
  },
});

const Unloaded = ({ loading, loadWasm }) => {
  return loading ? (
    <div>Loading...</div>
  ) : (
    <button onClick={loadWasm}>Load Nym</button>
  );
};



function App() {
  const [text, setText] = React.useState('');

  const [wasm, setWasm] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const loadWasm = async () => {
    try {

      const wasm = await import('@nymproject/nym-client-wasm');
      setWasm(wasm);
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

    const self_address = client.self_address();
      console.log(client.self_address());
  
    setLoading(true);
    } finally {
      setLoading(false);
    }
  };

  async function sendMessageTo(cmd,text) {
    const message = client.self_address()+"/"+cmd+"/"+text;
  
    console.log(message)
    client = await client.send_message(message, pasteNymClientId);
    //displaySend(message);
  }


  function displayReceived(message) {
    console.log(message);
    const content = message.message;
    const replySurb = message.replySurb;
    let hostname = ""
   if (window.location.port.length > 0){
      hostname = window.location.hostname+':'+window.location.port
   } else {
      hostname = window.location.hostname
   }

   const urlBasePaste = 'http://'+hostname+'/'
   
    if (content.length > 0) {
        window.location.href = urlBasePaste+content;
    }else{

    let paragraphContent = "Error try again"
    document.getElementById("output").innerHTML = paragraphContent
    }
}

  const sendText = () =>  {
    console.log("button click");
    sendMessageTo("newText",text);
    console.log(text);
  }

  return (
  

<CssVarsProvider theme={theme}>
      <header>
      <Header/>
      { <Unloaded loading={loading} loadWasm={loadWasm} />}
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
            
          </div>
          
          <Textarea
          sx={{
            
          }}
          label="Text to share"
        placeholder="Type in here…"
        minRows={10}
        fullwidth="true"
        required
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
          onClick={sendText}
          sx={{ mt: 1 /* margin top */ }}>
            Share your text
              
          </Button>
          
        </Sheet>
      
      </main>
      <footer>
      <Footer/>
      </footer>
    </CssVarsProvider>
  );
}

export default App;
