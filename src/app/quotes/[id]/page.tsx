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
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';

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

interface StaffMember {
  id: string;
  name: string;
  role: string;
  estimatedHours: number;
  actualHours?: number;
}

import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
  status?: string;
  sections: QuoteSection[];
  staff?: StaffMember[];
}

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<{ termsOfService: string; paymentTerms: string }>({ termsOfService: '', paymentTerms: '' });
  
  // Staff State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffHours, setNewStaffHours] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Quote
        const quoteRes = await fetch(`/api/quotes/${id}`);
        if (!quoteRes.ok) throw new Error(`HTTP error! status: ${quoteRes.status}`);
        const quoteData = await quoteRes.json();
        setQuote(quoteData);

        // Fetch Settings
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            setSettings(settingsData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const updateQuote = async (updatedQuote: Quote) => {
    setQuote(updatedQuote);
    try {
        await fetch(`/api/quotes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedQuote)
        });
    } catch (err) {
        console.error('Failed to update quote', err);
    }
  };

  const handleApproveAndBook = async () => {
      if (!confirm('This will approve the quote and attempt to create bookings in shelf.nu. Continue?')) return;
      
      setBookingLoading(true);
      try {
          const res = await fetch(`/api/quotes/${id}/book`, { method: 'POST' });
          const data = await res.json();
          
          if (res.ok) {
              alert('Quote approved and items booked!');
              setQuote(prev => prev ? { ...prev, status: 'Approved' } : null);
          } else if (res.status === 207) {
              alert(`Quote approved but some items failed to book: \n${data.errors.map((e: any) => e.error).join('\n')}`);
              setQuote(prev => prev ? { ...prev, status: 'Approved' } : null);
          } else {
              alert(`Failed to book: ${data.message}`);
          }
      } catch (err) {
          console.error(err);
          alert('Error connecting to server.');
      } finally {
          setBookingLoading(false);
      }
  };

  const handleAddStaff = () => {
    if (!quote || !newStaffName || !newStaffRole) return;
    const newMember: StaffMember = {
        id: Date.now().toString(),
        name: newStaffName,
        role: newStaffRole,
        estimatedHours: Number(newStaffHours) || 8,
        actualHours: 0
    };
    const updatedStaff = [...(quote.staff || []), newMember];
    updateQuote({ ...quote, staff: updatedStaff });
    setNewStaffName('');
    setNewStaffRole('');
    setNewStaffHours('');
  };

  const handleUpdateActualHours = (staffId: string, hours: string) => {
      if (!quote) return;
      const updatedStaff = (quote.staff || []).map(s => 
        s.id === staffId ? { ...s, actualHours: Number(hours) } : s
      );
      updateQuote({ ...quote, staff: updatedStaff });
  };

  const addToGoogleCalendar = () => {
      if (!quote) return;
      const start = quote.startDate.replace(/-/g, '');
      const end = quote.endDate.replace(/-/g, '');
      // Google Calendar format requires YYYYMMDD
      const dates = `${start}/${end}`; 
      const details = `Client: ${quote.clientName}\nNotes: Generated by AV Quote Pro`;
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(quote.eventName)}&dates=${dates}&details=${encodeURIComponent(details)}`;
      window.open(url, '_blank');
  };

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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => router.push('/quotes')} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
            <Typography variant="h4" component="h1">Quote Details</Typography>
            {quote.status === 'Approved' && (
                <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', color: 'success.main', bgcolor: 'success.light', px: 1, py: 0.5, borderRadius: 1 }}>
                    <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" fontWeight="bold">APPROVED</Typography>
                </Box>
            )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<EventIcon />} onClick={addToGoogleCalendar}>
                Add to Calendar
            </Button>
            {quote.status !== 'Approved' && (
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handleApproveAndBook}
                    disabled={bookingLoading}
                >
                    {bookingLoading ? 'Booking...' : 'Approve & Book'}
                </Button>
            )}
        </Box>
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

      {/* Staff & Labor Section */}
      <Paper sx={{ mb: 4, p: 2 }}>
          <Typography variant="h6" gutterBottom>Staff & Labor Tracking</Typography>
          <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell align="right">Est. Hours</TableCell>
                        <TableCell align="right">Actual Hours</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(quote.staff || []).map((staff) => (
                        <TableRow key={staff.id}>
                            <TableCell>{staff.name}</TableCell>
                            <TableCell>{staff.role}</TableCell>
                            <TableCell align="right">{staff.estimatedHours}</TableCell>
                            <TableCell align="right" sx={{ width: '150px' }}>
                                <TextField 
                                    type="number" 
                                    size="small" 
                                    value={staff.actualHours || ''} 
                                    onChange={(e) => handleUpdateActualHours(staff.id, e.target.value)}
                                    placeholder="0"
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!quote.staff || quote.staff.length === 0) && (
                        <TableRow>
                             <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>No staff assigned yet.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField label="Name" size="small" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} />
            <TextField label="Role" size="small" value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} />
            <TextField label="Est. Hours" size="small" type="number" sx={{ width: '100px' }} value={newStaffHours} onChange={e => setNewStaffHours(e.target.value)} />
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleAddStaff}>Add Crew</Button>
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

      {/* Terms & Conditions Display */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>Terms & Conditions</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 4 }}>
              <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Terms of Service</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{settings.termsOfService || 'Not set'}</Typography>
              </Box>
               <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Payment Terms</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{settings.paymentTerms || 'Not set'}</Typography>
              </Box>
          </Box>
      </Paper>

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
