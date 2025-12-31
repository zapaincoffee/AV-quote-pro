'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

import RestaurantIcon from '@mui/icons-material/Restaurant';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  hourlyRate: number;
  dietaryRestrictions?: string;
}

export default function CrewPage() {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [newMember, setNewMember] = useState({ name: '', role: '', phone: '', email: '', hourlyRate: 0, dietaryRestrictions: '' });

  useEffect(() => {
    fetch('/api/crew').then(res => res.json()).then(setCrew);
  }, []);

  const handleAdd = async () => {
    if (!newMember.name) return;
    const res = await fetch('/api/crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
    });
    const item = await res.json();
    setCrew([...crew, item]);
    setNewMember({ name: '', role: '', phone: '', email: '', hourlyRate: 0, dietaryRestrictions: '' });
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>Crew Database</Typography>
      
      <Paper sx={{ p: 3, mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField label="Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} size="small" />
        <TextField label="Role" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} size="small" placeholder="Sound, Light..." />
        <TextField label="Phone" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} size="small" />
        <TextField label="Email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} size="small" />
        <TextField label="Rate/Hr" type="number" value={newMember.hourlyRate} onChange={e => setNewMember({...newMember, hourlyRate: Number(e.target.value)})} size="small" sx={{ width: 100 }} />
        <TextField label="Dietary (Veg...)" value={newMember.dietaryRestrictions} onChange={e => setNewMember({...newMember, dietaryRestrictions: e.target.value})} size="small" />
        <Button variant="contained" onClick={handleAdd}>Add Crew</Button>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Diet</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {crew.map((member) => (
                    <TableRow key={member.id}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {member.phone && <IconButton size="small" href={`tel:${member.phone}`}><PhoneIcon fontSize="inherit" /></IconButton>}
                                {member.email && <IconButton size="small" href={`mailto:${member.email}`}><EmailIcon fontSize="inherit" /></IconButton>}
                            </Box>
                        </TableCell>
                        <TableCell>
                            {member.dietaryRestrictions && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                    <RestaurantIcon fontSize="small" />
                                    <Typography variant="caption">{member.dietaryRestrictions}</Typography>
                                </Box>
                            )}
                        </TableCell>
                        <TableCell align="right">{member.hourlyRate}</TableCell>
                        <TableCell><IconButton disabled><DeleteIcon /></IconButton></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
