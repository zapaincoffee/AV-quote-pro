'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/navigation';

export default function AddEquipmentPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, dailyPrice: parseFloat(dailyPrice), quantity: parseInt(quantity, 10) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Equipment added:', result);
      alert('Equipment added successfully!');
      router.push('/equipment'); // Navigate back to equipment list
    } catch (error) {
      console.error('Failed to add equipment:', error);
      alert('Failed to add equipment.');
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" component="h1" gutterBottom>
        Add New Equipment
      </Typography>
      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Equipment Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Daily Price"
            value={dailyPrice}
            onChange={(e) => setDailyPrice(e.target.value)}
            margin="normal"
            type="number"
            inputProps={{ step: "0.01" }}
            required
          />
          <TextField
            fullWidth
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            margin="normal"
            type="number"
            inputProps={{ min: "1" }}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Add Equipment
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
