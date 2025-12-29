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
import Divider from '@mui/material/Divider';
import AddEquipmentDialog from '@/components/AddEquipmentDialog'; // Import the dialog
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

// --- Data Structures ---
interface Equipment {
  id: string;
  name: string;
  dailyPrice: number;
}

interface QuoteItem {
  equipmentId: string;
  name: string;
  quantity: number;
  pricePerDay: number;
  calculatedPrice: number;
}

interface QuoteSection {
  id: string;
  name: string;
  items: QuoteItem[];
}

interface Quote {
  eventName: string;
  clientName: string;
  eventDate: string;
  rentalDuration: number;
  sections: QuoteSection[];
  total: number;
}

// --- Pricing Logic ---
const getPriceMultiplier = (days: number): number => {
  if (days <= 1) return 1;
  if (days === 2) return 1.5;
  if (days === 3) return 2;
  return 2.5;
};

// --- Main Component ---
export default function NewQuotePage() {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote>({
    eventName: '',
    clientName: '',
    eventDate: '',
    rentalDuration: 1,
    sections: [],
    total: 0,
  });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // --- Recalculate Total ---
  useEffect(() => {
    const multiplier = getPriceMultiplier(quote.rentalDuration);
    const newTotal = quote.sections.reduce((sectionTotal, section) => {
      return sectionTotal + section.items.reduce((itemTotal, item) => {
        const calculatedPrice = item.pricePerDay * multiplier * item.quantity;
        return itemTotal + calculatedPrice;
      }, 0);
    }, 0);
    setQuote(prev => ({ ...prev, total: newTotal }));
  }, [quote.sections, quote.rentalDuration]);


  const handleEventDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = name === 'rentalDuration' ? parseInt(value, 10) || 1 : value;
    setQuote(prev => ({ ...prev, [name]: val }));
  };

  const addSection = () => {
    setQuote(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id: Date.now().toString(), name: 'New Section', items: [] },
      ],
    }));
  };

  const removeSection = (sectionId: string) => {
    setQuote(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
    }));
  };
  
  const updateSectionName = (sectionId: string, newName: string) => {
    setQuote(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, name: newName } : s
      ),
    }));
  };

  const openAddEquipmentDialog = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setDialogOpen(true);
  };

  const handleCloseDialog = (selectedItems: Equipment[]) => {
    setDialogOpen(false);
    if (selectedItems.length > 0 && activeSectionId) {
      const newItems: QuoteItem[] = selectedItems.map(item => ({
        equipmentId: item.id,
        name: item.name,
        quantity: 1, // Default quantity
        pricePerDay: item.dailyPrice,
        calculatedPrice: item.dailyPrice * getPriceMultiplier(quote.rentalDuration),
      }));
      
      setQuote(prev => ({
        ...prev,
        sections: prev.sections.map(s =>
          s.id === activeSectionId ? { ...s, items: [...s.items, ...newItems] } : s
        ),
      }));
    }
    setActiveSectionId(null);
  };

  const removeItem = (sectionId: string, equipmentId: string) => {
    setQuote(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
        ? { ...s, items: s.items.filter(i => i.equipmentId !== equipmentId) }
        : s
      ),
    }));
  };

  const handleSaveQuote = async () => {
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote),
      });
      if (!response.ok) throw new Error('Failed to save quote');
      alert('Quote saved!');
      router.push('/quotes');
    } catch (error) {
      console.error(error);
      alert('Error saving quote.');
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <AddEquipmentDialog open={isDialogOpen} onClose={handleCloseDialog} />

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Create New Quote
        </Typography>
      </Box>

      {/* Event Details Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Event Details</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
          <TextField label="Event Name" name="eventName" value={quote.eventName} onChange={handleEventDetailsChange} required />
          <TextField label="Client Name" name="clientName" value={quote.clientName} onChange={handleEventDetailsChange} required />
          <TextField label="Event Date" name="eventDate" type="date" value={quote.eventDate} onChange={handleEventDetailsChange} InputLabelProps={{ shrink: true }} required />
          <TextField label="Rental Duration (days)" name="rentalDuration" type="number" value={quote.rentalDuration} onChange={handleEventDetailsChange} required inputProps={{ min: 1 }} />
        </Box>
      </Paper>

      {/* Sections Management */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Sections</Typography>
          <Button variant="contained" onClick={addSection}>Add Section</Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        {quote.sections.map((section) => (
          <Paper key={section.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField value={section.name} onChange={(e) => updateSectionName(section.id, e.target.value)} variant="standard" sx={{ flexGrow: 1, mr: 2 }} />
              <IconButton onClick={() => removeSection(section.id)} color="error"><DeleteIcon /></IconButton>
            </Box>
            <List dense>
              {section.items.map(item => (
                <ListItem key={item.equipmentId} secondaryAction={<IconButton edge="end" onClick={() => removeItem(section.id, item.equipmentId)}><DeleteIcon fontSize="small" /></IconButton>}>
                  <ListItemText primary={item.name} secondary={`Qty: ${item.quantity} | Price: $${item.calculatedPrice.toFixed(2)}`} />
                </ListItem>
              ))}
            </List>
            <Button size="small" onClick={() => openAddEquipmentDialog(section.id)}>Add Item</Button>
          </Paper>
        ))}
      </Paper>
      
      {/* Total */}
      <Typography variant="h5" component="p" align="right" sx={{ mb: 2 }}>
        Total: ${quote.total.toFixed(2)}
      </Typography>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" color="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSaveQuote}>Save Quote</Button>
      </Box>
    </Box>
  );
}

