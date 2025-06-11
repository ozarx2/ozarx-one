import React from 'react';
import { Box } from '@mui/material';

const HeroImage: React.FC = () => {
  return (
    <Box
      component="img"
      src="/images/hero-illustration.svg"
      alt="Job Search"
      sx={{
        width: '100%',
        maxWidth: 500,
        height: 'auto',
        display: { xs: 'none', md: 'block' },
      }}
    />
  );
};

export default HeroImage; 