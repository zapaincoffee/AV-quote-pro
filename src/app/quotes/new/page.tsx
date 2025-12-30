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
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import dayjs from 'dayjs'; // Ensure dayjs is available or use native Date

// --- Data Structures ---
type EquipmentItem = {
  id: string;
  name: string;
  description: string;
  dailyPrice: number;
};

type ItemType = 'Equipment' | 'Labor' | 'Logistics' | 'Other';

type QuoteItem = {
  id: string;
  name: string;
  type: ItemType;
  quantity: number;
  days: number;
  pricePerDay: number;
  costPerDay: number; // Internal cost
  total: number;
  totalCost: number; // Internal total cost
  note?: string;
  equipmentId?: string;
};

type QuoteSection = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  items: QuoteItem[];
};

// --- Main Component ---
export default function NewQuotePage() {
  const router = useRouter();
  const [grandTotal, setGrandTotal] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [discount, setDiscount] = useState<number>(0);
  const [currency, setCurrency] = useState('CZK'); // Default CZK
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentItem[]>([]);
  const [eventDetails, setEventDetails] = useState({
    eventName: '',
    clientName: '',
    prepDate: '',
    startDate: '',
    endDate: ''
  });
  const [sections, setSections] = useState<QuoteSection[]>([
    { id: '1', name: 'Video', items: []},
    { id: '2', name: 'Audio', items: []}
  ]);

  // Fetch equipment on load
  useEffect(() => {
    async function fetchEquipment() {
      try {
        const response = await fetch('/api/equipment');
        if (response.ok) {
          const data = await response.json();
          setAvailableEquipment(data);
        }
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
      }
    }
    fetchEquipment();
  }, []);

  // Helper to calculate duration in days
  const calculateDuration = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return 1;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays + 1;
  };

  // Recalculate totals whenever sections or discount change
  useEffect(() => {
    const rawTotal = sections.reduce((total, section) => {
      return total + section.items.reduce((sectionTotal, item) => sectionTotal + item.total, 0);
    }, 0);
    
    const rawCost = sections.reduce((total, section) => {
        return total + section.items.reduce((sectionTotal, item) => sectionTotal + (item.totalCost || 0), 0);
    }, 0);

    setTotalCost(rawCost);
    setGrandTotal(rawTotal - discount);
  }, [sections, discount]);

  const handleEventDetailsChange = (field: string, value: string) => {
    setEventDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSectionChange = (id: string, field: keyof QuoteSection, value: string) => {
    setSections(prev => prev.map(section => {
        if (section.id === id) {
            const updatedSection = { ...section, [field]: value };
            
            // If dates change, update days for all items in this section
            if (field === 'startDate' || field === 'endDate') {
                const start = field === 'startDate' ? value : section.startDate;
                const end = field === 'endDate' ? value : section.endDate;
                
                // Only update if both dates are present (or fallback to event dates if cleared, but keeping simple for now)
                if (start && end) {
                    const newDays = calculateDuration(start, end);
                    updatedSection.items = section.items.map(item => ({
                        ...item,
                        days: newDays,
                        total: item.quantity * newDays * item.pricePerDay,
                        totalCost: item.quantity * newDays * item.costPerDay
                    }));
                }
            }
            return updatedSection;
        }
        return section;
    }));
  };

  const handleItemChange = (sectionId: string, itemId: string, field: keyof QuoteItem, value: any) => {
    setSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          const newItems = section.items.map(item => {
            if (item.id === itemId) {
              const updatedItem = { ...item, [field]: value };
              
              if (['quantity', 'days', 'pricePerDay', 'costPerDay'].includes(field)) {
                  const qty = field === 'quantity' ? Number(value) : item.quantity;
                  const days = field === 'days' ? Number(value) : item.days;
                  const price = field === 'pricePerDay' ? Number(value) : item.pricePerDay;
                  const cost = field === 'costPerDay' ? Number(value) : (item.costPerDay || 0);
                  
                  updatedItem.total = (qty || 0) * (days || 0) * (price || 0);
                  updatedItem.totalCost = (qty || 0) * (days || 0) * (cost || 0);
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

  const addItem = (sectionId: string, equipment?: EquipmentItem) => {
    // Determine default days: Section specific OR Event global
    const section = sections.find(s => s.id === sectionId);
    let defaultDays = 1;
    
    if (section && section.startDate && section.endDate) {
        defaultDays = calculateDuration(section.startDate, section.endDate);
    } else {
        defaultDays = calculateDuration(eventDetails.startDate, eventDetails.endDate);
    }
    
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        const newItem: QuoteItem = {
          id: Date.now().toString(),
          name: equipment?.name || '',
          type: 'Equipment',
          quantity: 1,
          days: defaultDays, 
          pricePerDay: equipment?.dailyPrice || 0,
          costPerDay: 0, 
          total: (equipment?.dailyPrice || 0) * defaultDays,
          totalCost: 0,
          note: '',
          equipmentId: equipment?.id
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

  const handleSave = async () => {
    // Validation
    if (!eventDetails.eventName || !eventDetails.clientName) {
        alert('Please fill in Event Name and Client Name.');
        return;
    }

    try {
      const quoteData = {
        ...eventDetails,
        sections,
        discount,
        currency,
        total: grandTotal,
        totalCost, 
        eventDate: eventDetails.startDate
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        throw new Error('Failed to save quote');
      }

      router.push('/quotes');
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Error saving quote. Please try again.');
    }
  };
  
  const currencySymbol = currency === 'CZK' ? 'Kč' : currency === 'EUR' ? '€' : '$';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => router.back()} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
            <Typography variant="h4" component="h1">Create New Quote</Typography>
        </Box>
        <FormControl variant="filled" sx={{ minWidth: 120 }}>
            <InputLabel>Currency</InputLabel>
            <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
            >
                <MenuItem value="CZK">CZK (Kč)</MenuItem>
                <MenuItem value="EUR">EUR (€)</MenuItem>
                <MenuItem value="USD">USD ($)</MenuItem>
            </Select>
        </FormControl>
      </Box>

      {/* Event Details */}
      <Paper sx={{ p: {xs: 2, md: 3}, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Event Details</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mt: 2 }}>
          <TextField 
            label="Event Name" 
            variant="filled" 
            value={eventDetails.eventName}
            onChange={(e) => handleEventDetailsChange('eventName', e.target.value)}
            required
            error={!eventDetails.eventName}
          />
          <TextField 
            label="Client Name" 
            variant="filled" 
            value={eventDetails.clientName}
            onChange={(e) => handleEventDetailsChange('clientName', e.target.value)}
            required
            error={!eventDetails.clientName}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2}}>
            <TextField 
              label="Prep Date" 
              type="date" 
              variant="filled" 
              InputLabelProps={{ shrink: true }} 
              value={eventDetails.prepDate}
              onChange={(e) => handleEventDetailsChange('prepDate', e.target.value)}
            />
            <TextField 
              label="Start Date" 
              type="date" 
              variant="filled" 
              InputLabelProps={{ shrink: true }} 
              value={eventDetails.startDate}
              onChange={(e) => handleEventDetailsChange('startDate', e.target.value)}
            />
            <TextField 
              label="End Date" 
              type="date" 
              variant="filled" 
              InputLabelProps={{ shrink: true }} 
              value={eventDetails.endDate}
              onChange={(e) => handleEventDetailsChange('endDate', e.target.value)}
            />
          </Box>
        </Box>
      </Paper>

      {/* Sections */}
      {sections.map((section) => (
        <Paper key={section.id} sx={{ mb: 4, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', gap: 2, flexWrap: 'wrap' }}>
              <TextField 
                  variant="standard" 
                  value={section.name} 
                  onChange={(e) => handleSectionChange(section.id, 'name', e.target.value)}
                  placeholder="Section Name"
                  sx={{ flexGrow: 1, input: { fontSize: '1.25rem', fontWeight: 'medium' } }}
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField 
                      type="date" 
                      size="small"
                      label="From" 
                      InputLabelProps={{ shrink: true }} 
                      value={section.startDate || ''}
                      onChange={(e) => handleSectionChange(section.id, 'startDate', e.target.value)}
                  />
                  <TextField 
                      type="date" 
                      size="small"
                      label="To" 
                      InputLabelProps={{ shrink: true }} 
                      value={section.endDate || ''}
                      onChange={(e) => handleSectionChange(section.id, 'endDate', e.target.value)}
                  />
                  <IconButton size="small" color="error" onClick={() => removeSection(section.id)}><DeleteIcon /></IconButton>
              </Box>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Qty</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Days</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }} align="right">Cost/Day</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Price/Day</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Total</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {section.items.map((item) => (
                  <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ p: 0.5, width: '130px' }}>
                        <Select
                            variant="standard"
                            fullWidth
                            value={item.type || 'Equipment'}
                            onChange={e => handleItemChange(section.id, item.id, 'type', e.target.value)}
                        >
                            <MenuItem value="Equipment">Equipment</MenuItem>
                            <MenuItem value="Labor">Labor</MenuItem>
                            <MenuItem value="Logistics">Logistics</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </TableCell>
                    <TableCell sx={{ p: 0.5, minWidth: '200px' }}>
                      <Autocomplete
                        freeSolo
                        options={availableEquipment}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                        value={item.name}
                        onChange={(event, newValue) => {
                          if (typeof newValue === 'string') {
                            handleItemChange(section.id, item.id, 'name', newValue);
                          } else if (newValue && newValue.name) {
                            handleItemChange(section.id, item.id, 'name', newValue.name);
                            handleItemChange(section.id, item.id, 'pricePerDay', newValue.dailyPrice);
                            handleItemChange(section.id, item.id, 'equipmentId', newValue.id);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField {...params} variant="standard" fullWidth placeholder="Item Name" />
                        )}
                      />
                    </TableCell>
                    <TableCell sx={{ p: 0.5, minWidth: '60px' }}><TextField variant="standard" fullWidth type="number" value={item.quantity} onChange={e => handleItemChange(section.id, item.id, 'quantity', e.target.value)} /></TableCell>
                    <TableCell sx={{ p: 0.5, minWidth: '60px' }}><TextField variant="standard" fullWidth type="number" value={item.days} onChange={e => handleItemChange(section.id, item.id, 'days', e.target.value)} /></TableCell>
                    <TableCell sx={{ p: 0.5, minWidth: '90px' }}>
                        <TextField 
                            variant="standard" 
                            fullWidth 
                            type="number" 
                            value={item.costPerDay} 
                            onChange={e => handleItemChange(section.id, item.id, 'costPerDay', e.target.value)}
                            InputProps={{ sx: { color: 'error.main' } }}
                        />
                    </TableCell>
                    <TableCell sx={{ p: 0.5, minWidth: '90px' }}><TextField variant="standard" fullWidth type="number" value={item.pricePerDay} onChange={e => handleItemChange(section.id, item.id, 'pricePerDay', e.target.value)} /></TableCell>
                    <TableCell align="right">{currencySymbol}{item.total.toFixed(2)}</TableCell>
                    <TableCell sx={{ p: 0.5 }}><IconButton size="small" onClick={() => removeItem(section.id, item.id)}><DeleteIcon fontSize="inherit" /></IconButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <Button startIcon={<AddIcon />} onClick={() => addItem(section.id)}>Add Custom Item</Button>
          </Box>
        </Paper>
      ))}

      <Button onClick={addSection} variant="outlined" sx={{ mb: 4 }}>Add Section</Button>

      {/* Summary and Actions */}
      <Paper sx={{ p: 3, mb: 4, maxWidth: '400px', ml: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Subtotal:</Typography>
            <Typography>{currencySymbol}{(grandTotal + discount).toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography>Discount:</Typography>
            <TextField 
                type="number" 
                variant="standard" 
                size="small" 
                sx={{ width: '100px', input: { textAlign: 'right' } }}
                InputProps={{
                    startAdornment: <InputAdornment position="start">-{currencySymbol}</InputAdornment>,
                }}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
            />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Grand Total:</Typography>
            <Typography variant="h6">{currencySymbol}{grandTotal.toFixed(2)}</Typography>
        </Box>
        
        {/* Internal Metrics - Only for Admin */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed grey' }}>
            <Typography variant="caption" color="text.secondary" display="block">INTERNAL USE ONLY</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="error">Total Cost:</Typography>
                <Typography variant="body2" color="error">{currencySymbol}{totalCost.toFixed(2)}</Typography>
            </Box>
             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="success.main">Est. Profit:</Typography>
                <Typography variant="body2" color="success.main">{currencySymbol}{(grandTotal - totalCost).toFixed(2)}</Typography>
            </Box>
             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="success.main">Margin:</Typography>
                <Typography variant="body2" color="success.main">
                    {grandTotal > 0 ? (((grandTotal - totalCost) / grandTotal) * 100).toFixed(1) : 0}%
                </Typography>
            </Box>
        </Box>
      </Paper>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="text" onClick={() => router.back()}>Cancel</Button>
        <Button variant="contained" color="primary" size="large" onClick={handleSave}>Save Quote</Button>
      </Box>
    </Box>
  );
}
