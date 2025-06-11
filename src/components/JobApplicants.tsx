import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Applicant {
  _id: string;
  candidate: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  coverLetter: string;
  resume: string;
  createdAt: string;
  updatedAt: string;
}

interface JobApplicantsProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
}

const JobApplicants: React.FC<JobApplicantsProps> = ({ jobId, open, onClose }) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (open && jobId) {
      fetchApplicants();
    }
  }, [open, jobId]);

  const fetchApplicants = async () => {
    try {
      console.log('Fetching applicants for job:', jobId);
      const res = await axios.get(`/api/applications/job/${jobId}`);
      console.log('Fetched applicants:', res.data);
      setApplicants(res.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching applicants:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || 'Error fetching applicants');
      setLoading(false);
      showSnackbar('Error fetching applicants', 'error');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, applicant: Applicant) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedApplicant(applicant);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedApplicant(null);
  };

  const handleStatusChange = async (applicationId: string, newStatus: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted') => {
    try {
      const res = await axios.patch(`/api/applications/${applicationId}`, { 
        status: newStatus 
      });

      if (res.data) {
        setApplicants(prevApplicants => 
          prevApplicants.map(app => 
            app._id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );
        showSnackbar(`Application ${newStatus} successfully`, 'success');
        handleMenuClose();
      }
    } catch (err: any) {
      console.error('Error updating application status:', err);
      setError(err.response?.data?.message || 'Error updating application status');
      showSnackbar('Error updating application status', 'error');
    }
  };

  const handleDownloadResume = async (resumePath: string) => {
    try {
      const fullUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${resumePath}`;
      window.open(fullUrl, '_blank');
    } catch (err) {
      console.error('Error downloading resume:', err);
      showSnackbar('Error downloading resume', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'reviewed':
        return 'info';
      case 'shortlisted':
        return 'primary';
      case 'rejected':
        return 'error';
      case 'accepted':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ScheduleIcon fontSize="small" />;
      case 'reviewed':
        return <DescriptionIcon fontSize="small" />;
      case 'shortlisted':
        return <CheckCircleIcon fontSize="small" />;
      case 'rejected':
        return <CancelIcon fontSize="small" />;
      case 'accepted':
        return <CheckCircleIcon fontSize="small" />;
      default:
        return <ScheduleIcon fontSize="small" />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Job Applicants</Typography>
          <Chip 
            label={`${applicants.length} Applicants`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : applicants.length === 0 ? (
          <Typography variant="body1" color="textSecondary" align="center">
            No applicants yet
          </Typography>
        ) : (
          <List>
            {applicants.map((applicant) => (
              <Card key={applicant._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6">
                          {applicant.candidate.name}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(applicant.status)}
                          label={applicant.status}
                          color={getStatusColor(applicant.status)}
                          size="small"
                        />
                      </Box>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="textSecondary">
                            {applicant.candidate.email}
                          </Typography>
                        </Box>
                        {applicant.candidate.phone && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="textSecondary">
                              {applicant.candidate.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} mb={2}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          Applied on {formatDate(applicant.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Cover Letter:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        backgroundColor: 'grey.50', 
                        p: 1, 
                        borderRadius: 1,
                        maxHeight: '100px',
                        overflow: 'auto'
                      }}>
                        {applicant.coverLetter}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box display="flex" justifyContent="flex-end" gap={1}>
                        <Tooltip title="Download Resume">
                          <IconButton
                            onClick={() => handleDownloadResume(applicant.resume)}
                            color="primary"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, applicant)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedApplicant && handleStatusChange(selectedApplicant._id, 'reviewed')}>
          <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Reviewed
        </MenuItem>
        <MenuItem onClick={() => selectedApplicant && handleStatusChange(selectedApplicant._id, 'shortlisted')}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
          Shortlist
        </MenuItem>
        <MenuItem onClick={() => selectedApplicant && handleStatusChange(selectedApplicant._id, 'rejected')}>
          <CancelIcon fontSize="small" sx={{ mr: 1 }} />
          Reject
        </MenuItem>
      </Menu>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default JobApplicants; 