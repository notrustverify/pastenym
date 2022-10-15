import * as React from 'react';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import Button from '@mui/joy/Button';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';


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

class Header extends React.Component {

  render()
  {
  return (
    <CssVarsProvider>
<Breadcrumbs separator="›" aria-label="breadcrumbs">
  <Link href="/"
  underline="hover"
  color="neutral"
  fontSize="inherit"
  >Home</Link>
</Breadcrumbs>
    </CssVarsProvider>
  )
  }
}

export default Header;