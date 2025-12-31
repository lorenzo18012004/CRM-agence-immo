import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { Property } from '../types';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
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

  if (!property) {
    return <Typography>Bien non trouvé</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/properties')}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {property.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Référence: {property.reference}
            </Typography>
          </Box>
          <Chip
            label={property.status}
            color={property.status === 'AVAILABLE' ? 'success' : 'default'}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {property.description || 'Aucune description'}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Caractéristiques
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1">{property.type}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Surface
                </Typography>
                <Typography variant="body1">{property.surface} m²</Typography>
              </Grid>
              {property.rooms && (
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Pièces
                  </Typography>
                  <Typography variant="body1">{property.rooms}</Typography>
                </Grid>
              )}
              {property.bedrooms && (
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Chambres
                  </Typography>
                  <Typography variant="body1">{property.bedrooms}</Typography>
                </Grid>
              )}
              {property.bathrooms && (
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Salles de bain
                  </Typography>
                  <Typography variant="body1">{property.bathrooms}</Typography>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h5" color="primary" gutterBottom>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(property.price)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {property.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {property.postalCode} {property.city}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

