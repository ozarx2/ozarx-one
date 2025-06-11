import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  experience: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  socialLinks: {
    linkedin?: string;
    github?: string;
  };
  resume?: string;
}

const Profile: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    experience: [],
    education: [],
    socialLinks: {},
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/users/profile');
      console.log('Profile API Response:', response.data);
      setProfileData(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reset to original data
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/users/profile', profileData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              display: 'flex', 
              alignItems: 'center',
              gap: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
              color: 'white',
            }}
          >
            <Avatar
              sx={{ 
                width: 100, 
                height: 100,
                border: '4px solid white',
              }}
              src="/static/images/avatar/2.jpg"
            />
            <Box flex={1}>
              <Typography variant="h4" gutterBottom>
                {profileData.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                {user.role === 'employer' ? 'Employer' : 'Job Seeker'}
              </Typography>
              <Box display="flex" gap={2} mt={1}>
                <Chip 
                  icon={<LocationIcon />} 
                  label={profileData.location || 'Add location'} 
                  variant="outlined"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                />
                <Chip 
                  icon={<WorkIcon />} 
                  label={profileData.experience.length} 
                  variant="outlined"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                />
              </Box>
            </Box>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ 
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Box>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{ mr: 1, backgroundColor: 'white', color: theme.palette.primary.main }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Profile Content */}
        <Grid item xs={12}>
          <Paper>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Profile" />
              <Tab label="Experience" />
              <Tab label="Education" />
              <Tab label="Settings" />
            </Tabs>

            {/* Profile Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    About
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      sx={{ mb: 3 }}
                    />
                  ) : (
                    <Typography variant="body1" paragraph>
                      {profileData.bio || 'No bio added yet.'}
                    </Typography>
                  )}

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Contact Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={profileData.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Phone" 
                        secondary={
                          isEditing ? (
                            <TextField
                              fullWidth
                              value={profileData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="Add phone number"
                            />
                          ) : (
                            profileData.phone || 'Add phone number'
                          )
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Location" 
                        secondary={
                          isEditing ? (
                            <TextField
                              fullWidth
                              value={profileData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              placeholder="Add location"
                            />
                          ) : (
                            profileData.location || 'Add location'
                          )
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Skills
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={profileData.skills.join(', ')}
                        onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()))}
                        placeholder="Add skills (comma-separated)"
                        sx={{ mb: 2 }}
                      />
                    ) : (
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {profileData.skills.length > 0 ? (
                          profileData.skills.map((skill, index) => (
                            <Chip key={index} label={skill} />
                          ))
                        ) : (
                          <Typography color="textSecondary">
                            No skills added yet
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>
                      Social Links
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <LinkedInIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="LinkedIn" 
                          secondary={
                            isEditing ? (
                              <TextField
                                fullWidth
                                value={profileData.socialLinks.linkedin || ''}
                                onChange={(e) => handleInputChange('socialLinks', {
                                  ...profileData.socialLinks,
                                  linkedin: e.target.value
                                })}
                                placeholder="Add LinkedIn profile"
                              />
                            ) : (
                              profileData.socialLinks.linkedin || 'Add LinkedIn profile'
                            )
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <GitHubIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="GitHub" 
                          secondary={
                            isEditing ? (
                              <TextField
                                fullWidth
                                value={profileData.socialLinks.github || ''}
                                onChange={(e) => handleInputChange('socialLinks', {
                                  ...profileData.socialLinks,
                                  github: e.target.value
                                })}
                                placeholder="Add GitHub profile"
                              />
                            ) : (
                              profileData.socialLinks.github || 'Add GitHub profile'
                            )
                          }
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Experience Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Work Experience
              </Typography>
              {profileData.experience.length > 0 ? (
                <List>
                  {profileData.experience.map((exp, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <WorkIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={exp.position}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {exp.company}
                            </Typography>
                            {` — ${exp.duration}`}
                            <Typography variant="body2" color="text.secondary">
                              {exp.description}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">
                  No experience added yet
                </Typography>
              )}
            </TabPanel>

            {/* Education Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Education
              </Typography>
              {profileData.education.length > 0 ? (
                <List>
                  {profileData.education.map((edu, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <SchoolIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={edu.degree}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {edu.institution}
                            </Typography>
                            {` — ${edu.year}`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">
                  No education added yet
                </Typography>
              )}
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Resume" 
                    secondary={profileData.resume || 'No resume uploaded'}
                  />
                  <Button
                    variant="outlined"
                    component="label"
                  >
                    Upload Resume
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle file upload
                          console.log('File selected:', file);
                        }
                      }}
                    />
                  </Button>
                </ListItem>
              </List>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 