import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Contract } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/contracts');
      setContracts(response.data.contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    ACTIVE: 'success',
    DRAFT: 'warning',
    COMPLETED: 'info',
    CANCELLED: 'error',
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Contrats</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/contracts/new')}
        >
          Nouveau contrat
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Bien</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Date début</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucun contrat
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.contractNumber}</TableCell>
                  <TableCell>{contract.type === 'SALE' ? 'Vente' : 'Location'}</TableCell>
                  <TableCell>
                    {contract.property?.title || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {contract.client?.firstName} {contract.client?.lastName}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(contract.price)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={contract.status}
                      color={statusColors[contract.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/contracts/${contract.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

