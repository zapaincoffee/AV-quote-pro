'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { useRouter } from 'next/navigation';

interface Lead {
  id: string;
  source: string;
  content: string;
  status: 'New' | 'Processed' | 'Archived';
  createdAt: string;
}

export default function IncomingPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [newContent, setNewContent] = useState('');
  const [source, setSource] = useState('Email');

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    const res = await fetch('/api/leads');
    if (res.ok) setLeads(await res.json());
  }

  const handleAddLead = async () => {
    if (!newContent) return;
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent, source, status: 'New' })
    });
    setNewContent('');
    fetchLeads();
  };

  const handleProcess = async (id: string) => {
    await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Processed' })
    });
    fetchLeads();
    router.push('/quotes/new');
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Incoming Inbox
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Paste raw inquiries from emails, phone calls, or WhatsApp here to keep track of them.
      </Typography>

      {/* Input Area */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button 
                variant={source === 'Email' ? 'contained' : 'outlined'} 
                onClick={() => setSource('Email')}
                size="small"
            >Email</Button>
            <Button 
                variant={source === 'Phone' ? 'contained' : 'outlined'} 
                onClick={() => setSource('Phone')}
                size="small"
            >Phone</Button>
             <Button 
                variant={source === 'Other' ? 'contained' : 'outlined'} 
                onClick={() => setSource('Other')}
                size="small"
            >Other</Button>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Paste the inquiry details here..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          sx={{ mb: 2, bgcolor: 'white' }}
        />
        <Button 
            variant="contained" 
            startIcon={<ContentPasteIcon />} 
            onClick={handleAddLead}
            disabled={!newContent}
        >
            Add to Inbox
        </Button>
      </Paper>

      {/* List */}
      <Typography variant="h6" gutterBottom>Pending Inquiries ({leads.filter(l => l.status === 'New').length})</Typography>
      <List>
        {leads.map((lead) => (
          <Paper key={lead.id} sx={{ mb: 2, opacity: lead.status === 'Processed' ? 0.6 : 1 }}>
            <ListItem
                secondaryAction={
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// ... inside the component ...

  const handleAIConvert = async (lead: Lead) => {
    // 1. Call AI
    const res = await fetch('/api/copilot/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: lead.content })
    });
    
    if (res.ok) {
        const aiData = await res.json();
        // 2. Save to local storage for the New Quote page to pick up
        localStorage.setItem('aiDraftQuote', JSON.stringify(aiData));
        
        // 3. Mark processed
        await fetch('/api/leads', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: lead.id, status: 'Processed' })
        });
        
        // 4. Redirect
        router.push('/quotes/new?source=ai');
    } else {
        alert('AI Analysis failed. Try manual conversion.');
    }
  };

  // ... in the list item actions ...
                    lead.status === 'New' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                variant="outlined" 
                                size="small"
                                startIcon={<AutoAwesomeIcon />}
                                onClick={() => handleAIConvert(lead)}
                            >
                                AI Convert
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                size="small"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => handleProcess(lead.id)}
                            >
                                Manual
                            </Button>
                        </Box>
                    )
                }
            >
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                            <Chip label={lead.source} size="small" color={lead.source === 'Email' ? 'info' : 'warning'} />
                            <Typography variant="caption" color="text.secondary">
                                {new Date(lead.createdAt).toLocaleString()}
                            </Typography>
                            {lead.status === 'Processed' && <Chip label="Processed" size="small" color="success" variant="outlined" />}
                        </Box>
                    }
                    secondary={
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lead.content}
                        </Typography>
                    }
                />
            </ListItem>
          </Paper>
        ))}
        {leads.length === 0 && (
            <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>Inbox is empty. Good job!</Typography>
        )}
      </List>
    </Box>
  );
}
