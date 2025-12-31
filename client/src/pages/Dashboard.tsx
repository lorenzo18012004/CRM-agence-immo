import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DashboardStats {
  properties: {
    total: number;
    available: number;
    sold: number;
  };
  contracts: {
    total: number;
    active: number;
  };
  clients: {
    total: number;
  };
  appointments: {
    total: number;
    upcoming: number;
  };
  recentProperties: any[];
  upcomingAppointments: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/agency/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Biens disponibles',
      value: stats.properties.available,
      total: stats.properties.total,
      icon: <HomeIcon />,
      color: '#1976d2',
    },
    {
      title: 'Contrats actifs',
      value: stats.contracts.active,
      total: stats.contracts.total,
      icon: <DescriptionIcon />,
      color: '#2e7d32',
    },
    {
      title: 'Clients',
      value: stats.clients.total,
      icon: <PeopleIcon />,
      color: '#ed6c02',
    },
    {
      title: 'Rendez-vous à venir',
      value: stats.appointments.upcoming,
      total: stats.appointments.total,
      icon: <CalendarIcon />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4">{card.value}</Typography>
                    {card.total && (
                      <Typography variant="body2" color="textSecondary">
                        sur {card.total} total
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ color: card.color, fontSize: 40 }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Biens récents
            </Typography>
            {stats.recentProperties.length === 0 ? (
              <Typography color="textSecondary">Aucun bien récent</Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {stats.recentProperties.map((property) => (
                  <Box
                    key={property.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1">{property.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {property.address}, {property.city}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(property.price)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Rendez-vous à venir
            </Typography>
            {stats.upcomingAppointments.length === 0 ? (
              <Typography color="textSecondary">Aucun rendez-vous à venir</Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {stats.upcomingAppointments.map((appointment) => (
                  <Box
                    key={appointment.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1">{appointment.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {format(new Date(appointment.startDate), 'PPpp', { locale: fr })}
                    </Typography>
                    {appointment.client && (
                      <Typography variant="body2">
                        Client: {appointment.client.firstName} {appointment.client.lastName}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

