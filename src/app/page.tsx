import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function HomePage() {
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to AV Quote Pro Dashboard
      </Typography>
      <Typography variant="body1">
        This is your central hub for managing AV equipment quotes and services.
      </Typography>
    </Box>
  );
}
