import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Public as WebsiteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.dark',
        color: 'white',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'grey.700',
        mt: 'auto', // Push footer to the bottom
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Ozarx HR Solutions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'white' }}>
              First Floor, Global Tech Park, <br />
              Bengaluru, India 560025
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <PhoneIcon fontSize="small" /> +918157000553
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <EmailIcon fontSize="small" /> hr@ozarx.in
              </Typography>
              <Link
                href="http://www.ozarx.in"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, textDecoration: 'none' }}
              >
                <WebsiteIcon fontSize="small" />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  www.ozarx.in
                </Typography>
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none', color: 'white' }}>
              Home
            </Link>
            <Link href="/jobs" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none', color: 'white' }}>
              Jobs
            </Link>
            <Link href="/dashboard" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none', color: 'white' }}>
              Dashboard
            </Link>
            {/* Add more links as needed */}
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Follow Us
            </Typography>
            <Box>
              <IconButton href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" color="inherit">
                <FacebookIcon />
              </IconButton>
              <IconButton href="https://twitter.com/" target="_blank" rel="noopener noreferrer" color="inherit">
                <TwitterIcon />
              </IconButton>
              <IconButton href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" color="inherit">
                <LinkedInIcon />
              </IconButton>
              <IconButton href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" color="inherit">
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.600' }} />

        <Typography variant="body2" color="text.secondary" align="center" sx={{ color: 'white' }}>
          {'© '}
          {new Date().getFullYear()} Ozarx HR Solutions. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 