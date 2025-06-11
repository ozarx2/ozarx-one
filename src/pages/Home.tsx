import React from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Import images
import heroImage from '../assets/hero-illustration.svg';
import feature1Image from '../assets/feature-1.svg';
import feature2Image from '../assets/feature-2.svg';
import feature3Image from '../assets/feature-3.svg';
import feature4Image from '../assets/feature-4.svg';
import statsImage from '../assets/stats-illustration.svg';
import ctaImage from '../assets/cta-illustration.svg';

const features = [
  {
    title: 'Find Your Dream Job',
    description: 'Search through thousands of job listings and find the perfect match for your skills and aspirations.',
    image: feature1Image,
  },
  {
    title: 'Company Profiles',
    description: 'Explore detailed company profiles to learn about culture, benefits, and growth opportunities.',
    image: feature2Image,
  },
  {
    title: 'Easy Applications',
    description: 'Apply to jobs with just a few clicks. Save your resume and cover letter for quick applications.',
    image: feature3Image,
  },
  {
    title: 'Job Alerts',
    description: 'Get notified about new job opportunities that match your preferences and career goals.',
    image: feature4Image,
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.primary.main} 90%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" gutterBottom>
                Find Your Dream Job Today
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Connect with top employers and take the next step in your career journey.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/jobs')}
                sx={{ mr: 2 }}
              >
                Browse Jobs
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={heroImage}
                alt="Job Search"
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography variant="h2" align="center" gutterBottom>
          Why Choose Us
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" sx={{ mb: 8 }}>
          We provide everything you need to find your next career opportunity
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box
                  component="img"
                  src={feature.image}
                  alt={feature.title}
                  sx={{
                    width: '100%',
                    maxWidth: 200,
                    height: 'auto',
                    mb: 3,
                  }}
                />
                <Typography variant="h5" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="textSecondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'background.default', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={statsImage}
                alt="Statistics"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                Join Our Growing Community
              </Typography>
              <Grid container spacing={4} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h3" color="primary" gutterBottom>
                    10K+
                  </Typography>
                  <Typography variant="h6">Active Jobs</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h3" color="primary" gutterBottom>
                    5K+
                  </Typography>
                  <Typography variant="h6">Companies</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h3" color="primary" gutterBottom>
                    50K+
                  </Typography>
                  <Typography variant="h6">Job Seekers</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.secondary.light} 30%, ${theme.palette.secondary.main} 90%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                Ready to Start Your Journey?
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Create your account today and take the first step towards your dream career.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={ctaImage}
                alt="Get Started"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 