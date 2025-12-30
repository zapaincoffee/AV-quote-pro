'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [termsOfService, setTermsOfService] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setTermsOfService(data.termsOfService || '');
          setPaymentTerms(data.paymentTerms || '');
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ termsOfService, paymentTerms })
        });
        
        // For Supabase, we keep the alert for now as it's separate logic
        console.log({ supabaseUrl, supabaseAnonKey });
        alert('Settings saved successfully!');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings.');
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mt: 3, maxWidth: '800px' }}>
        <Typography variant="h6" gutterBottom>
            Business Terms
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These terms will appear on your printed quotes and PDFs.
        </Typography>
        
        <TextField
            fullWidth
            label="Terms of Service"
            value={termsOfService}
            onChange={(e) => setTermsOfService(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            placeholder="e.g. Cancellation policy, liability..."
        />
         <TextField
            fullWidth
            label="Payment Terms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            margin="normal"
            multiline
            rows={3}
            placeholder="e.g. 50% deposit, Net 30..."
        />

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Supabase / shelf.nu Connection
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the details for your self-hosted shelf.nu instance running on Supabase.
        </Typography>
        <TextField
          fullWidth
          label="Supabase URL"
          value={supabaseUrl}
          onChange={(e) => setSupabaseUrl(e.target.value)}
          margin="normal"
          placeholder="https://<your-project-ref>.supabase.co"
        />
        <TextField
          fullWidth
          label="Supabase Anon Key"
          value={supabaseAnonKey}
          onChange={(e) => setSupabaseAnonKey(e.target.value)}
          margin="normal"
          type="password"
        />
        
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          size="large"
        >
          Save All Settings
        </Button>
      </Paper>
    </Box>
  );
}
