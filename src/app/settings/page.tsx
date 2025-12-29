'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');

  const handleSave = () => {
    // For now, just log the values. In the future, this will save to localStorage
    // or a configuration file and trigger the data source switch.
    console.log({ supabaseUrl, supabaseAnonKey });
    alert('Settings saved (logged to console for now)!');
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Paper elevation={3} sx={{ p: 4, mt: 3, maxWidth: '600px' }}>
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
          required
        />
        <TextField
          fullWidth
          label="Supabase Anon Key"
          value={supabaseAnonKey}
          onChange={(e) => setSupabaseAnonKey(e.target.value)}
          margin="normal"
          type="password" // Hide the key by default
          required
        />
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
        >
          Save Settings
        </Button>
      </Paper>
    </Box>
  );
}
