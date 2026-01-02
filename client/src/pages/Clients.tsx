import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { Client } from '../types';

const clientTypeLabels: Record<string, string> = {
  BUYER: 'Acheteur',
  SELLER: 'Vendeur',
  TENANT: 'Locataire',
  LANDLORD: 'Propriétaire',
  PROSPECT: 'Prospect',
};

const clientTypeColors: Record<string, string> = {
  BUYER: 'var(--primary)',
  SELLER: 'var(--accent-gold)',
  TENANT: 'var(--text-secondary)',
  LANDLORD: 'var(--primary-light)',
  PROSPECT: 'var(--status-warning)', // Warning color usually good for prospects/leads
};

// --- MOCK DATA ---
const MOCK_CLIENTS: any[] = [
  {
    id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@email.com', phone: '06 12 34 56 78',
    clientType: 'BUYER', city: 'Cannes',
    budget: 2500000, status: 'Active'
  },
  {
    id: '2', firstName: 'Sophie', lastName: 'Martin', email: 'sophie.m@email.com', phone: '07 89 12 34 56',
    clientType: 'SELLER', city: 'Nice',
    budget: null, status: 'Active'
  },
  {
    id: '3', firstName: 'Marc', lastName: 'Weber', email: 'marc.weber@swiss.ch', phone: '+41 79 123 45 67',
    clientType: 'PROSPECT', city: 'Genève',
    budget: 5000000, status: 'New'
  },
];

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API
    setTimeout(() => {
      setClients(MOCK_CLIENTS);
      setLoading(false);
    }, 800);
  }, []);

  const filteredClients = clients.filter(c => {
    const matchesType = filterType === 'ALL' || c.clientType === filterType;
    const matchesSearch = c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress sx={{ color: 'var(--primary)' }} />
    </Box>
  );

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <PeopleIcon fontSize="small" /> CRM
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Clients</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
            onClick={() => navigate('/clients/new')}
          >
            Nouveau Client
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher un client..."
            variant="standard"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              disableUnderline: true
            }}
            sx={{ minWidth: 250 }}
          />
          <Tabs value={filterType} onChange={(_e, v) => setFilterType(v)} textColor="inherit" indicatorColor="primary">
            <Tab label="Tous" value="ALL" sx={{ textTransform: 'none' }} />
            <Tab label="Acheteurs" value="BUYER" sx={{ textTransform: 'none' }} />
            <Tab label="Vendeurs" value="SELLER" sx={{ textTransform: 'none' }} />
            <Tab label="Prospects" value="PROSPECT" sx={{ textTransform: 'none' }} />
          </Tabs>
        </div>
      </div>

      {/* GRID VIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="glass-panel"
            style={{
              padding: '24px',
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => navigate(`/clients/${client.id}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Header Card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <Avatar
                sx={{
                  width: 56, height: 56,
                  bgcolor: clientTypeColors[client.clientType] || 'var(--primary)',
                  fontSize: '1.2rem', fontWeight: 600
                }}
              >
                {client.firstName[0]}{client.lastName[0]}
              </Avatar>
              <Chip
                label={clientTypeLabels[client.clientType]}
                size="small"
                sx={{
                  bgcolor: clientTypeColors[client.clientType],
                  color: '#fff',
                  fontWeight: 600,
                  opacity: 0.9
                }}
              />
            </div>

            {/* Info */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--primary)' }}>{client.firstName} {client.lastName}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <LocationIcon fontSize="inherit" /> {client.city || 'N/A'}
              </div>
            </div>

            {/* Contact Details */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <PhoneIcon fontSize="small" sx={{ color: 'var(--text-tertiary)' }} /> {client.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <EmailIcon fontSize="small" sx={{ color: 'var(--text-tertiary)' }} /> {client.email}
              </div>
            </div>

            {/* Budget if exists */}
            {(client as any).budget && (
              <div style={{ marginTop: '16px', background: 'rgba(212, 175, 55, 0.1)', padding: '8px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)' }}>BUDGET</span>
                <span className="font-serif" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format((client as any).budget)}
                </span>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
