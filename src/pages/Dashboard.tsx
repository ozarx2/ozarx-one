import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import JobApplicants from '../components/JobApplicants';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  applications: Application[];
  createdAt: string;
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: string;
  };
  status: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicantsDialogOpen, setApplicantsDialogOpen] = useState(false);
  
  // New state for CRUD operations
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    description: '',
    requirements: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (user.role === 'employer') {
      fetchEmployerJobs();
    } else {
      fetchCandidateApplications();
      fetchAvailableJobs();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchEmployerJobs = async () => {
    try {
      const res = await axios.get('/api/jobs/employer');
      setJobs(res.data.jobs);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching jobs');
      setLoading(false);
      showSnackbar('Error fetching jobs', 'error');
    }
  };

  const fetchAvailableJobs = async () => {
    try {
      const res = await axios.get('/api/jobs');
      setAvailableJobs(res.data.jobs);
    } catch (err: any) {
      console.error('Error fetching available jobs:', err);
    }
  };

  const fetchCandidateApplications = async () => {
    try {
      const res = await axios.get('/api/applications');
      setApplications(res.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching applications');
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (user?.role === 'employer') {
      fetchEmployerJobs(); // Re-fetch jobs when tab changes for employer
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'closed':
        return 'error';
      case 'pending':
        return 'warning';
      case 'reviewed':
        return 'info';
      case 'shortlisted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'accepted':
        return 'success';
      default:
        return 'default';
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'primary';
      case 'part-time':
        return 'secondary';
      case 'contract':
        return 'info';
      case 'internship':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleViewApplicants = (jobId: string) => {
    setSelectedJobId(jobId);
    setApplicantsDialogOpen(true);
  };

  const handleCloseApplicantsDialog = () => {
    setApplicantsDialogOpen(false);
    setSelectedJobId(null);
  };

  const handleEditClick = (job: Job) => {
    setSelectedJob(job);
    setEditForm({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
      salaryMin: job.salary?.min?.toString() || '',
      salaryMax: job.salary?.max?.toString() || '',
      currency: job.salary?.currency || 'USD',
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (job: Job) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedJob) return;

      // Validate salary fields
      const salaryMin = editForm.salaryMin ? parseInt(editForm.salaryMin) : undefined;
      const salaryMax = editForm.salaryMax ? parseInt(editForm.salaryMax) : undefined;

      if (salaryMin && salaryMax && salaryMin > salaryMax) {
        showSnackbar('Minimum salary cannot be greater than maximum salary', 'error');
        return;
      }

      const updatedJob = {
        title: editForm.title.trim(),
        company: editForm.company.trim(),
        location: editForm.location.trim(),
        type: editForm.type.toLowerCase(),
        description: editForm.description.trim(),
        requirements: editForm.requirements
          .split('\n')
          .map(r => r.trim())
          .filter(r => r.length > 0),
        salary: {
          min: salaryMin,
          max: salaryMax,
          currency: editForm.currency,
        },
      };

      console.log('Sending update request:', {
        jobId: selectedJob._id,
        data: updatedJob
      });

      const response = await axios.put(`/api/jobs/${selectedJob._id}`, updatedJob);
      
      if (response.data.job) {
        showSnackbar('Job updated successfully', 'success');
        setEditDialogOpen(false);
        fetchEmployerJobs();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Error updating job:', err);
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = err.response.data.message || 
          (err.response.data.errors && err.response.data.errors.join(', ')) ||
          'Error updating job';
        showSnackbar(errorMessage, 'error');
      } else if (err.request) {
        // The request was made but no response was received
        showSnackbar('No response from server. Please try again.', 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        showSnackbar(err.message || 'Error updating job', 'error');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedJob) return;

      await axios.delete(`/api/jobs/${selectedJob._id}`);
      showSnackbar('Job deleted successfully', 'success');
      setDeleteDialogOpen(false);
      fetchEmployerJobs();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error deleting job', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 56,
                    height: 56,
                    mr: 2,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Welcome back, {user?.name}!
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Manage your {user?.role === 'employer' ? 'job listings' : 'applications'} here
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {user?.role === 'employer' ? (
            <>
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ mr: 1 }} />
                      Your Job Listings
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/post-job')}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                      }}
                    >
                      Post New Job
                    </Button>
                  </Box>
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 500,
                      },
                    }}
                  >
                    <Tab label="Active Jobs" />
                    <Tab label="Closed Jobs" />
                  </Tabs>
                  <Box sx={{ mt: 3 }}>
                    {jobs
                      .filter((job) => (activeTab === 0 ? job.status === 'active' : job.status === 'closed'))
                      .map((job) => (
                        <Card
                          key={job._id}
                          sx={{
                            mb: 2,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            },
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={8}>
                                <Typography variant="h6" gutterBottom>
                                  {job.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <BusinessIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                                  <Typography variant="subtitle1" color="textSecondary">
                                    {job.company}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <LocationIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                                  <Typography variant="body2" color="textSecondary">
                                    {job.location}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  <Chip
                                    icon={<WorkIcon />}
                                    label={job.type}
                                    color={getJobTypeColor(job.type) as any}
                                    size="small"
                                    sx={{ borderRadius: 1 }}
                                  />
                                  <Chip
                                    label={job.status}
                                    color={getStatusColor(job.status) as any}
                                    size="small"
                                    sx={{ borderRadius: 1 }}
                                  />
                                  {job.salary && (
                                    <Chip
                                      icon={<MoneyIcon />}
                                      label={`${job.salary.currency} ${job.salary.min}-${job.salary.max}`}
                                      size="small"
                                      sx={{ borderRadius: 1 }}
                                    />
                                  )}
                                </Box>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                  <Tooltip title="Edit Job">
                                    <IconButton
                                      color="primary"
                                      onClick={() => handleEditClick(job)}
                                      sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': {
                                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                                        },
                                      }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Job">
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDeleteClick(job)}
                                      sx={{
                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                        '&:hover': {
                                          bgcolor: alpha(theme.palette.error.main, 0.2),
                                        },
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Button
                                    variant="outlined"
                                    startIcon={<PeopleIcon />}
                                    onClick={() => handleViewApplicants(job._id)}
                                    sx={{
                                      borderRadius: 2,
                                      textTransform: 'none',
                                    }}
                                  >
                                    View Applicants ({job.applications.length})
                                  </Button>
                                </Box>
                              </Grid>
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="textSecondary">
                                Posted {new Date(job.createdAt).toLocaleDateString()}
                              </Typography>
                              <Button
                                variant="text"
                                onClick={() => navigate(`/jobs/${job._id}`)}
                                sx={{ textTransform: 'none' }}
                              >
                                View Details
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                  </Box>
                </Paper>
              </Grid>

              {/* Edit Job Dialog */}
              <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                  },
                }}
              >
                <DialogTitle sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Edit Job</Typography>
                    <IconButton
                      aria-label="close"
                      onClick={() => setEditDialogOpen(false)}
                      sx={{
                        color: theme.palette.grey[500],
                        '&:hover': {
                          color: theme.palette.grey[700],
                        },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Job Title"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          value={editForm.company}
                          onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Location"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          select
                          label="Job Type"
                          value={editForm.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          required
                        >
                          <MenuItem value="full-time">Full Time</MenuItem>
                          <MenuItem value="part-time">Part Time</MenuItem>
                          <MenuItem value="contract">Contract</MenuItem>
                          <MenuItem value="internship">Internship</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          select
                          label="Currency"
                          value={editForm.currency}
                          onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                        >
                          <MenuItem value="USD">USD</MenuItem>
                          <MenuItem value="EUR">EUR</MenuItem>
                          <MenuItem value="GBP">GBP</MenuItem>
                          <MenuItem value="INR">INR</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Minimum Salary"
                          type="number"
                          value={editForm.salaryMin}
                          onChange={(e) => setEditForm({ ...editForm, salaryMin: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Maximum Salary"
                          type="number"
                          value={editForm.salaryMax}
                          onChange={(e) => setEditForm({ ...editForm, salaryMax: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Job Description"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Requirements (one per line)"
                          value={editForm.requirements}
                          onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
                          required
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                  <Button
                    onClick={() => setEditDialogOpen(false)}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditSubmit}
                    variant="contained"
                    color="primary"
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                    }}
                  >
                    Save Changes
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Delete Confirmation Dialog */}
              <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                  },
                }}
              >
                <DialogTitle>Delete Job</DialogTitle>
                <DialogContent>
                  <Typography>
                    Are you sure you want to delete this job? This action cannot be undone.
                  </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                  <Button
                    onClick={() => setDeleteDialogOpen(false)}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    color="error"
                    variant="contained"
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                    }}
                  >
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Job Applicants Dialog */}
              {selectedJobId && (
                <JobApplicants
                  jobId={selectedJobId}
                  open={applicantsDialogOpen}
                  onClose={handleCloseApplicantsDialog}
                />
              )}

              {/* Snackbar for notifications */}
              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                <Alert
                  onClose={handleCloseSnackbar}
                  severity={snackbar.severity}
                  sx={{
                    borderRadius: 2,
                    boxShadow: theme.shadows[3],
                  }}
                >
                  {snackbar.message}
                </Alert>
              </Snackbar>
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Your Applications
                  </Typography>
                  {applications.length === 0 ? (
                    <Typography color="textSecondary">You haven't applied to any jobs yet.</Typography>
                  ) : (
                    applications.map((application) => (
                      <Card key={application._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                              <Typography variant="h6">{application.job.title}</Typography>
                              <Typography variant="subtitle1" color="textSecondary">
                                {application.job.company}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={application.status}
                                  color={getStatusColor(application.status) as any}
                                  size="small"
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <Button
                                variant="outlined"
                                onClick={() => navigate(`/jobs/${application.job._id}`)}
                              >
                                View Job
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Available Jobs
                  </Typography>
                  {availableJobs.length === 0 ? (
                    <Typography color="textSecondary">No jobs available at the moment.</Typography>
                  ) : (
                    availableJobs.map((job) => (
                      <Card key={job._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                              <Typography variant="h6">{job.title}</Typography>
                              <Typography variant="subtitle1" color="textSecondary">
                                {job.company} • {job.location}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={job.type}
                                  color="primary"
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                {job.salary && (
                                  <Chip
                                    label={`${job.salary.currency} ${job.salary.min}-${job.salary.max}`}
                                    color="secondary"
                                    size="small"
                                  />
                                )}
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/jobs/${job._id}`)}
                              >
                                Apply Now
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 