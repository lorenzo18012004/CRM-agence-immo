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
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingDown as ExpenseIcon,
  TrendingUp as IncomeIcon,
  Receipt as BillIcon,
  CheckCircle as PaidIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  type: 'COMMISSION' | 'RENT' | 'SALE' | 'OTHER';
  dueDate?: string;
  paidDate?: string;
  contract?: { id: string; contractNumber: string };
  client?: { id: string; firstName: string; lastName: string };
}

const statusColors: Record<string, string> = {
  PENDING: 'var(--status-warning)', // Orange
  PAID: 'var(--success-color)', // Green
  OVERDUE: 'var(--danger-color)', // Red
  CANCELLED: 'var(--text-tertiary)', // Gray
};

const statusLabels: Record<string, string> = {
  PENDING: 'En Attente',
  PAID: 'Payé',
  OVERDUE: 'En Retard',
  CANCELLED: 'Annulé',
};

// --- MOCK DATA ---
const MOCK_PAYMENTS: Payment[] = [
  {
    id: '1', paymentNumber: 'PAY-2024-001', amount: 225000, status: 'PAID', type: 'COMMISSION',
    dueDate: '2024-03-01', paidDate: '2024-03-02',
    contract: { id: '1', contractNumber: 'CTR-2024-089' },
    client: { id: 'c1', firstName: 'Jean', lastName: 'Dupont' }
  },
  {
    id: '2', paymentNumber: 'PAY-2024-002', amount: 3500, status: 'PENDING', type: 'RENT',
    dueDate: '2024-03-25',
    contract: { id: '2', contractNumber: 'CTR-2024-092' },
    client: { id: 'c2', firstName: 'Sophie', lastName: 'Martin' }
  },
  {
    id: '3', paymentNumber: 'PAY-2024-003', amount: 1500, status: 'OVERDUE', type: 'OTHER',
    dueDate: '2024-02-15',
    client: { id: 'c3', firstName: 'Marc', lastName: 'Weber' }
  },
];

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    // Simulate Fetch
    setTimeout(() => {
      setPayments(MOCK_PAYMENTS);
      setLoading(false);
    }, 800);
  }, []);

  const filteredPayments = payments.filter(p => filterStatus === 'ALL' || p.status === filterStatus);

  // Stats
  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);

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
            <WalletIcon fontSize="small" /> Gestion
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Finances</h1>
        </div>
        <div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
          >
            Nouveau Paiement
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Paid Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IncomeIcon />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Encaissé</div>
            <div className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalPaid)}
            </div>
          </div>
        </div>
        {/* Pending Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(217, 119, 6, 0.1)', color: 'var(--status-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ExpenseIcon />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>En Attente</div>
            <div className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalPending)}
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={filterStatus} onChange={(e, v) => setFilterStatus(v)} textColor="primary" indicatorColor="primary">
          <Tab label="Tous" value="ALL" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Payés" value="PAID" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="En Attente" value="PENDING" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="En Retard" value="OVERDUE" sx={{ textTransform: 'none', fontWeight: 500 }} />
        </Tabs>
      </Box>

      {/* TRANSACTION LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredPayments.map((payment) => (
          <div
            key={payment.id}
            className="glass-panel"
            style={{
              padding: '20px 24px',
              display: 'grid', gridTemplateColumns: '60px 2fr 1.5fr 1fr 120px', alignItems: 'center', gap: '24px',
              borderLeft: `4px solid ${statusColors[payment.status]}`
            }}
          >
            {/* Icon */}
            <div style={{ color: 'var(--text-tertiary)' }}>
              <BillIcon />
            </div>

            {/* Main Info */}
            <div>
              <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '4px', fontSize: '1.05rem' }}>
                {payment.type === 'COMMISSION' ? 'Commission Vente' : payment.type}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {payment.paymentNumber} • {payment.contract?.contractNumber || 'Hors contrat'}
              </div>
            </div>

            {/* Payer Info */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                {payment.client ? `${payment.client.firstName} ${payment.client.lastName}` : 'N/A'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Client</span>
            </div>

            {/* Date */}
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {payment.dueDate ? format(new Date(payment.dueDate), 'dd MMM yyyy', { locale: fr }) : '-'}
            </div>

            {/* Amount & Status */}
            <div style={{ textAlign: 'right' }}>
              <div className="font-serif" style={{ fontWeight: 700, fontSize: '1.2rem', color: payment.status === 'PAID' ? 'var(--success-color)' : 'var(--primary)' }}>
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(payment.amount)}
              </div>
              <Chip
                label={statusLabels[payment.status]}
                size="small"
                sx={{
                  mt: 0.5,
                  fontSize: '0.7rem',
                  height: 20,
                  bgcolor: statusColors[payment.status] + '20',
                  color: statusColors[payment.status],
                  fontWeight: 700
                }}
              />
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
