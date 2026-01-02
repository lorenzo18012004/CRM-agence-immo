import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Badge as IDIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import axios from 'axios';
import { User } from '../types';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrateur',
  MANAGER: 'Manager',
  AGENT: 'Agent Immobilier',
  SECRETARY: 'Assistant(e)',
};

const roleColors: Record<string, string> = {
  ADMIN: 'var(--danger-color)',
  MANAGER: 'var(--accent-gold)',
  AGENT: 'var(--primary)',
  SECRETARY: 'var(--text-secondary)',
};

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: '1', firstName: 'Sarah', lastName: 'Connor', email: 'sarah.connor@agency.com', role: 'MANAGER', isActive: true, phone: '06 00 00 00 00' },
  { id: '2', firstName: 'Jean', lastName: 'Dujardin', email: 'jean.d@agency.com', role: 'AGENT', isActive: true, phone: '06 12 34 56 78' },
  { id: '3', firstName: 'Marion', lastName: 'Cotillard', email: 'marion.c@agency.com', role: 'AGENT', isActive: true, phone: '06 98 76 54 32' },
  { id: '4', firstName: 'Vincent', lastName: 'Cassel', email: 'vincent.c@agency.com', role: 'ADMIN', isActive: true, phone: '06 55 55 55 55' },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate Fetch
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 800);
  }, []);

  const filteredUsers = users.filter(u =>
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <IDIcon fontSize="small" /> Ressources Humaines
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Équipe</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
          >
            Nouveau Membre
          </Button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center' }}>
        <TextField
          placeholder="Rechercher un membre de l'équipe..."
          variant="standard"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            disableUnderline: true
          }}
        />
      </div>

      {/* GRID VIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="glass-panel"
            style={{
              padding: '0',
              position: 'relative',
              overflow: 'hidden',
              opacity: user.isActive ? 1 : 0.6
            }}
          >
            {/* Header / Cover */}
            <div style={{ height: '100px', background: 'linear-gradient(45deg, var(--primary), var(--primary-light))' }}></div>

            {/* Options */}
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <IconButton sx={{ color: 'rgba(255,255,255,0.8)' }} size="small">
                <MoreIcon />
              </IconButton>
            </div>

            {/* Avatar & Main Info */}
            <div style={{ padding: '0 24px 24px', textAlign: 'center', marginTop: '-50px' }}>
              <Avatar
                sx={{
                  width: 100, height: 100, margin: '0 auto',
                  border: '4px solid white', boxShadow: 'var(--shadow-md)',
                  fontsize: '2rem', bgcolor: roleColors[user.role] || 'var(--primary)'
                }}
              >
                {user.firstName[0]}{user.lastName[0]}
              </Avatar>

              <h3 style={{ margin: '16px 0 4px', fontSize: '1.4rem', color: 'var(--primary)' }}>
                {user.firstName} {user.lastName}
              </h3>

              <Chip
                label={roleLabels[user.role]}
                size="small"
                sx={{
                  bgcolor: roleColors[user.role] + '20',
                  color: roleColors[user.role],
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}
              />

              {/* Contact Info */}
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem', justifyContent: 'center' }}>
                  <EmailIcon fontSize="small" sx={{ color: 'var(--text-tertiary)' }} />
                  {user.email}
                </div>
                {user.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem', justifyContent: 'center' }}>
                    <PhoneIcon fontSize="small" sx={{ color: 'var(--text-tertiary)' }} />
                    {user.phone}
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', fontSize: '0.8rem', color: user.isActive ? 'var(--success-color)' : 'var(--text-tertiary)', fontWeight: 600 }}>
                {user.isActive ? '● Compte Actif' : '○ Compte Inactif'}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
