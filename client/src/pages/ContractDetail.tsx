import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { Contract } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchContract();
    }
  }, [id]);

  const fetchContract = async () => {
    try {
      const response = await axios.get(`/contracts/${id}`);
      setContract(response.data);
    } catch (error) {
      console.error('Error fetching contract:', error);
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

  if (!contract) {
    return <Typography>Contrat non trouvé</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/contracts')}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Contrat {contract.contractNumber}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Informations générales
          </Typography>
          <Typography><strong>Type:</strong> {contract.type === 'SALE' ? 'Vente' : 'Location'}</Typography>
          <Typography><strong>Prix:</strong> {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
          }).format(contract.price)}</Typography>
          <Typography><strong>Date début:</strong> {format(new Date(contract.startDate), 'PP', { locale: fr })}</Typography>
          {contract.endDate && (
            <Typography><strong>Date fin:</strong> {format(new Date(contract.endDate), 'PP', { locale: fr })}</Typography>
          )}
          <Typography><strong>Statut:</strong> {contract.status}</Typography>
        </Box>

        {contract.property && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bien immobilier
            </Typography>
            <Typography>{contract.property.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {contract.property.address}, {contract.property.city}
            </Typography>
          </Box>
        )}

        {contract.client && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Client
            </Typography>
            <Typography>
              {contract.client.firstName} {contract.client.lastName}
            </Typography>
            {contract.client.email && (
              <Typography variant="body2">{contract.client.email}</Typography>
            )}
            {contract.client.phone && (
              <Typography variant="body2">{contract.client.phone}</Typography>
            )}
          </Box>
        )}

        {contract.notes && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notes
            </Typography>
            <Typography>{contract.notes}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

