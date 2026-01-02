import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
  Checkbox,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  TrendingUpRounded as TrendingUpIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  Email as EmailIcon,
  CheckCircleOutline as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Add as AddIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// --- TYPES ---
interface Task {
  id: string;
  title: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  type: 'call' | 'visit' | 'admin';
}

interface Message {
  id: string;
  sender: string;
  avatar: string; // URL
  preview: string;
  time: string;
  unread: boolean;
}

interface Appointment {
  id: string;
  title: string;
  client: string;
  time: string;
  location: string;
  type: 'visite' | 'signature' | 'estimation';
}

interface OperationalStats {
  callsToMake: number;
  emailsUnread: number;
  todaysAppointments: number;
  pendingDeals: number;
}

interface DashboardData {
  stats: OperationalStats;
  tasks: Task[];
  messages: Message[];
  agenda: Appointment[];
  revenueData: any[]; // Keep the chart for context, but smaller
}


// --- COMPONENTS HELPERS ---

const ActionStat = ({ value, label, icon, alert }: any) => (
  <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', overflow: 'hidden' }}>
    <div style={{
      width: '56px', height: '56px',
      borderRadius: '16px',
      background: alert ? 'rgba(212, 175, 55, 0.15)' : 'rgba(15, 23, 42, 0.04)',
      color: alert ? 'var(--accent-gold)' : 'var(--text-secondary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <div className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>{value}</div>
      <div className="font-sans" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
    </div>
    {alert && <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-gold)' }}></div>}
  </div>
);

// --- MAIN COMPONENT ---

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/analytics/operational-dashboard');
      setData(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Erreur lors du chargement des données');
      // En cas d'erreur, on initialise avec des données vides
      setData({
        stats: {
          callsToMake: 0,
          emailsUnread: 0,
          todaysAppointments: 0,
          pendingDeals: 0,
        },
        tasks: [],
        messages: [],
        agenda: [],
        revenueData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress sx={{ color: 'var(--primary)' }} />
    </Box>
  );

  if (!data) {
    return (
      <Box p={4}>
        <div style={{ color: 'var(--danger-color)', marginBottom: '16px' }}>
          {error || 'Aucune donnée disponible'}
        </div>
        {error && (
          <Button variant="contained" onClick={fetchDashboardData}>
            Réessayer
          </Button>
        )}
      </Box>
    );
  }

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '60px' }}>

      {/* HEADER: Welcome & Date */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: 0 }}>Bonjour, Philippe</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {format(new Date(), 'EEEE d MMMM', { locale: fr })} • <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Vous avez {data.tasks.filter(t => !t.completed).length} tâches prioritaires.</span>
          </p>
        </div>
         <div style={{ display: 'flex', gap: '12px' }}>
           <Button 
             startIcon={<AddIcon />} 
             variant="contained" 
             sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', padding: '10px 24px', fontSize: '1rem' }}
             onClick={(e) => setMenuAnchor(e.currentTarget)}
           >
             Nouveau Dossier
           </Button>
           <Menu
             anchorEl={menuAnchor}
             open={Boolean(menuAnchor)}
             onClose={() => setMenuAnchor(null)}
             PaperProps={{
               sx: {
                 mt: 1.5,
                 minWidth: 200,
                 borderRadius: '12px',
                 boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
               }
             }}
           >
             <MenuItem 
               onClick={() => {
                 setMenuAnchor(null);
                 navigate('/properties/new');
               }}
               sx={{ py: 1.5 }}
             >
               Nouveau Bien
             </MenuItem>
             <MenuItem 
               onClick={() => {
                 setMenuAnchor(null);
                 navigate('/clients/new');
               }}
               sx={{ py: 1.5 }}
             >
               Nouveau Client
             </MenuItem>
             <MenuItem 
               onClick={() => {
                 setMenuAnchor(null);
                 navigate('/mandates');
               }}
               sx={{ py: 1.5 }}
             >
               Nouveau Mandat
             </MenuItem>
             <MenuItem 
               onClick={() => {
                 setMenuAnchor(null);
                 navigate('/contracts');
               }}
               sx={{ py: 1.5 }}
             >
               Nouveau Contrat
             </MenuItem>
           </Menu>
         </div>
      </div>

      {/* TOP ROW: ACTIONABLE KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <ActionStat value={data.stats.callsToMake} label="Appels à passer" icon={<PhoneIcon sx={{ fontSize: 28 }} />} alert />
        <ActionStat value={data.stats.emailsUnread} label="Messages non lus" icon={<EmailIcon sx={{ fontSize: 28 }} />} alert />
        <ActionStat value={data.stats.todaysAppointments} label="RDV aujourd'hui" icon={<EventIcon sx={{ fontSize: 28 }} />} />
        <ActionStat value={data.stats.pendingDeals} label="Dossiers en cours" icon={<TrendingUpIcon sx={{ fontSize: 28 }} />} />
      </div>

      {/* MAIN GRID: 3 Columns (Tasks, Agenda, Messages) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '24px', alignItems: 'start' }}>

        {/* COLUMN 1: TO-DO (Operational Core) */}
        <div className="glass-panel" style={{ padding: '32px', minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="font-serif" style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary)' }}>Tâches du jour</h2>
            <IconButton size="small" onClick={() => navigate('/tasks')}><AddIcon /></IconButton>
          </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {data.tasks.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                 Aucune tâche pour aujourd'hui
               </div>
             ) : (
               data.tasks.map((task) => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px',
                background: task.completed ? '#f8fafc' : '#fff',
                borderRadius: '12px',
                border: task.completed ? '1px solid transparent' : '1px solid #e2e8f0',
                boxShadow: task.completed ? 'none' : '0 2px 4px rgba(0,0,0,0.02)',
                opacity: task.completed ? 0.6 : 1,
                transition: 'all 0.2s'
              }}>
                <Checkbox
                  checked={task.completed}
                  icon={<UncheckedIcon />}
                  checkedIcon={<CheckCircleIcon />}
                  sx={{ color: 'var(--text-tertiary)', '&.Mui-checked': { color: 'var(--status-success)' } }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    marginBottom: '4px'
                  }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Chip
                      label={task.type === 'call' ? 'Appel' : task.type === 'visit' ? 'Visite' : 'Admin'}
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(15, 23, 42, 0.05)', color: 'var(--text-secondary)' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{task.time}</span>
                  </div>
                </div>
                {task.priority === 'high' && !task.completed && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)' }} />
                 )}
               </div>
               ))
             )}
             <Button fullWidth sx={{ marginTop: '16px', color: 'var(--text-secondary)' }} onClick={() => navigate('/tasks')}>
               Voir toutes les tâches
             </Button>
          </div>
        </div>

        {/* COLUMN 2: AGENDA (Timeline) */}
        <div className="glass-panel" style={{ padding: '32px', minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="font-serif" style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary)' }}>Agenda</h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Aujourd'hui</div>
          </div>

          <div style={{ position: 'relative', paddingLeft: '20px' }}>
            {/* Timeline Line */}
            <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: '#e2e8f0' }}></div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               {data.agenda.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                   Aucun rendez-vous aujourd'hui
                 </div>
               ) : (
                 data.agenda.map((apt, idx) => (
                <div key={apt.id} style={{ position: 'relative' }}>
                  {/* Timeline Dot */}
                  <div style={{
                    position: 'absolute', left: '-19px', top: '24px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: idx === 0 ? 'var(--primary)' : '#fff', border: `3px solid ${idx === 0 ? 'var(--primary-light)' : '#cbd5e1'}`
                  }}></div>

                  <div style={{
                    padding: '20px',
                    background: idx === 0 ? 'var(--primary)' : '#fff',
                    borderRadius: '16px',
                    border: idx === 0 ? 'none' : '1px solid #e2e8f0',
                    color: idx === 0 ? '#fff' : 'inherit',
                    boxShadow: idx === 0 ? '0 10px 20px -5px rgba(15, 23, 42, 0.3)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.8, fontSize: '0.85rem' }}>
                      <TimeIcon fontSize="small" /> {apt.time}
                    </div>
                    <div className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{apt.title}</div>
                    <div style={{ marginBottom: '12px', fontSize: '0.9rem', opacity: 0.9 }}>{apt.client}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', opacity: 0.7 }}>
                      <LocationIcon fontSize="small" /> {apt.location}
                    </div>
                   </div>
                 </div>
                 ))
               )}
             </div>
           </div>
         </div>

        {/* COLUMN 3: MESSAGES & QUICK CHART */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Messages Widget */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-serif" style={{ fontSize: '1.2rem', margin: 0, color: 'var(--primary)' }}>Messages</h3>
              <span style={{ background: 'var(--accent-gold)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>{data.stats.emailsUnread}</span>
            </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {data.messages.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
                   Aucun message
                 </div>
               ) : (
                 data.messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s', background: msg.unread ? 'rgba(212, 175, 55, 0.05)' : 'transparent' }}>
                  <Avatar src={msg.avatar} sx={{ width: 40, height: 40 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{msg.sender}</div>
                      <div style={{ fontSize: '0.7rem', color: msg.unread ? 'var(--accent-gold)' : 'var(--text-tertiary)' }}>{msg.time}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: msg.unread ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {msg.preview}
                    </div>
                     </div>
                   </div>
                 ))
               )}
             </div>
             <Button fullWidth variant="outlined" size="small" sx={{ mt: 2, borderColor: '#e2e8f0', color: 'var(--text-secondary)' }} onClick={() => navigate('/communications')}>
               Messagerie
             </Button>
          </div>

          {/* Mini Revenue Chart */}
          <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
            <h3 className="font-serif" style={{ fontSize: '1.2rem', margin: '0 0 16px', color: 'var(--primary)' }}>Aperçu Revenus</h3>
            <div style={{ height: '150px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueData}>
                  <defs>
                    <linearGradient id="colorRevSmall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#colorRevSmall)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
