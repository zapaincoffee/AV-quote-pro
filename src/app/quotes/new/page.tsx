'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

export default function NewQuotePage() {
  const router = useRouter();

  return (
    <Box sx={{ my: 4 }}>
      <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Quote
      </Typography>
      <Typography variant="body1">
        (Quote creation form will be here.)
      </Typography>
    </Box>
  );
}
