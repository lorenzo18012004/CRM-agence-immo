import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Typography,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Folder as FolderIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Mandate {
  id: string;
  mandateNumber: string;
  type: 'EXCLUSIVE' | 'NON_EXCLUSIVE' | 'OPEN';
  startDate: string;
  endDate?: string;
  price?: number;
  commissionRate?: number;
  status: string;
  property?: { id: string; title: string; reference: string; type: string };
  client?: { id: string; firstName: string; lastName: string; avatar?: string };
  user?: { id: string; firstName: string; lastName: string };
}

const typeLabels: Record<string, string> = {
  EXCLUSIVE: 'Exclusif',
  NON_EXCLUSIVE: 'Simple',
  OPEN: 'Semi-Exclusif',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'var(--success-color)',
  EXPIRED: 'var(--danger-color)',
  TERMINATED: 'var(--text-tertiary)',
  RENEWED: 'var(--primary)',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Actif',
  EXPIRED: 'Expiré',
  TERMINATED: 'Résilié',
  RENEWED: 'Renouvelé',
};

// --- MOCK DATA ---
const MOCK_MANDATES: Mandate[] = [
  {
    id: '1', mandateNumber: 'MAN-2024-001', type: 'EXCLUSIVE', startDate: '2024-01-15', endDate: '2024-04-15',
    price: 4500000, commissionRate: 5, status: 'ACTIVE',
    property: { id: '1', title: 'Villa Contemporaine Cannes', reference: 'REF-001', type: 'Villa' },
    client: { id: 'c1', firstName: 'Jean', lastName: 'Dupont' }
  },
  {
    id: '2', mandateNumber: 'MAN-2024-005', type: 'NON_EXCLUSIVE', startDate: '2024-02-01', endDate: '2024-05-01',
    price: 850000, commissionRate: 4, status: 'ACTIVE',
    property: { id: '4', title: 'Appartement Loft Nice', reference: 'REF-004', type: 'Appartement' },
    client: { id: 'c2', firstName: 'Sophie', lastName: 'Martin' }
  },
  {
    id: '3', mandateNumber: 'MAN-2023-120', type: 'EXCLUSIVE', startDate: '2023-10-10', endDate: '2024-01-10',
    price: 2800000, commissionRate: 5, status: 'EXPIRED',
    property: { id: '2', title: 'Penthouse Vue Mer', reference: 'REF-002', type: 'Appartement' },
    client: { id: 'c3', firstName: 'Lucas', lastName: 'Bernard' }
  },
];

export default function Mandates() {
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setMandates(MOCK_MANDATES);
      setLoading(false);
    }, 800);
  }, []);

  const filteredMandates = mandates.filter(m => {
    const matchesStatus = filterStatus === 'ALL' || m.status === filterStatus;
    const matchesSearch = m.mandateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.property?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.client?.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
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
            <FolderIcon fontSize="small" /> Gestion
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Mandats</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
            onClick={() => navigate('/mandates/new')}
          >
            Nouveau Mandat
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher un mandat..."
            variant="standard"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              disableUnderline: true
            }}
            sx={{ minWidth: 250 }}
          />
          <Tabs value={filterStatus} onChange={(e, v) => setFilterStatus(v)} textColor="inherit" indicatorColor="primary">
            <Tab label="Tous" value="ALL" sx={{ textTransform: 'none' }} />
            <Tab label="Actifs" value="ACTIVE" sx={{ textTransform: 'none' }} />
            <Tab label="Expirés" value="EXPIRED" sx={{ textTransform: 'none' }} />
            <Tab label="Renouvelés" value="RENEWED" sx={{ textTransform: 'none' }} />
          </Tabs>
        </div>
      </div>

      {/* LIST VIEW */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredMandates.map((mandate) => (
          <div
            key={mandate.id}
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: '80px 2fr 1.5fr 1fr 1fr 100px',
              alignItems: 'center',
              gap: '24px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onClick={() => navigate(`/mandates/${mandate.id}`)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
          >
            {/* Icon/Type */}
            <div style={{
              width: 60, height: 60, borderRadius: '12px',
              background: mandate.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.05)',
              color: mandate.status === 'ACTIVE' ? 'var(--success-color)' : 'var(--text-secondary)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <DescriptionIcon />
              <div style={{ fontSize: '0.6rem', fontWeight: 700, marginTop: '4px' }}>{mandate.type === 'EXCLUSIVE' ? 'EXC' : 'SMP'}</div>
            </div>

            {/* Property Info */}
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{mandate.mandateNumber}</div>
              <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '2px' }}>{mandate.property?.title}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{mandate.property?.reference} • {mandate.property?.type}</div>
            </div>

            {/* Client Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'var(--primary-light)' }}>
                {mandate.client?.firstName[0]}
              </Avatar>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{mandate.client?.firstName} {mandate.client?.lastName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Propriétaire</div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <CalendarIcon fontSize="inherit" /> Début: {format(new Date(mandate.startDate), 'dd MMM yy', { locale: fr })}
              </div>
              {mandate.endDate && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  Fin: {format(new Date(mandate.endDate), 'dd MMM yy', { locale: fr })}
                </div>
              )}
            </div>

            {/* Price & Comm */}
            <div style={{ textAlign: 'right' }}>
              <div className="font-serif" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(mandate.price || 0)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Com: {mandate.commissionRate}%
              </div>
            </div>

            {/* Status */}
            <div style={{ textAlign: 'right' }}>
              <Chip
                label={statusLabels[mandate.status]}
                size="small"
                sx={{
                  bgcolor: statusColors[mandate.status],
                  color: '#fff',
                  fontWeight: 600
                }}
              />
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
