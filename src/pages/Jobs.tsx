import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  FilterList as FilterIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { debounce } from 'lodash';
import { useAuth } from '../contexts/AuthContext';
import LinkedInJobs from '../components/LinkedInJobs';

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
  isSaved?: boolean;
}

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    salary: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Debounced search function
  const debouncedFetchJobs = useCallback(
    debounce(async (query: string, filterValues: any, pageNum: number) => {
      try {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        if (filterValues.type) params.append('type', filterValues.type);
        if (filterValues.location) params.append('location', filterValues.location);
        if (filterValues.salary) params.append('salary', filterValues.salary);
        params.append('page', pageNum.toString());
        params.append('limit', '10');

        const res = await axios.get(`/api/jobs?${params.toString()}`);
        if (pageNum === 1) {
          setJobs(res.data.jobs);
        } else {
          setJobs(prev => [...prev, ...res.data.jobs]);
        }
        setHasMore(res.data.jobs.length === 10);
        setLoading(false);
        setLoadingMore(false);
        setError('');
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to fetch jobs. Please try again later.');
        setLoading(false);
        setLoadingMore(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
    }
    setLoading(true);
    debouncedFetchJobs(search || '', filters, 1);
  }, [location.search, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    debouncedFetchJobs(searchQuery, filters, 1);
  };

  const handleFilterChange = (field: string) => (event: any) => {
    setFilters({ ...filters, [field]: event.target.value });
    setPage(1);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
      debouncedFetchJobs(searchQuery, filters, page + 1);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      await axios.post(`/api/jobs/${jobId}/save`);
      setJobs(jobs.map(job => 
        job._id === jobId ? { ...job, isSaved: !job.isSaved } : job
      ));
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleApplyNow = (jobId: string) => {
    if (!isAuthenticated) {
      navigate('/register');
    } else {
      navigate(`/apply?jobId=${jobId}`);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading && jobs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
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
        {/* Search and Filter Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Find Your Perfect Job
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 3, opacity: 0.9 }}>
            Search through thousands of job listings and take the next step in your career
          </Typography>
          
          <form onSubmit={handleSearch}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search jobs by title, company, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'transparent' },
                      '&:hover fieldset': { borderColor: 'transparent' },
                      '&.Mui-focused fieldset': { borderColor: 'transparent' },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  sx={{
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.9),
                    },
                    py: 1.5,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  Search Jobs
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setShowFilters(!showFilters)}
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
                    fontSize: '1rem',
                  }}
                  startIcon={<FilterIcon />}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </Grid>
            </Grid>
          </form>

          {showFilters && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ borderColor: alpha('#fff', 0.2), mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth 
                    variant="outlined"
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'white',
                        '&.Mui-focused': {
                          color: 'white'
                        }
                      },
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        '& fieldset': {
                          borderColor: 'transparent'
                        },
                        '&:hover fieldset': {
                          borderColor: 'transparent'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'transparent'
                        }
                      },
                      '& .MuiSelect-select': {
                        padding: '14px 14px',
                        minHeight: '1.4375em',
                        textAlign: 'left'
                      }
                    }}
                  >
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      value={filters.type}
                      onChange={handleFilterChange('type')}
                      label="Job Type"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300
                          }
                        }
                      }}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="full-time">Full-time</MenuItem>
                      <MenuItem value="part-time">Part-time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="internship">Internship</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth 
                    variant="outlined"
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'white',
                        '&.Mui-focused': {
                          color: 'white'
                        }
                      },
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        '& fieldset': {
                          borderColor: 'transparent'
                        },
                        '&:hover fieldset': {
                          borderColor: 'transparent'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'transparent'
                        }
                      },
                      '& .MuiSelect-select': {
                        padding: '14px 14px',
                        minHeight: '1.4375em',
                        textAlign: 'left'
                      }
                    }}
                  >
                    <InputLabel>Location</InputLabel>
                    <Select
                      value={filters.location}
                      onChange={handleFilterChange('location')}
                      label="Location"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300
                          }
                        }
                      }}
                    >
                      <MenuItem value="">All Locations</MenuItem>
                      <MenuItem value="Remote">Remote</MenuItem>
                      <MenuItem value="On-site">On-site</MenuItem>
                      <MenuItem value="Hybrid">Hybrid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth 
                    variant="outlined"
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'white',
                        '&.Mui-focused': {
                          color: 'white'
                        }
                      },
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        '& fieldset': {
                          borderColor: 'transparent'
                        },
                        '&:hover fieldset': {
                          borderColor: 'transparent'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'transparent'
                        }
                      },
                      '& .MuiSelect-select': {
                        padding: '14px 14px',
                        minHeight: '1.4375em',
                        textAlign: 'left'
                      }
                    }}
                  >
                    <InputLabel>Salary Range</InputLabel>
                    <Select
                      value={filters.salary}
                      onChange={handleFilterChange('salary')}
                      label="Salary Range"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300
                          }
                        }
                      }}
                    >
                      <MenuItem value="">All Salaries</MenuItem>
                      <MenuItem value="0-50000">$0 - $50,000</MenuItem>
                      <MenuItem value="50000-100000">$50,000 - $100,000</MenuItem>
                      <MenuItem value="100000-150000">$100,000 - $150,000</MenuItem>
                      <MenuItem value="150000+">$150,000+</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab label="All Jobs" />
            <Tab label="LinkedIn Jobs" />
          </Tabs>
        </Box>

        {/* Jobs List */}
        {activeTab === 0 ? (
          <>
            {error ? (
              <Typography color="error" align="center">
                {error}
              </Typography>
            ) : jobs.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: 'white',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No jobs found
                </Typography>
              </Paper>
            ) : (
              <>
                <Grid container spacing={3}>
                  {jobs.map((job) => (
                    <Grid item xs={12} key={job._id}>
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
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 2 }}>
                                  {job.title}
                                </Typography>
                                <Tooltip title={job.isSaved ? "Remove from saved" : "Save job"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleSaveJob(job._id)}
                                    sx={{ color: job.isSaved ? 'primary.main' : 'action.active' }}
                                  >
                                    {job.isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                  </IconButton>
                                </Tooltip>
                              </Box>
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
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <MoneyIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                                  <Typography variant="body1" color="text.secondary">
                                    {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                                  </Typography>
                                </Box>
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
                                  onClick={() => handleApplyNow(job._id)}
                                  sx={{
                                    py: 1.5,
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                  }}
                                >
                                  Apply Now
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {hasMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? <CircularProgress size={24} /> : 'Load More'}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </>
        ) : (
          <LinkedInJobs searchQuery={searchQuery} location={filters.location} />
        )}
      </Container>
    </Box>
  );
};

export default Jobs; 