'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface QuoteItem {
  id: string;
  name: string;
  quantity: number;
  days: number;
  pricePerDay: number;
  total: number;
  note?: string;
}

interface QuoteSection {
  id: string;
  name: string;
  items: QuoteItem[];
}

interface Quote {
  id: string;
  eventName: string;
  clientName: string;
  prepDate: string;
  startDate: string;
  endDate: string;
  total: number;
  totalCost?: number;
  discount?: number;
  sections: QuoteSection[];
}

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const response = await fetch(`/api/quotes/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuote(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchQuote();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !quote) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error">Error loading quote: {error || 'Quote not found'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/quotes')} sx={{ mt: 2 }}>
          Back to Quotes
        </Button>
      </Box>
    );
  }

  const subtotal = (quote.total || 0) + (quote.discount || 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push('/quotes')} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" component="h1">Quote Details</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom color="primary">Event Information</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Event Name</Typography>
            <Typography variant="body1">{quote.eventName}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Client Name</Typography>
            <Typography variant="body1">{quote.clientName}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Prep Date</Typography>
            <Typography variant="body1">{quote.prepDate || 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Event Dates</Typography>
            <Typography variant="body1">
              {quote.startDate} to {quote.endDate}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {quote.sections.map((section) => (
        <Paper key={section.id} sx={{ mb: 4, overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{section.name}</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Qty</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Days</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Price/Day</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Note</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {section.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{item.days}</TableCell>
                    <TableCell align="right">${item.pricePerDay.toFixed(2)}</TableCell>
                    <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                    <TableCell>{item.note}</TableCell>
                  </TableRow>
                ))}
                {section.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 2 }}>No items in this section</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Section Subtotal: ${section.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
            </Typography>
          </Box>
        </Paper>
      ))}

      {/* Financial Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Paper sx={{ p: 3, minWidth: '300px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Discount:</Typography>
                <Typography>-${(quote.discount || 0).toFixed(2)}</Typography>
            </Box>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Grand Total:</Typography>
                <Typography variant="h6" color="primary">${quote.total.toFixed(2)}</Typography>
            </Box>

            {/* Internal Metrics */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed grey' }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>INTERNAL FINANCIALS</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="error">Total Cost:</Typography>
                    <Typography variant="body2" color="error">${(quote.totalCost || 0).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="success.main">Profit:</Typography>
                    <Typography variant="body2" color="success.main">${(quote.total - (quote.totalCost || 0)).toFixed(2)}</Typography>
                </Box>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="success.main">Margin:</Typography>
                    <Typography variant="body2" color="success.main">
                        {quote.total > 0 ? (((quote.total - (quote.totalCost || 0)) / quote.total) * 100).toFixed(1) : 0}%
                    </Typography>
                </Box>
            </Box>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
        <Button variant="outlined" color="error" onClick={async () => {
          if (confirm('Are you sure you want to delete this quote?')) {
            await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
            router.push('/quotes');
          }
        }}>Delete Quote</Button>
        <Button variant="contained" color="primary">Print / Export PDF</Button>
      </Box>
    </Box>
  );
}
