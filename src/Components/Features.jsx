import React from 'react';
import { Box, Typography, useTheme } from '@mui/material'; 

const Features = ({ icon, title, subtitle }) => {
  const theme = useTheme(); 
  
  // Clone the icon element and apply styles to make it white (contrastText)
  const styledIcon = React.cloneElement(icon, {
    sx: { 
      color: theme.palette.primary.contrastText, // Icon color uses contrast text (e.g., White)
      fontSize: 24 
    }
  });

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        mt: -1, 
      }}
    >
      
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: 48, 
          height: 48, 
          borderRadius: '50%', 
          bgcolor: theme.palette.primary.main, 
          mb: 1, 
          boxShadow: `0 2px 5px ${theme.palette.primary.main}4D`,
          mt: -5, 
        }}
      >
        {styledIcon}
      </Box>

      <Typography 
        variant="h6" 
        component="h3" 
        fontWeight="bold" 
        sx={{ color: theme.palette.text.primary, mt: 0 }}
      >
        {title}
      </Typography>

     
      <Typography 
        variant="body2" 
        sx={{ 
          color: theme.palette.text.primary, 
          mt: 0.5, 
          px: 1, 
          fontSize: '0.875rem', 
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Features;