'use client';

import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

interface Equipment {
  id: string;
  name: string;
  dailyPrice: number;
  // Add other properties as needed
}

interface AddEquipmentDialogProps {
  open: boolean;
  onClose: (selectedItems: Equipment[]) => void;
}

export default function AddEquipmentDialog({ open, onClose }: AddEquipmentDialogProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      async function fetchEquipment() {
        setLoading(true);
        try {
          const response = await fetch('/api/equipment');
          const data = await response.json();
          setEquipment(data);
        } catch (error) {
          console.error("Failed to fetch equipment", error);
        } finally {
          setLoading(false);
        }
      }
      fetchEquipment();
    }
  }, [open]);

  const handleToggle = (value: string) => {
    const currentIndex = selected.indexOf(value);
    const newSelected = [...selected];

    if (currentIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelected(newSelected);
  };

  const handleAdd = () => {
    const selectedItems = equipment.filter(item => selected.includes(item.id));
    onClose(selectedItems);
    setSelected([]); // Reset selection
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={() => onClose([])} maxWidth="sm" fullWidth>
      <DialogTitle>Add Equipment to Section</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Search Equipment"
          type="text"
          fullWidth
          variant="standard"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {filteredEquipment.map((item) => (
              <ListItem
                key={item.id}
                secondaryAction={
                  <Checkbox
                    edge="end"
                    onChange={() => handleToggle(item.id)}
                    checked={selected.indexOf(item.id) !== -1}
                  />
                }
                disablePadding
              >
                <ListItemText primary={item.name} secondary={`$${item.dailyPrice}/day`} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose([])}>Cancel</Button>
        <Button onClick={handleAdd}>Add Selected</Button>
      </DialogActions>
    </Dialog>
  );
}
