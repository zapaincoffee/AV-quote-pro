'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  dailyPrice: number;
  quantity: number;
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const response = await fetch('/api/equipment');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: EquipmentItem[] = await response.json();
        setEquipment(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEquipment();
  }, []);

  if (loading) {
    return (
      <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error">Error loading equipment: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Equipment Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        href="/equipment/new"
        sx={{ mb: 3 }}
      >
        Add New Equipment
      </Button>
      <Typography variant="h6">Your Equipment List:</Typography>
      {equipment.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No equipment added yet.
        </Typography>
      ) : (
        <List>
          {equipment.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.name}
                secondary={`Price: $${item.dailyPrice.toFixed(2)}/day | Quantity: ${item.quantity} | Description: ${item.description}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
