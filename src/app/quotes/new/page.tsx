'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';

// --- Data Structures ---
type QuoteItem = {
  id: string;
  name: string;
  quantity: number;
  days: number;
  pricePerDay: number;
  total: number;
  note?: string;
};

type QuoteSection = {
  id: string;
  name: string;
  items: QuoteItem[];
};

// --- Main Component ---
export default function NewQuotePage() {
  const router = useRouter();
  const [grandTotal, setGrandTotal] = useState(0);
  const [sections, setSections] = useState<QuoteSection[]>([
    { id: '1', name: 'Video', items: []},
    { id: '2', name: 'Audio', items: []}
  ]);

  // Recalculate grand total whenever sections change
  useEffect(() => {
    const total = sections.reduce((total, section) => {
      return total + section.items.reduce((sectionTotal, item) => sectionTotal + item.total, 0);
    }, 0);
    setGrandTotal(total);
  }, [sections]);

  const handleItemChange = (sectionId: string, itemId: string, field: keyof QuoteItem, value: any) => {
    setSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          const newItems = section.items.map(item => {
            if (item.id === itemId) {
              const updatedItem = { ...item, [field]: value };
              if (['quantity', 'days', 'pricePerDay'].includes(field)) {
                  const qty = field === 'quantity' ? Number(value) : item.quantity;
                  const days = field === 'days' ? Number(value) : item.days;
                  const price = field === 'pricePerDay' ? Number(value) : item.pricePerDay;
                  updatedItem.total = (qty || 0) * (days || 0) * (price || 0);
              }
              return updatedItem;
            }
            return item;
          });
          return { ...section, items: newItems };
        }
        return section;
      });
    });
  };

  const addItem = (sectionId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        const newItem: QuoteItem = {
          id: Date.now().toString(),
          name: '',
          quantity: 1,
          days: 1,
          pricePerDay: 0,
          total: 0,
          note: ''
        };
        return { ...s, items: [...s.items, newItem] };
      }
      return s;
    }));
  };
  
  const removeItem = (sectionId: string, itemId: string) => {
     setSections(prev => prev.map(s => {
        if (s.id === sectionId) {
            return { ...s, items: s.items.filter(i => i.id !== itemId) };
        }
        return s;
     }));
  };

  const addSection = () => {
    const newSectionName = `New Section ${sections.length + 1}`;
    setSections(prev => [...prev, { id: Date.now().toString(), name: newSectionName, items: [] }]);
  };

  const removeSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" component="h1">Create New Quote</Typography>
      </Box>

      {/* Event Details */}
      <Paper sx={{ p: {xs: 2, md: 3}, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Event Details</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mt: 2 }}>
          <TextField label="Event Name" variant="filled" />
          <TextField label="Client Name" variant="filled" />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2}}>
            <TextField label="Prep Date" type="date" variant="filled" InputLabelProps={{ shrink: true }} />
            <TextField label="Start Date" type="date" variant="filled" InputLabelProps={{ shrink: true }} />
            <TextField label="End Date" type="date" variant="filled" InputLabelProps={{ shrink: true }} />
          </Box>
        </Box>
      </Paper>

      {/* Sections */}
      {sections.map((section) => (
        <Paper key={section.id} sx={{ mb: 4, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>{section.name}</Typography>
              <IconButton size="small" color="error" onClick={() => removeSection(section.id)}><DeleteIcon /></IconButton>
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
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {section.items.map((item) => (
                  <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ p: 0.5 }}><TextField variant="standard" fullWidth value={item.name} onChange={e => handleItemChange(section.id, item.id, 'name', e.target.value)} /></TableCell>
                    <TableCell sx={{ p: 0.5, minWidth: '60px' }}><TextField variant="standard" fullWidth type="number" value={item.quantity} onChange={e => handleItemChange(section.id, item.id, 'quantity', e.target.value)} /></TableCell>
                    <TableCell sx={{ p: 0.5, minWidth: '60px' }}><TextField variant="standard" fullWidth type="number" value={item.days} onChange={e => handleItemChange(section.id, item.id, 'days', e.target.value)} /></TableCell>
                    <TableCell sx={{ p: 0.5, minWidth: '90px' }}><TextField variant="standard" fullWidth type="number" value={item.pricePerDay} onChange={e => handleItemChange(section.id, item.id, 'pricePerDay', e.target.value)} /></TableCell>
                    <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                    <TableCell sx={{ p: 0.5 }}><TextField variant="standard" fullWidth value={item.note} onChange={e => handleItemChange(section.id, item.id, 'note', e.target.value)} /></TableCell>
                    <TableCell sx={{ p: 0.5 }}><IconButton size="small" onClick={() => removeItem(section.id, item.id)}><DeleteIcon fontSize="inherit" /></IconButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <Button startIcon={<AddIcon />} onClick={() => addItem(section.id)}>Add Item</Button>
          </Box>
        </Paper>
      ))}

      <Button onClick={addSection} variant="outlined" sx={{ mb: 4 }}>Add Section</Button>

      {/* Grand Total */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h5" component="span">Grand Total:</Typography>
          <Typography variant="h4" component="span">${grandTotal.toFixed(2)}</Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="text" onClick={() => router.back()}>Cancel</Button>
        <Button variant="contained" color="primary" size="large">Save Quote</Button>
      </Box>
    </Box>
  );
}
