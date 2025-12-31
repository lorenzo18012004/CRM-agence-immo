import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { Client } from '../types';

const clientTypeLabels: Record<string, string> = {
  BUYER: 'Acheteur',
  SELLER: 'Vendeur',
  TENANT: 'Locataire',
  LANDLORD: 'Propriétaire',
  PROSPECT: 'Prospect',
};

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await axios.get(`/clients/${id}`);
      setClient(response.data);
    } catch (error) {
      console.error('Error fetching client:', error);
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

  if (!client) {
    return <Typography>Client non trouvé</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/clients')}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {client.firstName} {client.lastName}
            </Typography>
            <Chip
              label={clientTypeLabels[client.clientType]}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Informations de contact
            </Typography>
            {client.email && (
              <Typography><strong>Email:</strong> {client.email}</Typography>
            )}
            <Typography><strong>Téléphone:</strong> {client.phone}</Typography>
            {client.address && (
              <Typography><strong>Adresse:</strong> {client.address}</Typography>
            )}
            {client.city && (
              <Typography><strong>Ville:</strong> {client.city} {client.postalCode}</Typography>
            )}
          </Grid>

          {client.notes && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Typography>{client.notes}</Typography>
            </Grid>
          )}

          {client.properties && client.properties.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Biens ({client.properties.length})
              </Typography>
              {client.properties.map((property) => (
                <Paper key={property.id} sx={{ p: 2, mb: 1 }}>
                  <Typography variant="subtitle1">{property.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {property.address}, {property.city}
                  </Typography>
                </Paper>
              ))}
            </Grid>
          )}

          {client.contracts && client.contracts.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contrats ({client.contracts.length})
              </Typography>
              {client.contracts.map((contract) => (
                <Paper key={contract.id} sx={{ p: 2, mb: 1 }}>
                  <Typography variant="subtitle1">
                    Contrat {contract.contractNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {contract.type === 'SALE' ? 'Vente' : 'Location'} - {contract.status}
                  </Typography>
                </Paper>
              ))}
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
}

