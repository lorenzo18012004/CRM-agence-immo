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
  LocalOffer as OfferIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Offer {
  id: string;
  offerNumber: string;
  amount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFER' | 'WITHDRAWN';
  submittedDate: string;
  property?: { id: string; title: string; reference: string; price: number };
  client?: { id: string; firstName: string; lastName: string };
}

const statusColors: Record<string, string> = {
  PENDING: 'var(--status-warning)',
  ACCEPTED: 'var(--status-success)',
  REJECTED: 'var(--danger-color)',
  COUNTER_OFFER: 'var(--primary)',
  WITHDRAWN: 'var(--text-tertiary)',
};

const statusLabels: Record<string, string> = {
  PENDING: 'En Attente',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée',
  COUNTER_OFFER: 'Contre-Offre',
  WITHDRAWN: 'Retirée',
};

// --- MOCK DATA ---
const MOCK_OFFERS: Offer[] = [
  {
    id: '1', offerNumber: 'OFF-2024-042', amount: 4400000, status: 'PENDING', submittedDate: '2024-03-10',
    property: { id: '1', title: 'Villa Contemporaine Cannes', reference: 'REF-001', price: 4500000 },
    client: { id: 'c3', firstName: 'Lucas', lastName: 'Bernard' }
  },
  {
    id: '2', offerNumber: 'OFF-2024-038', amount: 2750000, status: 'ACCEPTED', submittedDate: '2024-02-28',
    property: { id: '2', title: 'Penthouse Vue Mer', reference: 'REF-002', price: 2800000 },
    client: { id: 'c4', firstName: 'Emma', lastName: 'Petit' }
  },
  {
    id: '3', offerNumber: 'OFF-2024-015', amount: 1600000, status: 'REJECTED', submittedDate: '2024-01-15',
    property: { id: '3', title: 'Bastide Provençale', reference: 'REF-003', price: 1850000 },
    client: { id: 'c5', firstName: 'Thomas', lastName: 'Moreau' }
  }
];

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate Fetch
    setTimeout(() => {
      setOffers(MOCK_OFFERS);
      setLoading(false);
    }, 800);
  }, []);

  const filteredOffers = offers.filter(o => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch = o.offerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.property?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.client?.lastName.toLowerCase().includes(searchQuery.toLowerCase());
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
            <OfferIcon fontSize="small" /> Transactions
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Offres</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
            onClick={() => navigate('/offers/new')}
          >
            Nouvelle Offre
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher une offre..."
            variant="standard"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              disableUnderline: true
            }}
            sx={{ minWidth: 250 }}
          />
          <Tabs value={filterStatus} onChange={(_e, v) => setFilterStatus(v)} textColor="inherit" indicatorColor="primary">
            <Tab label="Toutes" value="ALL" sx={{ textTransform: 'none' }} />
            <Tab label="En Attente" value="PENDING" sx={{ textTransform: 'none' }} />
            <Tab label="Acceptées" value="ACCEPTED" sx={{ textTransform: 'none' }} />
            <Tab label="Refusées" value="REJECTED" sx={{ textTransform: 'none' }} />
          </Tabs>
        </div>
      </div>

      {/* LIST VIEW */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filteredOffers.map((offer) => {
          const priceDiff = offer.property?.price ? offer.amount - offer.property.price : 0;
          const diffPercent = offer.property?.price ? ((priceDiff / offer.property.price) * 100).toFixed(1) : 0;
          const isNegative = priceDiff < 0;

          return (
            <div
              key={offer.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: '80px 2fr 1.5fr 1fr 1fr 100px',
                alignItems: 'center',
                gap: '24px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                borderLeft: `4px solid ${statusColors[offer.status]}`
              }}
              onClick={() => navigate(`/offers/${offer.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              {/* Icon */}
              <div style={{
                width: 60, height: 60, borderRadius: '12px',
                background: statusColors[offer.status] + '20', // transparent
                color: statusColors[offer.status],
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <OfferIcon />
              </div>

              {/* Property Info */}
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{offer.offerNumber}</div>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '2px' }}>{offer.property?.title}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Offre sur {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(offer.property?.price || 0)}
                </div>
              </div>

              {/* Client Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'var(--text-tertiary)' }}>{offer.client?.firstName[0]}</Avatar>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{offer.client?.firstName} {offer.client?.lastName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Acheteur</div>
                </div>
              </div>

              {/* Date */}
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {format(new Date(offer.submittedDate), 'dd MMM yyyy', { locale: fr })}
              </div>

              {/* Offer Amount & Diff */}
              <div style={{ textAlign: 'right' }}>
                <div className="font-serif" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.25rem' }}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(offer.amount)}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isNegative ? 'var(--danger-color)' : 'var(--success-color)' }}>
                  {isNegative ? '' : '+'}{diffPercent}% vs Mandat
                </div>
              </div>

              {/* Status */}
              <div style={{ textAlign: 'right' }}>
                <Chip
                  label={statusLabels[offer.status]}
                  size="small"
                  sx={{
                    bgcolor: statusColors[offer.status],
                    color: '#fff',
                    fontWeight: 600
                  }}
                />
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
