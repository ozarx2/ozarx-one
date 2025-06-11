import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface LinkedInJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  applyUrl: string;
}

interface LinkedInJobsProps {
  searchQuery: string;
  location: string;
}

const LinkedInJobs: React.FC<LinkedInJobsProps> = ({ searchQuery, location }) => {
  const theme = useTheme();
  const [jobs, setJobs] = useState<LinkedInJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLinkedInJobs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append('keywords', searchQuery);
        if (location) params.append('location', location);

        const response = await axios.get(`/api/jobs/linkedin?${params.toString()}`);
        setJobs(response.data.jobs);
        setError('');
      } catch (err) {
        console.error('Error fetching LinkedIn jobs:', err);
        setError('Failed to fetch LinkedIn jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedInJobs();
  }, [searchQuery, location]);

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
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (jobs.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No LinkedIn jobs found matching your criteria.
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {jobs.map((job) => (
        <Grid item xs={12} key={job.id}>
          <Card
            sx={{
              borderRadius: 2,
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              },
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {job.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                      <Typography variant="body1" color="text.secondary">
                        {job.company}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                      <Typography variant="body1" color="text.secondary">
                        {job.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                      <Typography variant="body1" color="text.secondary">
                        {job.type}
                      </Typography>
                    </Box>
                    {job.salary && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MoneyIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                        <Typography variant="body1" color="text.secondary">
                          {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {job.description.substring(0, 200)}...
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <Chip
                        key={index}
                        label={req}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          },
                        }}
                      />
                    ))}
                    {job.requirements.length > 3 && (
                      <Chip
                        label={`+${job.requirements.length - 3} more`}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main,
                        }}
                      />
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        py: 1.5,
                        borderRadius: 1,
                        textTransform: 'none',
                        fontSize: '1rem',
                      }}
                    >
                      Apply on LinkedIn
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default LinkedInJobs; 