import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Paper,
  InputLabel,
  Alert,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Apply: React.FC = () => {
  const theme = useTheme();
  const query = useQuery();
  const jobId = query.get('jobId');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (jobId) {
      // First check if user has already applied
      axios.get('/api/applications')
        .then(res => {
          const hasAppliedToJob = res.data.some((app: any) => app.job._id === jobId);
          setHasApplied(hasAppliedToJob);
          
          // Then fetch job details
          return axios.get(`/api/jobs/${jobId}`);
        })
        .then(res => {
          setJob(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError('Job not found');
          setLoading(false);
        });
    } else {
      setError('No job selected');
      setLoading(false);
    }
  }, [jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
        setError('Please upload a PDF or Word document');
        return;
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      setForm({ ...form, resume: file });
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      setError('Please enter a valid phone number');
      setSubmitting(false);
      return;
    }

    if (!form.resume) {
      setError('Please upload your resume');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('job', jobId || '');
      formData.append('coverLetter', form.coverLetter);
      formData.append('resume', form.resume);
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);

      await axios.post('/api/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Application submitted successfully!');
      setTimeout(() => navigate('/applications'), 2000);
    } catch (err: any) {
      console.error('Application submission error:', err);
      if (err.response?.status === 403) {
        setError('Employers cannot apply for jobs. Please use a candidate account to apply.');
      } else {
        setError(
          err.response?.data?.msg || 
          err.response?.data?.message || 
          'Failed to submit application. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (hasApplied) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            boxShadow: theme.shadows[2],
          }}
        >
          <Alert severity="info" sx={{ mb: 2 }}>
            You have already applied for this position.
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/jobs')} 
            fullWidth
            sx={{ mt: 2 }}
          >
            Back to Jobs
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          boxShadow: theme.shadows[2],
        }}
      >
        <Typography variant="h4" gutterBottom>
          Apply for {job?.title}
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="textSecondary">
          {job?.company} - {job?.location}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            variant="outlined"
            placeholder="+1 (555) 555-5555"
            helperText="Enter your phone number with country code (e.g., +1 for US)"
          />
          <TextField
            label="Cover Letter"
            name="coverLetter"
            value={form.coverLetter}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            margin="normal"
            required
            variant="outlined"
          />
          <Box mt={2} mb={2}>
            <InputLabel>Resume (PDF, DOC, DOCX)</InputLabel>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '8px',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
              }}
            />
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            disabled={submitting}
            sx={{ mt: 2 }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit Application'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Apply; 