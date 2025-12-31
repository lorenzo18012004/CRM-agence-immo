import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Appointment } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/appointments');
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    CONFIRMED: 'success',
    SCHEDULED: 'info',
    COMPLETED: 'default',
    CANCELLED: 'error',
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Rendez-vous</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          Nouveau rendez-vous
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Bien</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Aucun rendez-vous
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.title}</TableCell>
                  <TableCell>
                    {format(new Date(appointment.startDate), 'PPpp', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {appointment.client
                      ? `${appointment.client.firstName} ${appointment.client.lastName}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {appointment.property?.title || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={statusColors[appointment.status] || 'default'}
                      size="small"
                    />
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

