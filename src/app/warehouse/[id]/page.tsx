'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';

interface QuoteItem {
  id: string;
  name: string;
  quantity: number;
  packed?: boolean;
  note?: string;
  isExternal?: boolean;
  supplier?: string;
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
  startDate: string;
  status: string;
  sections: QuoteSection[];
}

export default function WarehousePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/quotes/${id}`);
      if (res.ok) setQuote(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePack = async (sectionId: string, itemId: string, currentStatus: boolean) => {
    if (!quote) return;

    // Optimistic update
    const updatedSections = quote.sections.map(section => {
        if (section.id === sectionId) {
            return {
                ...section,
                items: section.items.map(item => 
                    item.id === itemId ? { ...item, packed: !currentStatus } : item
                )
            };
        }
        return section;
    });

    const updatedQuote = { ...quote, sections: updatedSections };
    setQuote(updatedQuote);

    // Persist
    await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuote)
    });
  };

  if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (!quote) return <Typography sx={{ p: 4 }}>Quote not found</Typography>;

  const totalItems = quote.sections.reduce((acc, s) => acc + s.items.length, 0);
  const packedItems = quote.sections.reduce((acc, s) => acc + s.items.filter(i => i.packed).length, 0);
  const progress = Math.round((packedItems / totalItems) * 100) || 0;

  return (
    <Box sx={{ my: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 2 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
        <Box>
            <Typography variant="h5" component="h1" fontWeight="bold">
                {quote.eventName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {quote.clientName} • {quote.startDate}
            </Typography>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ px: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" fontWeight="bold">Packing Progress</Typography>
            <Typography variant="caption">{packedItems}/{totalItems} items</Typography>
        </Box>
        <Box sx={{ height: 10, bgcolor: 'grey.300', borderRadius: 5, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: progress === 100 ? 'success.main' : 'primary.main', transition: 'width 0.3s' }} />
        </Box>
      </Box>

      {/* Sections */}
      {quote.sections.map((section) => (
        <Paper key={section.id} sx={{ mb: 2, mx: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold">{section.name}</Typography>
            </Box>
            <List disablePadding>
                {section.items.map((item) => (
                    <div key={item.id}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleTogglePack(section.id, item.id, item.packed || false)}>
                                <ListItemIcon>
                                    <Checkbox 
                                        edge="start" 
                                        checked={item.packed || false} 
                                        tabIndex={-1} 
                                        disableRipple 
                                    />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography 
                                                fontWeight="medium" 
                                                sx={{ textDecoration: item.packed ? 'line-through' : 'none', color: item.packed ? 'text.disabled' : 'text.primary' }}
                                            >
                                                {item.name}
                                            </Typography>
                                            <Chip label={`${item.quantity}x`} size="small" sx={{ ml: 1, fontWeight: 'bold' }} />
                                        </Box>
                                    }
                                    secondary={
                                        item.isExternal ? 
                                        <Typography variant="caption" color="warning.main">Sub-rental: {item.supplier}</Typography> : 
                                        item.note
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                        <Divider />
                    </div>
                ))}
            </List>
        </Paper>
      ))}
      
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <Button variant="contained" size="large" onClick={() => window.print()}>
            Print Pull Sheet
        </Button>
      </Box>
    </Box>
  );
}
