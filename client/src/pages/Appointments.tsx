import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Chip,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Event as EventIcon,
  Schedule as TimeIcon,
  LocationOn as LocationIcon,
  CheckCircle as ConfirmIcon,
  Person as PersonIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Appointment {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  status: string;
  client?: { id: string; firstName: string; lastName: string };
  property?: { id: string; title: string; reference: string };
  type: 'VISIT' | 'SIGNING' | 'ESTIMATION' | 'MEETING';
}

const statusColors: Record<string, string> = {
  CONFIRMED: 'var(--success-color)',
  SCHEDULED: 'var(--primary)',
  COMPLETED: 'var(--text-tertiary)',
  CANCELLED: 'var(--danger-color)',
};

const typeColors: Record<string, string> = {
  VISIT: '#3b82f6', // Blue
  SIGNING: '#d97706', // Gold/Amber
  ESTIMATION: '#10b981', // Green
  MEETING: '#6366f1', // Indigo
};

const typeLabels: Record<string, string> = {
  VISIT: 'Visite',
  SIGNING: 'Signature',
  ESTIMATION: 'Estimation',
  MEETING: 'Réunion',
};

// --- MOCK DATA ---
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1', title: 'Visite Villa Cannes', startDate: '2024-03-20T14:00:00', endDate: '2024-03-20T15:00:00',
    location: '12 Avenue du Roi, Cannes', status: 'CONFIRMED', type: 'VISIT',
    client: { id: 'c1', firstName: 'Jean', lastName: 'Dupont' },
    property: { id: '1', title: 'Villa Contemporaine', reference: 'REF-001' }
  },
  {
    id: '2', title: 'Signature Compromis', startDate: '2024-03-22T10:00:00', endDate: '2024-03-22T11:30:00',
    location: 'Agence', status: 'SCHEDULED', type: 'SIGNING',
    client: { id: 'c2', firstName: 'Sophie', lastName: 'Martin' },
  },
  {
    id: '3', title: 'Estimation Studio', startDate: '2024-03-20T16:30:00', endDate: '2024-03-20T17:30:00',
    location: 'Nice Centre', status: 'COMPLETED', type: 'ESTIMATION',
    client: { id: 'c3', firstName: 'Marc', lastName: 'Weber' }
  }
];

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate Fetch
    setTimeout(() => {
      setAppointments(MOCK_APPOINTMENTS);
      setLoading(false);
    }, 800);
  }, []);

  // Group by Date for Timeline View (Simple grouping)
  const groupedAppointments = appointments.reduce((acc, curr) => {
    const dateKey = format(new Date(curr.startDate), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(curr);
    return acc;
  }, {} as Record<string, Appointment[]>);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress sx={{ color: 'var(--primary)' }} />
    </Box>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <EventIcon fontSize="small" /> Agenda
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Rendez-vous</h1>
        </div>
        <div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
          >
            Nouveau RDV
          </Button>
        </div>
      </div>

      {/* TIMELINE LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {Object.keys(groupedAppointments).sort().map((dateKey) => {
          const date = new Date(dateKey);
          const dailyApps = groupedAppointments[dateKey].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

          return (
            <div key={dateKey}>
              {/* Date Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px',
                color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-gold)' }}></div>
                {format(date, 'EEEE d MMMM', { locale: fr })}
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '12px', borderLeft: '2px solid #e2e8f0' }}>
                {dailyApps.map(app => (
                  <div
                    key={app.id}
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      display: 'grid', gridTemplateColumns: '100px 1fr 1fr auto', gap: '32px', alignItems: 'center',
                      borderLeft: `4px solid ${typeColors[app.type] || 'var(--primary)'}`,
                      marginBottom: 0
                    }}
                  >
                    {/* Time */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
                        {format(new Date(app.startDate), 'HH:mm')}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                        {format(new Date(app.endDate), 'HH:mm')}
                      </div>
                    </div>

                    {/* Main Info */}
                    <div>
                      <div style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                        background: (typeColors[app.type] || 'gray') + '20',
                        color: typeColors[app.type] || 'gray',
                        fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px'
                      }}>
                        {typeLabels[app.type]}
                      </div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--primary)' }}>{app.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <LocationIcon fontSize="small" sx={{ color: 'var(--text-tertiary)' }} />
                        {app.location || 'Pas de lieu spécifié'}
                      </div>
                    </div>

                    {/* Entities */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {app.client && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                          <PersonIcon fontSize="small" sx={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ fontWeight: 500 }}>{app.client.firstName} {app.client.lastName}</span>
                        </div>
                      )}
                      {app.property && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                          <HomeIcon fontSize="small" sx={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ color: 'var(--text-secondary)' }}>{app.property.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Avatar Group / Actions */}
                    <div>
                      <AvatarGroup max={3}>
                        {app.client && <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--primary)' }}>{app.client.firstName[0]}</Avatar>}
                        <Avatar sx={{ width: 32, height: 32 }} />
                      </AvatarGroup>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
