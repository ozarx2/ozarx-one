import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Upload as UploadIcon,
  Block as BlockIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Job {
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
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  isSaved?: boolean;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyError, setApplyError] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    } else {
      setError('Job ID is missing');
      setLoading(false);
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await axios.get(`/api/jobs/${id}`);
      const jobData = {
        ...res.data.job,
        requirements: res.data.job.requirements || [],
        responsibilities: res.data.job.responsibilities || [],
        benefits: res.data.job.benefits || [],
      };
      setJob(jobData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details. Please try again later.');
      setLoading(false);
    }
  };

  const handleSaveJob = async () => {
    if (!job) return;
    try {
      await axios.post(`/api/jobs/${job._id}/save`);
      setJob({ ...job, isSaved: !job.isSaved });
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
        setUploadError('Please upload a PDF or Word document');
        return;
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size should be less than 5MB');
        return;
      }
      setCvFile(file);
      setUploadError('');
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role === 'employer') {
      setApplyError('Employers cannot apply for jobs. Please use a candidate account to apply.');
      return;
    }
    setApplyDialogOpen(true);
  };

  const handleApply = async () => {
    if (!job) return;
    if (!cvFile) {
      setUploadError('Please upload your CV');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('job', job._id);
      formData.append('coverLetter', coverLetter);
      formData.append('resume', cvFile);

      await axios.post('/api/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setApplyDialogOpen(false);
      navigate('/applications');
    } catch (err: any) {
      console.error('Application submission error:', err);
      if (err.response?.status === 403) {
        setApplyError('Employers cannot apply for jobs. Please use a candidate account to apply.');
      } else {
        setApplyError(
          err.response?.data?.msg || 
          err.response?.data?.message || 
          'Failed to submit application. Please try again.'
        );
      }
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading job details...</Typography>
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">{error || 'Job not found'}</Typography>
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
        {/* Job Header */}
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
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mr: 2 }}>
                  {job.title}
                </Typography>
                <Tooltip title={job.isSaved ? "Remove from saved" : "Save job"}>
                  <IconButton
                    onClick={handleSaveJob}
                    sx={{ color: job.isSaved ? 'white' : alpha('#fff', 0.7) }}
                  >
                    {job.isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share job">
                  <IconButton
                    onClick={() => navigator.share({ title: job.title, text: job.description, url: window.location.href })}
                    sx={{ color: alpha('#fff', 0.7) }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">{job.company}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">{job.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WorkIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">{job.type}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MoneyIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {job.requirements.slice(0, 3).map((req, index) => (
                  <Chip
                    key={index}
                    label={req}
                    sx={{
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white',
                      '&:hover': {
                        bgcolor: alpha('#fff', 0.3),
                      },
                    }}
                  />
                ))}
                {job.requirements.length > 3 && (
                  <Chip
                    label={`+${job.requirements.length - 3} more`}
                    sx={{
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white',
                    }}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {isAuthenticated ? (
                    user?.role === 'candidate' ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleApplyClick}
                        startIcon={<CheckCircleIcon />}
                        sx={{ py: 1.5, px: 4, borderRadius: '25px' }}
                      >
                        Apply Now
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="error"
                        size="large"
                        disabled
                        startIcon={<BlockIcon />}
                        sx={{ py: 1.5, px: 4, borderRadius: '25px' }}
                      >
                        Employers Cannot Apply
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => navigate('/login')}
                      startIcon={<LoginIcon />}
                      sx={{ py: 1.5, px: 4, borderRadius: '25px' }}
                    >
                      Login to Apply
                    </Button>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => window.history.back()}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#fff', 0.1),
                    },
                    py: 1.5,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  Back to Jobs
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Job Details */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Job Description
              </Typography>
              <Typography variant="body1" paragraph>
                {job.description}
              </Typography>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
                Responsibilities
              </Typography>
              <List>
                {job.responsibilities.map((resp, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={resp} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
                Requirements
              </Typography>
              <List>
                {job.requirements.map((req, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={req} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
                Benefits
              </Typography>
              <List>
                {job.benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Job Overview
              </Typography>
              <List>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <BusinessIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Company"
                    secondary={job.company}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Location"
                    secondary={job.location}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <WorkIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Job Type"
                    secondary={job.type}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <MoneyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Salary"
                    secondary={formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Similar Jobs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No similar jobs found at the moment.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Apply Dialog */}
      <Dialog
        open={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Apply for {job?.title}</DialogTitle>
        <DialogContent>
          {applyError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {applyError}
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Cover Letter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            sx={{ mt: 2 }}
          />
          
          <Box sx={{ mt: 3 }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mb: 1 }}
            >
              Upload CV
            </Button>
            {cvFile && (
              <Typography variant="body2" color="text.secondary">
                Selected file: {cvFile.name}
              </Typography>
            )}
            {uploadError && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {uploadError}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Accepted formats: PDF, DOC, DOCX (max 5MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={!coverLetter.trim() || !cvFile}
          >
            Apply Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobDetails; 