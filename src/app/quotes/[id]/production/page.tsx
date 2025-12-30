'use client';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

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

// ... existing code ...

export default function ProductionPage() {
  // ... existing hooks ...
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [weather, setWeather] = useState<string>(''); // Simple text forecast for now

  // ... useEffect fetchQuote ...
          if (data.contacts) setContacts(data.contacts);
          if (data.vehicles) setVehicles(data.vehicles);
  // ...

  const handleSave = async () => {
    // ...
    const updatedQuote = {
        ...quote,
        venue,
        schedule,
        attachments,
        contacts,
        vehicles
    };
    // ...
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

  // ...

  return (
    <Box sx={{ my: 2, pb: 10 }}>
      {/* ... header ... */}

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
            {/* ... rest of venue fields ... */}
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

      {/* ... Contacts Tab (Index 1) ... */}
      <TabPanel value={tabValue} index={1}>
        {/* ... existing contacts code ... */}
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
        
        <Grid container spacing={2}>
            {contacts.map((contact) => (
                <Grid item xs={12} sm={6} md={4} key={contact.id}>
                    <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{contact.name}</Typography>
                            <Typography variant="caption" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', px: 1, borderRadius: 1 }}>{contact.role}</Typography>
                            
                            {/* Check if crew member has dietary info (need to fetch extra detail or store it in contact) */}
                            {/* For simplicity, we assume generic contact doesn't store diet yet, but we could add it */}
                            
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
                </Grid>
            ))}
            {contacts.length === 0 && (
                <Grid item xs={12}>
                    <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No contacts added yet.</Typography>
                </Grid>
            )}
        </Grid>
      </TabPanel>

      {/* Schedule Tab (Index 2) */}
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
        <Grid container spacing={2}>
            {vehicles.map((v) => (
                <Grid item xs={12} md={6} key={v.id}>
                    <Paper sx={{ p: 2 }}>
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
                </Grid>
            ))}
            {vehicles.length === 0 && (
                <Grid item xs={12}>
                    <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No vehicles assigned.</Typography>
                </Grid>
            )}
        </Grid>
      </TabPanel>

      {/* DOCUMENTS TAB (Index 4) */}
      <TabPanel value={tabValue} index={4}>

      {/* DOCUMENTS TAB */}
      <TabPanel value={tabValue} index={2}>
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
