import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
  };
  status: 'pending' | 'shortlisted' | 'rejected';
  coverLetter: string;
  resume: string;
  createdAt: string;
}

const Applications: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get('/api/applications');
      setApplications(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again later.');
      setLoading(false);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleDownloadResume = async (resumePath: string) => {
    try {
      const fullPath = `${process.env.REACT_APP_API_URL || ''}${resumePath}`;
      window.open(fullPath, '_blank');
    } catch (err) {
      console.error('Error downloading resume:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return <CheckCircleIcon />;
      case 'rejected':
        return <CancelIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading your applications...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Your Applications
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Track the status of your job applications and manage your career journey
          </Typography>
        </Paper>

        {/* Applications List */}
        {!loading && !error && (!applications || applications.length === 0) ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'white',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No applications yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Start your job search and apply to positions that match your skills and interests
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/jobs')}
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 1,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Browse Jobs
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {applications?.map((application) => (
              <Grid item xs={12} key={application._id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 2 }}>
                          {application.job.title}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(application.status)}
                          label={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          color={getStatusColor(application.status)}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                          <Typography variant="body1" color="text.secondary">
                            {application.job.company}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                          <Typography variant="body1" color="text.secondary">
                            {application.job.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WorkIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                          <Typography variant="body1" color="text.secondary">
                            {application.job.type}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MoneyIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                          <Typography variant="body1" color="text.secondary">
                            {formatSalary(
                              application.job.salary.min,
                              application.job.salary.max,
                              application.job.salary.currency
                            )}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Applied on {formatDate(application.createdAt)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                        <Tooltip title="View Application">
                          <IconButton
                            onClick={() => handleViewApplication(application)}
                            sx={{ color: theme.palette.primary.main }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Resume">
                          <IconButton
                            onClick={() => handleDownloadResume(application.resume)}
                            sx={{ color: theme.palette.primary.main }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* View Application Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedApplication && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">{selectedApplication.job.title}</Typography>
                <Chip
                  icon={getStatusIcon(selectedApplication.status)}
                  label={selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  color={getStatusColor(selectedApplication.status)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Cover Letter
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedApplication.coverLetter}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Application Details
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Company"
                        secondary={selectedApplication.job.company}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Location"
                        secondary={selectedApplication.job.location}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WorkIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Job Type"
                        secondary={selectedApplication.job.type}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MoneyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Salary"
                        secondary={formatSalary(
                          selectedApplication.job.salary.min,
                          selectedApplication.job.salary.max,
                          selectedApplication.job.salary.currency
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Applied On"
                        secondary={formatDate(selectedApplication.createdAt)}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => handleDownloadResume(selectedApplication.resume)}
                startIcon={<DownloadIcon />}
              >
                Download Resume
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Applications; 