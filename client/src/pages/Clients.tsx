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
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Client } from '../types';

const clientTypeLabels: Record<string, string> = {
  BUYER: 'Acheteur',
  SELLER: 'Vendeur',
  TENANT: 'Locataire',
  LANDLORD: 'Propriétaire',
  PROSPECT: 'Prospect',
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, [search]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = search ? `?search=${search}` : '';
      const response = await axios.get(`/clients${params}`);
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Clients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clients/new')}
        >
          Nouveau client
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Rechercher"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, email, téléphone..."
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Ville</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    {client.firstName} {client.lastName}
                  </TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={clientTypeLabels[client.clientType]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{client.city || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/clients/${client.id}`)}
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

