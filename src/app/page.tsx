'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Link from 'next/link';
import MailIcon from '@mui/icons-material/Mail';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    incomingCount: 0,
    draftQuotes: 0,
    upcomingJobs: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadsRes, quotesRes] = await Promise.all([
            fetch('/api/leads'),
            fetch('/api/quotes')
        ]);

        const leads = await leadsRes.json();
        const quotes = await quotesRes.json();

        const incoming = Array.isArray(leads) ? leads.filter((l: any) => l.status === 'New').length : 0;
        const drafts = Array.isArray(quotes) ? quotes.filter((q: any) => !q.status || q.status === 'Draft').length : 0;
        
        const today = new Date().toISOString().split('T')[0];
        const jobs = Array.isArray(quotes) 
            ? quotes
                .filter((q: any) => q.status === 'Approved' && q.startDate >= today)
                .sort((a: any, b: any) => a.startDate.localeCompare(b.startDate))
                .slice(0, 5)
            : [];

        setStats({ incomingCount: incoming, draftQuotes: drafts, upcomingJobs: jobs });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Action Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {/* Incoming */}
        <Grid size={{ xs: 12, md: 4 }}>
            <Paper 
                sx={{ 
                    p: 3, 
                    bgcolor: stats.incomingCount > 0 ? '#ffebee' : 'white', // Red tint if attention needed
                    border: stats.incomingCount > 0 ? 1 : 0,
                    borderColor: 'error.main'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MailIcon color={stats.incomingCount > 0 ? 'error' : 'action'} sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                        <Typography variant="h4">{stats.incomingCount}</Typography>
                        <Typography variant="body2" color="text.secondary">New Inquiries</Typography>
                    </Box>
                </Box>
                <Button 
                    variant="contained" 
                    color={stats.incomingCount > 0 ? 'error' : 'primary'} 
                    fullWidth 
                    component={Link} 
                    href="/incoming"
                >
                    Process Inbox
                </Button>
            </Paper>
        </Grid>

        {/* Drafts */}
        <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                        <Typography variant="h4">{stats.draftQuotes}</Typography>
                        <Typography variant="body2" color="text.secondary">Draft Quotes</Typography>
                    </Box>
                </Box>
                <Button variant="outlined" fullWidth component={Link} href="/quotes">
                    Manage Quotes
                </Button>
            </Paper>
        </Grid>

        {/* Quick Action */}
        <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Button 
                    variant="contained" 
                    size="large" 
                    startIcon={<AddIcon />} 
                    component={Link} 
                    href="/quotes/new"
                    sx={{ mb: 2 }}
                >
                    Create New Quote
                </Button>
                <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />} 
                    component={Link} 
                    href="/incoming"
                >
                    Record New Lead
                </Button>
            </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Jobs */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Upcoming Jobs
      </Typography>
      {stats.upcomingJobs.length === 0 ? (
          <Typography color="text.secondary">No upcoming approved jobs.</Typography>
      ) : (
          <Paper>
              {stats.upcomingJobs.map((job) => (
                  <Box 
                    key={job.id} 
                    sx={{ 
                        p: 2, 
                        borderBottom: 1, 
                        borderColor: 'divider', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                      <Box>
                          <Typography variant="subtitle1" fontWeight="bold">{job.eventName}</Typography>
                          <Typography variant="body2" color="text.secondary">{job.clientName} — {job.startDate}</Typography>
                      </Box>
                      <Button component={Link} href={`/quotes/${job.id}`} size="small">
                          View
                      </Button>
                  </Box>
              ))}
          </Paper>
      )}
    </Box>
  );
}