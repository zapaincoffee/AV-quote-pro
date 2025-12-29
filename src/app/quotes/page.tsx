'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface Quote {
  id: string;
  eventName: string;
  clientName: string;
  eventDate: string;
  total: number;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const response = await fetch('/api/quotes');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Quote[] = await response.json();
        setQuotes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuotes();
  }, []);

  if (loading) {
    return (
      <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error">Error loading quotes: {error}</Alert>
      </Box>
    );
  }

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
        sx={{ mb: 3 }}
      >
        Create New Quote
      </Button>
      <Typography variant="h6">Your Quotes:</Typography>
      {quotes.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No quotes created yet.
        </Typography>
      ) : (
        <List>
          {quotes.map((quote) => (
            <ListItem key={quote.id} divider>
              <ListItemText
                primary={`${quote.eventName} - ${quote.clientName}`}
                secondary={`Date: ${quote.eventDate} | Total: $${quote.total.toFixed(2)}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
