'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';

interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  dailyPrice: number;
  status?: string;
}

export default function PriceListPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const response = await fetch('/api/equipment');
        if (response.ok) {
          const data = await response.json();
          setEquipment(data);
        }
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEquipment();
  }, []);

  const filteredEquipment = equipment.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Price List (Ceník)
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Current rental prices synced from shelf.nu inventory.
      </Typography>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
            fullWidth
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Daily Price</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredEquipment.map((item) => (
                        <TableRow key={item.id} hover>
                            <TableCell>{item.name}</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                {item.description || '-'}
                            </TableCell>
                            <TableCell>
                                {item.status && <Chip label={item.status} size="small" variant="outlined" />}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {item.dailyPrice > 0 ? `${item.dailyPrice.toFixed(2)}` : 'On Request'}
                            </TableCell>
                        </TableRow>
                    ))}
                    {filteredEquipment.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                No items found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
      )}
    </Box>
  );
}
