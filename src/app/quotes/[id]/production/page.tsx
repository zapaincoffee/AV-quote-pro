'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Autocomplete from '@mui/material/Autocomplete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
  notes: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
}

interface Venue {
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
  wifiSsid: string;
  wifiPass: string;
  parkingInfo: string;
  loadInInfo: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

interface Vehicle {
  id: string;
  type: string;
  plate: string;
  driverName: string;
  driverPhone: string;
}

interface Quote {
  id: string;
  eventName: string;
  clientName: string;
  startDate: string;
  schedule?: ScheduleItem[];
  attachments?: Attachment[];
  venue?: Venue;
  contacts?: Contact[];
  vehicles?: Vehicle[];
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProductionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [saving, setSaving] = useState(false);

  // Local state for editing
  const [venue, setVenue] = useState<Venue>({ name: '', address: '', contactName: '', contactPhone: '', wifiSsid: '', wifiPass: '', parkingInfo: '', loadInInfo: '' });
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [crewList, setCrewList] = useState<Contact[]>([]);

  useEffect(() => {
    fetchQuote();
    fetchCrew();
  }, [id]);

  const fetchCrew = async () => {
      const res = await fetch('/api/crew');
      if (res.ok) setCrewList(await res.json());
  };

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/quotes/${id}`);
      if (res.ok) {
          const data = await res.json();
          setQuote(data);
          if (data.venue) setVenue(data.venue);
          if (data.schedule) setSchedule(data.schedule);
          if (data.attachments) setAttachments(data.attachments);
          if (data.contacts) setContacts(data.contacts);
          if (data.vehicles) setVehicles(data.vehicles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!quote) return;
    setSaving(true);
    const updatedQuote = {
        ...quote,
        venue,
        schedule,
        attachments,
        contacts,
        vehicles
    };
    
    try {
        await fetch(`/api/quotes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedQuote)
        });
        alert('Production details saved!');
    } catch (e) {
        alert('Failed to save.');
    } finally {
        setSaving(false);
    }
  };

  const addScheduleItem = () => {
      setSchedule([...schedule, { id: Date.now().toString(), time: '00:00', activity: '', notes: '' }]);
  };

  const updateScheduleItem = (id: string, field: keyof ScheduleItem, value: string) => {
      setSchedule(schedule.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeScheduleItem = (id: string) => {
      setSchedule(schedule.filter(item => item.id !== id));
  };

  const addAttachment = () => {
      const name = prompt('Document Name (e.g. Stage Plot):');
      const url = prompt('URL (Google Drive/Dropbox link):');
      if (name && url) {
          setAttachments([...attachments, { id: Date.now().toString(), name, url }]);
      }
  };

  const addContact = (crewMember?: Contact) => {
      if (crewMember) {
          setContacts([...contacts, { ...crewMember, id: Date.now().toString() }]);
      } else {
          const name = prompt('Name:');
          if (!name) return;
          const role = prompt('Role (e.g. Client, Driver):');
          const phone = prompt('Phone:');
          const email = prompt('Email:');
          setContacts([...contacts, { id: Date.now().toString(), name: name || '', role: role || '', phone: phone || '', email: email || '' }]);
      }
  };

  const addVehicle = () => {
      const type = prompt('Vehicle Type (e.g. Van, Truck):');
      if (!type) return;
      setVehicles([...vehicles, { 
          id: Date.now().toString(), 
          type, 
          plate: prompt('License Plate:') || '', 
          driverName: prompt('Driver Name:') || '', 
          driverPhone: prompt('Driver Phone:') || '' 
      }]);
  };

  const exportOntime = () => {
      const ontimeData = schedule.map(s => ({
          time: s.time,
          title: s.activity,
          subtitle: s.notes,
          type: "cue"
      }));
      const blob = new Blob([JSON.stringify(ontimeData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ontime-${quote?.eventName}.json`;
      a.click();
  };

  if (loading) return <Box sx={{ p: 10, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (!quote) return <Typography sx={{ p: 4 }}>Quote not found</Typography>;

  return (
    <Box sx={{ my: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => router.back()} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
            <Box>
                <Typography variant="h5" component="h1" fontWeight="bold">
                    Production: {quote.eventName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {quote.startDate} • {quote.clientName}
                </Typography>
            </Box>
        </Box>
        <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleSave}
            disabled={saving}
        >
            {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered variant="scrollable">
          <Tab label="Venue & Logistics" />
          <Tab label="Contacts" />
          <Tab label="Schedule" />
          <Tab label="Truck Pack" />
          <Tab label="Documents" />
        </Tabs>
      </Box>

      {/* VENUE TAB (Index 0) */}
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>Venue Details</Typography>
                <Button startIcon={<WbSunnyIcon />} onClick={() => alert('Weather forecast feature coming soon! (Integration with Open-Meteo)')}>Check Weather</Button>
            </Box>
            
            <TextField fullWidth label="Venue Name" value={venue.name} onChange={e => setVenue({...venue, name: e.target.value})} margin="normal" />
            <TextField fullWidth label="Address" value={venue.address} onChange={e => setVenue({...venue, address: e.target.value})} margin="normal" />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField fullWidth label="Contact Name" value={venue.contactName} onChange={e => setVenue({...venue, contactName: e.target.value})} />
                <TextField fullWidth label="Contact Phone" value={venue.contactPhone} onChange={e => setVenue({...venue, contactPhone: e.target.value})} />
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Access & Network</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField fullWidth label="WiFi SSID" value={venue.wifiSsid} onChange={e => setVenue({...venue, wifiSsid: e.target.value})} />
                <TextField fullWidth label="WiFi Password" value={venue.wifiPass} onChange={e => setVenue({...venue, wifiPass: e.target.value})} />
            </Box>
            <TextField fullWidth label="Load-in / Parking Info" multiline rows={3} value={venue.loadInInfo} onChange={e => setVenue({...venue, loadInInfo: e.target.value})} margin="normal" />
        </Paper>
      </TabPanel>

      {/* CONTACTS TAB (Index 1) */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, gap: 2 }}>
            <Button variant="outlined" startIcon={<PersonAddIcon />} onClick={() => addContact()}>Add Manually</Button>
            <Autocomplete
                options={crewList}
                getOptionLabel={(option) => `${option.name} (${option.role})`}
                sx={{ width: 300 }}
                onChange={(e, val) => val && addContact(val)}
                renderInput={(params) => <TextField {...params} label="Add from Crew Database" size="small" />}
            />
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {contacts.map((contact) => (
                <Paper key={contact.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{contact.name}</Typography>
                        <Typography variant="caption" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', px: 1, borderRadius: 1 }}>{contact.role}</Typography>
                        <Box sx={{ mt: 1 }}>
                            {contact.phone && (
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 0.5 }}>
                                    <CallIcon fontSize="inherit" sx={{ mr: 1 }} />
                                    <Typography variant="body2" component="a" href={`tel:${contact.phone}`} sx={{ color: 'inherit', textDecoration: 'none' }}>{contact.phone}</Typography>
                                </Box>
                            )}
                            {contact.email && (
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                    <EmailIcon fontSize="inherit" sx={{ mr: 1 }} />
                                    <Typography variant="body2" component="a" href={`mailto:${contact.email}`} sx={{ color: 'inherit', textDecoration: 'none' }}>{contact.email}</Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    <IconButton color="error" onClick={() => setContacts(contacts.filter(c => c.id !== contact.id))}>
                        <DeleteIcon />
                    </IconButton>
                </Paper>
            ))}
            {contacts.length === 0 && (
                <Typography align="center" color="text.secondary" sx={{ py: 4, gridColumn: '1 / -1' }}>No contacts added yet.</Typography>
            )}
        </Box>
      </TabPanel>

      {/* SCHEDULE TAB (Index 2) */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button startIcon={<DownloadIcon />} onClick={exportOntime} sx={{ mr: 2 }}>Export for Ontime</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={addScheduleItem}>Add Event</Button>
        </Box>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: 120 }}>Time</TableCell>
                        <TableCell>Activity / Cue</TableCell>
                        <TableCell>Notes / Tech</TableCell>
                        <TableCell sx={{ width: 50 }}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {schedule
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <TextField 
                                    type="time" 
                                    size="small" 
                                    value={item.time} 
                                    onChange={e => updateScheduleItem(item.id, 'time', e.target.value)} 
                                />
                            </TableCell>
                            <TableCell>
                                <TextField 
                                    fullWidth 
                                    size="small" 
                                    placeholder="e.g. Load In"
                                    value={item.activity} 
                                    onChange={e => updateScheduleItem(item.id, 'activity', e.target.value)} 
                                />
                            </TableCell>
                            <TableCell>
                                <TextField 
                                    fullWidth 
                                    size="small" 
                                    placeholder="Notes"
                                    value={item.notes} 
                                    onChange={e => updateScheduleItem(item.id, 'notes', e.target.value)} 
                                />
                            </TableCell>
                            <TableCell>
                                <IconButton color="error" onClick={() => removeScheduleItem(item.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {schedule.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                No schedule items yet. Add one to start the Run of Show.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
      </TabPanel>

      {/* LOGISTICS TAB (Index 3) */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<LocalShippingIcon />} onClick={addVehicle}>Add Vehicle</Button>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {vehicles.map((v) => (
                <Paper key={v.id} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocalShippingIcon /> {v.type}
                            </Typography>
                            <Typography variant="h4" sx={{ my: 1, fontFamily: 'monospace' }}>{v.plate}</Typography>
                            <Typography color="text.secondary">Driver: {v.driverName} ({v.driverPhone})</Typography>
                        </Box>
                        <IconButton color="error" onClick={() => setVehicles(vehicles.filter(x => x.id !== v.id))}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Paper>
            ))}
            {vehicles.length === 0 && (
                <Typography align="center" color="text.secondary" sx={{ py: 4, gridColumn: '1 / -1' }}>No vehicles assigned.</Typography>
            )}
        </Box>
      </TabPanel>

      {/* DOCUMENTS TAB (Index 4) */}
      <TabPanel value={tabValue} index={4}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={addAttachment}>Add Link</Button>
        </Box>
        <Paper sx={{ p: 0 }}>
            {attachments.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    No documents linked. Add links to Stage Plots, Riders, etc.
                </Box>
            ) : (
                attachments.map((doc, index) => (
                    <Box key={doc.id}>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle1">{doc.name}</Typography>
                                <Typography variant="body2" component="a" href={doc.url} target="_blank" color="primary" sx={{ textDecoration: 'none' }}>
                                    {doc.url}
                                </Typography>
                            </Box>
                            <IconButton color="error" onClick={() => setAttachments(attachments.filter(a => a.id !== doc.id))}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                        {index < attachments.length - 1 && <Divider />}
                    </Box>
                ))
            )}
        </Paper>
      </TabPanel>
    </Box>
  );
}
