import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box'; // Use Box for more control
import Button from '@mui/material/Button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "AV Quote Pro",
  description: "Create and manage AV quotes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AppBar position="static" color="inherit" elevation={0}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                AV Quote Pro
              </Typography>
              <Button color="inherit" component={Link} href="/">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} href="/equipment">
                Equipment
              </Button>
              <Button color="inherit" component={Link} href="/quotes">
                Quotes
              </Button>
              <Button color="inherit" component={Link} href="/settings">
                Settings
              </Button>
            </Toolbar>
          </AppBar>
          <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: { xs: 2, sm: 3, md: 4 } }}>
            {children}
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
