import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings
} from '@mui/icons-material';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Welcome back, {user?.first_name}! 👋
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {stats && (
        <Grid container spacing={3}>
          {/* Income Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography color="inherit" gutterBottom>
                      Monthly Income
                    </Typography>
                    <Typography variant="h5">
                      ₹{stats.monthlyIncome?.toLocaleString('en-IN') || 0}
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Expenses Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography color="inherit" gutterBottom>
                      Monthly Expenses
                    </Typography>
                    <Typography variant="h5">
                      ₹{stats.monthlyExpenses?.toLocaleString('en-IN') || 0}
                    </Typography>
                  </Box>
                  <TrendingDown sx={{ fontSize: 40, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Remaining Budget Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography color="inherit" gutterBottom>
                      Remaining Budget
                    </Typography>
                    <Typography variant="h5">
                      ₹{stats.remaining?.toLocaleString('en-IN') || 0}
                    </Typography>
                  </Box>
                  <AccountBalance sx={{ fontSize: 40, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Savings Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography color="inherit" gutterBottom>
                      This Month Savings
                    </Typography>
                    <Typography variant="h5">
                      ₹{stats.savings?.toLocaleString('en-IN') || 0}
                    </Typography>
                  </Box>
                  <Savings sx={{ fontSize: 40, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Subscriptions
                </Typography>
                <Typography variant="h5">
                  {stats.activeSubscriptions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Money Lent
                </Typography>
                <Typography variant="h5">
                  ₹{stats.outstandingLent?.toLocaleString('en-IN') || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Money Borrowed
                </Typography>
                <Typography variant="h5">
                  ₹{stats.outstandingBorrowed?.toLocaleString('en-IN') || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Investments
                </Typography>
                <Typography variant="h5">
                  ₹{stats.totalInvestments?.toLocaleString('en-IN') || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;