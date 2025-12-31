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
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Property } from '../types';

const propertyTypes = [
  { value: '', label: 'Tous' },
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'LAND', label: 'Terrain' },
  { value: 'COMMERCIAL', label: 'Local commercial' },
  { value: 'OFFICE', label: 'Bureau' },
];

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  AVAILABLE: 'success',
  SOLD: 'error',
  RENTED: 'info',
  PENDING: 'warning',
  WITHDRAWN: 'default',
};

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Disponible',
  SOLD: 'Vendu',
  RENTED: 'Loué',
  PENDING: 'En attente',
  WITHDRAWN: 'Retiré',
};

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    city: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.city) params.append('city', filters.city);

      const response = await axios.get(`/properties?${params.toString()}`);
      setProperties(response.data.properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Biens immobiliers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/properties/new')}
        >
          Ajouter un bien
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Rechercher"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                label="Type"
              >
                {propertyTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Statut"
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="AVAILABLE">Disponible</MenuItem>
                <MenuItem value="SOLD">Vendu</MenuItem>
                <MenuItem value="RENTED">Loué</MenuItem>
                <MenuItem value="PENDING">En attente</MenuItem>
                <MenuItem value="WITHDRAWN">Retiré</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Ville"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Référence</TableCell>
              <TableCell>Titre</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Surface</TableCell>
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
            ) : properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucun bien trouvé
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.reference}</TableCell>
                  <TableCell>{property.title}</TableCell>
                  <TableCell>{propertyTypes.find((t) => t.value === property.type)?.label}</TableCell>
                  <TableCell>
                    {property.address}, {property.city}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(property.price)}
                  </TableCell>
                  <TableCell>{property.surface} m²</TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[property.status]}
                      color={statusColors[property.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/properties/${property.id}`)}
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

