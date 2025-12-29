import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry"; // Import ThemeRegistry
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

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
        <ThemeRegistry> {/* Wrap the body content with ThemeRegistry */}
          <AppBar position="static">
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
            </Toolbar>
          </AppBar>
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {children}
          </Container>
        </ThemeRegistry>
      </body>
    </html>
  );
}
