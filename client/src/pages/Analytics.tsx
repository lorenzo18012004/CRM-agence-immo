import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
  Menu,
  MenuItem,
  TextField
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

// --- TYPES ---
interface AgentPerformance {
  id: string;
  name: string;
  avatar: string;
  sales: number;
  revenue: number;
  rating: number; // 0-5
}

interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  averageCommission: number;
  activeListings: number;
  revenueTrend: Array<{ month: string; value: number; target: number }>;
  marketDistribution: Array<{ subject: string; A: number; fullMark: number }>;
  propertyTypes: Array<{ name: string; value: number }>;
  topAgents: AgentPerformance[];
  detailedStats: Array<{
    month: string;
    leads: number;
    visits: number;
    conversion: number;
    offers: number;
    avgDays: number;
    revenue: number;
  }>;
}

// --- MOCK DATA (High-End) ---
const DEMO_ANALYTICS: AnalyticsData = {
  totalRevenue: 4850000,
  revenueGrowth: 18.4,
  averageCommission: 24500,
  activeListings: 142,
  revenueTrend: [
    { month: 'Jan', value: 320000, target: 300000 },
    { month: 'Fév', value: 350000, target: 320000 },
    { month: 'Mar', value: 450000, target: 350000 },
    { month: 'Avr', value: 420000, target: 400000 },
    { month: 'Mai', value: 550000, target: 450000 },
    { month: 'Juin', value: 680000, target: 500000 },
  ],
  marketDistribution: [
    { subject: 'Luxe', A: 120, fullMark: 150 },
    { subject: 'Résidentiel', A: 98, fullMark: 150 },
    { subject: 'Commercial', A: 86, fullMark: 150 },
    { subject: 'Terrain', A: 65, fullMark: 150 },
    { subject: 'Locatif', A: 90, fullMark: 150 },
  ],
  propertyTypes: [
    { name: 'Villas', value: 45 },
    { name: 'Appartements', value: 35 },
    { name: 'Lofts', value: 10 },
    { name: 'Locaux', value: 10 },
  ],
  topAgents: [
    { id: '1', name: 'Sarah Connor', avatar: 'https://i.pravatar.cc/150?u=10', sales: 12, revenue: 850000, rating: 4.9 },
    { id: '2', name: 'Jean Dujardin', avatar: 'https://i.pravatar.cc/150?u=12', sales: 9, revenue: 620000, rating: 4.7 },
    { id: '3', name: 'Marion Cotillard', avatar: 'https://i.pravatar.cc/150?u=15', sales: 8, revenue: 580000, rating: 4.8 },
    { id: '4', name: 'Vincent Cassel', avatar: 'https://i.pravatar.cc/150?u=20', sales: 6, revenue: 420000, rating: 4.5 },
  ],
  detailedStats: [
    { month: 'Janvier', leads: 45, visits: 28, conversion: 12, offers: 8, avgDays: 42, revenue: 320000 },
    { month: 'Février', leads: 52, visits: 35, conversion: 14, offers: 10, avgDays: 38, revenue: 350000 },
    { month: 'Mars', leads: 68, visits: 42, conversion: 18, offers: 15, avgDays: 35, revenue: 450000 },
    { month: 'Avril', leads: 60, visits: 38, conversion: 15, offers: 12, avgDays: 40, revenue: 420000 },
    { month: 'Mai', leads: 75, visits: 50, conversion: 22, offers: 18, avgDays: 30, revenue: 550000 },
    { month: 'Juin', leads: 82, visits: 58, conversion: 24, offers: 22, avgDays: 28, revenue: 680000 },
  ]
};

// --- COMPONENTS ---

const StatCard = ({ title, value, growth, icon, delay }: any) => (
  <div className={`glass-panel animate-enter ${delay}`} style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{
      width: 56, height: 56, borderRadius: '16px',
      background: 'rgba(15, 23, 42, 0.03)', color: 'var(--primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <div className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
        <div style={{
          fontSize: '0.75rem', fontWeight: 700,
          color: growth >= 0 ? 'var(--status-success)' : 'var(--status-warning)',
          display: 'flex', alignItems: 'center'
        }}>
          {growth >= 0 ? '+' : ''}{growth}%
        </div>
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const PeriodSelector = ({ period, setPeriod, startDate, setStartDate, endDate, setEndDate }: any) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'year' | 'custom') => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
    handleClose();
  };

  return (
    <>
      <Button
        startIcon={<CalendarIcon />}
        sx={{ color: 'var(--text-secondary)', textTransform: 'none' }}
        onClick={handleClick}
      >
        {period === 'week' ? 'Cette semaine' : period === 'month' ? 'Ce mois' : period === 'custom' ? 'Période personnalisée' : 'Cette année'}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
          }
        }}
      >
        <MenuItem onClick={() => handlePeriodChange('week')}>
          Cette semaine
        </MenuItem>
        <MenuItem onClick={() => handlePeriodChange('month')}>
          Ce mois
        </MenuItem>
        <MenuItem onClick={() => handlePeriodChange('year')}>
          Cette année
        </MenuItem>
        <MenuItem onClick={() => handlePeriodChange('custom')}>
          Période personnalisée
        </MenuItem>
      </Menu>
      {period === 'custom' && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            type="date"
            label="Date début"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <TextField
            type="date"
            label="Date fin"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
        </Box>
      )}
    </>
  );
};

// --- MAIN ---

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'custom'>('year');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, startDate, endDate]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('period', period);
      if (period === 'custom' && startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
      const response = await axios.get(`/analytics/dashboard?${params.toString()}`);
      const apiData = response.data;

      // Transformer les données de l'API au format attendu
      const transformedData: AnalyticsData = {
        totalRevenue: apiData.revenue?.yearToDate || 0,
        revenueGrowth: apiData.revenue?.lastMonth
          ? ((apiData.revenue.currentMonth - apiData.revenue.lastMonth) / apiData.revenue.lastMonth) * 100
          : 0,
        averageCommission: apiData.revenue?.currentMonth && apiData.contracts?.salesThisMonth
          ? apiData.revenue.currentMonth / apiData.contracts.salesThisMonth
          : 0,
        activeListings: apiData.propertyStats?.reduce((sum: number, stat: any) => {
          if (stat.status === 'AVAILABLE' || stat.status === 'PENDING') {
            return sum + stat.count;
          }
          return sum;
        }, 0) || 0,
        revenueTrend: apiData.revenue?.monthlyTrend?.map((item: any) => {
          // Formater selon le type de période
          let monthLabel = '';
          if (item.month.includes('-')) {
            // Format YYYY-MM-DD ou YYYY-MM
            if (item.month.length === 10) {
              // Date complète
              monthLabel = format(new Date(item.month), 'dd MMM', { locale: fr });
            } else {
              // Mois seulement
              monthLabel = format(new Date(item.month + '-01'), 'MMM', { locale: fr });
            }
          } else {
            monthLabel = item.month;
          }
          return {
            month: monthLabel,
            value: item.revenue || 0,
            target: item.revenue * 1.1 || 0, // Objectif 10% supérieur
          };
        }) || [],
        marketDistribution: apiData.propertyTypeData?.map((item: any) => ({
          subject: item.name,
          A: item.value,
          fullMark: Math.max(...(apiData.propertyTypeData?.map((i: any) => i.value) || [0])) * 1.2,
        })) || [],
        propertyTypes: apiData.propertyTypeData || [],
        topAgents: (apiData.agentPerformance || []).map((agent: any) => {
          if (!agent.user) {
            return null;
          }
          return {
            id: agent.user.id,
            name: `${agent.user.firstName} ${agent.user.lastName}`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.user.firstName + ' ' + agent.user.lastName)}&background=0f172a&color=fff`,
            sales: agent.totalContracts || 0,
            revenue: agent.totalCommission || 0,
            rating: 4.5 + (Math.random() * 0.5), // Note simulée entre 4.5 et 5.0
          };
        }).filter((agent: any) => agent !== null) || [],
        detailedStats: apiData.revenue?.monthlyTrend?.map((item: any, idx: number) => {
          const estimatedLeads = Math.floor(item.count * 3.5) || 10;
          const estimatedVisits = Math.floor(item.count * 2.2) || 5;
          const conversion = estimatedLeads > 0 ? Math.floor((item.count / estimatedLeads) * 100) : 0;

          // Formater le mois selon le format de la date
          let monthLabel = '';
          if (item.month.includes('-')) {
            if (item.month.length === 10) {
              // Date complète YYYY-MM-DD
              monthLabel = format(new Date(item.month), 'dd MMMM', { locale: fr });
            } else {
              // Mois seulement YYYY-MM
              monthLabel = format(new Date(item.month + '-01'), 'MMMM', { locale: fr });
            }
          } else {
            monthLabel = item.month;
          }

          return {
            month: monthLabel,
            leads: estimatedLeads,
            visits: estimatedVisits,
            conversion: conversion,
            offers: Math.floor(item.count * 1.5) || 0,
            avgDays: 35 - idx * 2, // Estimation
            revenue: item.revenue || 0,
          };
        }) || [],
      };

      setData(transformedData);
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des données');
      console.warn('API not available (Demo Mode), using Mock Data');
      setData(DEMO_ANALYTICS);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress sx={{ color: 'var(--primary)' }} />
    </Box>
  );

  if (error) {
    return (
      <Box p={4}>
        <div style={{ color: 'var(--status-warning)', marginBottom: '16px' }}>{error}</div>
        <Button variant="contained" onClick={fetchAnalyticsData}>Réessayer</Button>
      </Box>
    );
  }

  if (!data) return null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <TimelineIcon fontSize="small" /> Analytics
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Performance</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <PeriodSelector
            period={period}
            setPeriod={setPeriod}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
          <Button variant="contained" startIcon={<DownloadIcon />} sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}>Exporter</Button>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <StatCard
          title="Chiffre d'Affaires"
          value={formatCurrency(data.totalRevenue)}
          growth={data.revenueGrowth}
          icon={<MoneyIcon />}
          delay="delay-100"
        />
        <StatCard
          title="Commission Moyenne"
          value={formatCurrency(data.averageCommission)}
          growth={2.5}
          icon={<PieChartIcon />}
          delay="delay-100"
        />
        <StatCard
          title="Mandats Actifs"
          value={data.activeListings}
          growth={-1.2}
          icon={<BarChartIcon />}
          delay="delay-200"
        />
        <StatCard
          title="Agents Actifs"
          value={data.topAgents.length}
          growth={0}
          icon={<PeopleIcon />}
          delay="delay-200"
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>

        {/* REVENUE CHART (Left Big) */}
        <div className="glass-panel animate-enter delay-300" style={{ gridColumn: 'span 8', padding: '32px', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary)' }}>Évolution des Revenus</h3>
            <IconButton><FilterIcon /></IconButton>
          </div>
          <div style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="target" stroke="var(--accent-gold)" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MARKET DISTRIBUTION (Right Top) */}
        <div className="glass-panel animate-enter delay-300" style={{ gridColumn: 'span 4', padding: '32px' }}>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', margin: '0 0 24px 0', color: 'var(--primary)' }}>Pénétration Marché</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.marketDistribution}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Agence" dataKey="A" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DETAILED PERFORMANCE TABLE (New Section) */}
        <div className="glass-panel animate-enter delay-400" style={{ gridColumn: 'span 12', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary)' }}>Rapport Détaillé Mensuel</h3>
            <Button startIcon={<DownloadIcon />} variant="outlined" sx={{ borderColor: '#e2e8f0', color: 'var(--text-secondary)' }}>Export CSV</Button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 700 }}>PÉRIODE</th>
                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 700 }}>LEADS</th>
                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 700 }}>VISITES</th>
                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 700 }}>CONVERSION</th>
                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 700 }}>OFFRES</th>
                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 700 }}>DÉLAI MOYEN</th>
                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 700 }}>CA GÉNÉRÉ</th>
              </tr>
            </thead>
            <tbody>
              {data.detailedStats.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'transparent' : 'rgba(241, 245, 249, 0.4)' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.month}</td>
                  <td style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.leads}</td>
                  <td style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.visits}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: row.conversion > 15 ? 'var(--status-success)' : 'var(--text-primary)' }}>{row.conversion}%</td>
                  <td style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.offers}</td>
                  <td style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.avgDays}j</td>
                  <td className="font-serif" style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(row.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AGENT PERFORMANCE TABLE (Bottom Full) */}
        <div className="glass-panel animate-enter delay-400" style={{ gridColumn: 'span 12', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrophyIcon sx={{ color: 'var(--accent-gold)', fontSize: 32 }} />
              <h3 className="font-serif" style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary)' }}>Classement Collaborateurs</h3>
            </div>
            <Button endIcon={<ArrowIcon />}>Voir tout le classement</Button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '0 16px' }}>RANG</th>
                <th style={{ textAlign: 'left', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '0 16px' }}>AGENT</th>
                <th style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '0 16px' }}>VENTES</th>
                <th style={{ textAlign: 'right', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '0 16px' }}>CHIFFRE D'AFFAIRES</th>
                <th style={{ textAlign: 'right', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '0 16px' }}>NOTE CLIENT</th>
                <th style={{ textAlign: 'right', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '0 16px' }}>PERFORMANCE</th>
              </tr>
            </thead>
            <tbody>
              {data.topAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Aucun collaborateur trouvé
                  </td>
                </tr>
              ) : (
                data.topAgents.map((agent, idx) => {
                  const maxRevenue = Math.max(...data.topAgents.map((a: any) => a.revenue), 1);
                  const performancePercent = maxRevenue > 0 ? (agent.revenue / maxRevenue) * 100 : 0;
                  return (
                    <tr key={agent.id} style={{ transition: 'transform 0.2s', cursor: 'pointer' }}>
                      <td style={{ padding: '16px', fontWeight: 700, color: '#94a3b8', width: '50px' }}>#{idx + 1}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <Avatar src={agent.avatar} sx={{ width: 44, height: 44, border: idx === 0 ? '2px solid var(--accent-gold)' : 'none' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{agent.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Senior Broker</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>{agent.sales}</td>
                      <td className="font-serif" style={{ padding: '16px', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>
                        {formatCurrency(agent.revenue)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#b45309', padding: '4px 12px', borderRadius: '20px' }}>
                          ★ {agent.rating.toFixed(1)}
                        </span>
                      </td>
                      <td style={{ padding: '16px', width: '200px' }}>
                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(performancePercent, 100)}%`, height: '100%', background: idx === 0 ? 'var(--accent-gold)' : 'var(--primary)', borderRadius: '3px' }}></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}


