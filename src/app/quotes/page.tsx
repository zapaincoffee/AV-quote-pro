import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';

export default function QuotesPage() {
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Quote Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        href="/quotes/new"
      >
        Create New Quote
      </Button>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Your Quotes:</Typography>
        <Typography variant="body2" color="text.secondary">
          (No quotes created yet. List will appear here.)
        </Typography>
      </Box>
    </Box>
  );
}
