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
  Description as ContractIcon,
  Gavel as GavelIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as SignedIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Contract {
  id: string;
  contractNumber: string;
  type: 'SALE' | 'RENTAL';
  startDate: string;
  endDate?: string;
  price: number;
  commission?: number;
  status: string;
  property?: { id: string; title: string; reference: string };
  client?: { id: string; firstName: string; lastName: string };
}

const statusColors: Record<string, string> = {
  ACTIVE: 'var(--success-color)',
  DRAFT: 'var(--text-secondary)',
  COMPLETED: 'var(--accent-gold)',
  CANCELLED: 'var(--danger-color)',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'En cours',
  DRAFT: 'Brouillon',
  COMPLETED: 'Signé',
  CANCELLED: 'Annulé',
};

// --- MOCK DATA ---
const MOCK_CONTRACTS: Contract[] = [
  {
    id: '1', contractNumber: 'CTR-2024-089', type: 'SALE', startDate: '2024-02-14',
    price: 4500000, commission: 225000, status: 'Completed', // Using English key to match mock logic usually but labels map French
    property: { id: '1', title: 'Villa Contemporaine Cannes', reference: 'REF-001' },
    client: { id: 'c1', firstName: 'Jean', lastName: 'Dupont' }
  },
  {
    id: '2', contractNumber: 'CTR-2024-092', type: 'RENTAL', startDate: '2024-03-01', endDate: '2025-02-28',
    price: 3500, commission: 3500, status: 'Active',
    property: { id: '4', title: 'Appartement Loft Nice', reference: 'REF-004' },
    client: { id: 'c2', firstName: 'Sophie', lastName: 'Martin' }
  },
];

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate Fetch
    setTimeout(() => {
      // Normalize mock statuses to match keys
      const normalized = MOCK_CONTRACTS.map(c => ({
        ...c,
        status: c.status.toUpperCase()
      }));
      setContracts(normalized);
      setLoading(false);
    }, 800);
  }, []);

  const filteredContracts = contracts.filter(c => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch = c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.property?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client?.lastName.toLowerCase().includes(searchQuery.toLowerCase());
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
            <GavelIcon fontSize="small" /> Juridique
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Contrats</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
            onClick={() => navigate('/contracts/new')}
          >
            Nouveau Contrat
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher un contrat..."
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
            <Tab label="Signés" value="COMPLETED" sx={{ textTransform: 'none' }} />
            <Tab label="En cours" value="ACTIVE" sx={{ textTransform: 'none' }} />
            <Tab label="Brouillons" value="DRAFT" sx={{ textTransform: 'none' }} />
          </Tabs>
        </div>
      </div>

      {/* LIST VIEW */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredContracts.map((contract) => (
          <div
            key={contract.id}
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
            onClick={() => navigate(`/contracts/${contract.id}`)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
          >
            {/* Icon */}
            <div style={{
              width: 60, height: 60, borderRadius: '12px',
              background: contract.status === 'COMPLETED' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(15, 23, 42, 0.05)',
              color: contract.status === 'COMPLETED' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {contract.status === 'COMPLETED' ? <SignedIcon /> : <ContractIcon />}
            </div>

            {/* Property Info */}
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{contract.contractNumber}</div>
              <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '2px' }}>{contract.property?.title}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {contract.property?.reference} • {contract.type === 'SALE' ? 'VENTE' : 'LOCATION'}
              </div>
            </div>

            {/* Client Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600
              }}>
                {contract.client?.firstName[0]}{contract.client?.lastName[0]}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{contract.client?.firstName} {contract.client?.lastName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Signataire</div>
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <CalendarIcon fontSize="inherit" />
              {format(new Date(contract.startDate), 'dd MMM yyyy', { locale: fr })}
            </div>

            {/* Financials */}
            <div style={{ textAlign: 'right' }}>
              <div className="font-serif" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(contract.price || 0)}
              </div>
              {contract.commission && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                  Com: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(contract.commission)}
                </div>
              )}
            </div>

            {/* Status */}
            <div style={{ textAlign: 'right' }}>
              <Chip
                icon={contract.status === 'DRAFT' ? <PendingIcon fontSize="small" /> : undefined}
                label={statusLabels[contract.status] || contract.status}
                size="small"
                sx={{
                  bgcolor: statusColors[contract.status] || 'var(--text-tertiary)',
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
