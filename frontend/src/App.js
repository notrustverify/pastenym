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




let client = null;

class WebWorkerClient {
  worker = null;

  constructor() {
    this.worker = new Worker(`${process.env.PUBLIC_URL}worker.js`);

    this.worker.onmessage = (ev) => {
      if (ev.data && ev.data.kind) {
        switch (ev.data.kind) {
          case 'Ready':
            const { selfAddress } = ev.data.args;
            displaySenderAddress(selfAddress);
            break;
          case 'ReceiveMessage':
            const { message } = ev.data.args;
            displayReceived(message);
            break;
        }
      }
    };
  }

  sendMessage = (message, recipient) => {
    if (!this.worker) {
      console.error('Could not send message because worker does not exist');
      return;
    }

    this.worker.postMessage({
      kind: 'SendMessage',
      args: {
        message, recipient,
      },
    });
  };
}
  
function displayReceived(message) {
  return
}

function displaySenderAddress(address) {
  document.getElementById('sender').value = address;
}

async function sendMessageTo() {
  const message = document.getElementById('message').value;
  const recipient = document.getElementById('recipient').value;

  await client.sendMessage(message, recipient);
  displaySend(message);
}

function displaySend(message) {
  let timestamp = new Date().toISOString().substr(11, 12);

  let sendDiv = document.createElement('div');
  let paragraph = document.createElement('p');
  paragraph.setAttribute('style', 'color: blue');
  let paragraphContent = document.createTextNode(timestamp + ' sent >>> ' + message);
  paragraph.appendChild(paragraphContent);

  sendDiv.appendChild(paragraph);
  document.getElementById('output').appendChild(sendDiv);
}

async function main() {
  client = new WebWorkerClient();

}

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

const sendText = () =>  {
  console.log("button click");
  sendMessageTo();
}

const theme = extendTheme({
  components: {
    
  },
});


function App() {

  main();


  const [text, setText] = React.useState('');
  //var worker = new Worker(NymWorker);
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
              <b>Pastenym</b>
            </Typography>
            
          </div>
          
          <Textarea
          sx={{
            
          }}
          label="Text to share"
        placeholder="Type in here…"
        minRows={10}
        fullWidth
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
