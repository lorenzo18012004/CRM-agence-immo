import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Business as AgencyIcon,
  Security as SecurityIcon,
  Notifications as NotifIcon,
  Palette as ThemeIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { AgencySettings } from '../types';

const MOCK_SETTINGS: AgencySettings = {
  id: '1', name: 'Luxe Immo Prestige', email: 'contact@luxe-immo.com', phone: '04 93 00 00 00',
  website: 'www.luxe-immo.com', address: '12 Croisette', city: 'Cannes', postalCode: '06400',
  description: 'Agence immobilière de luxe sur la Côte d\'Azur.', siret: '123 456 789 00012'
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('AGENCY');
  const [settings, setSettings] = useState<AgencySettings>(MOCK_SETTINGS);
  const [saving, setSaving] = useState(false);

  // Mock Notifications State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReport: false,
    newLeads: true
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Paramètres mis à jour !');
    }, 1000);
  };

  const menuItems = [
    { id: 'AGENCY', label: 'Agence', icon: <AgencyIcon /> },
    { id: 'SECURITY', label: 'Sécurité', icon: <SecurityIcon /> },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: <NotifIcon /> },
    { id: 'THEME', label: 'Apparence', icon: <ThemeIcon /> },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px', height: 'calc(100vh - 100px)', display: 'flex', gap: '32px' }}>

      {/* SIDEBAR */}
      <div className="glass-panel" style={{ width: '280px', padding: 0, overflow: 'hidden', height: 'fit-content' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)' }}>
          <SettingsIcon />
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Paramètres</h2>
        </div>
        <List sx={{ p: 2 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.id}
              button
              selected={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              sx={{
                borderRadius: '12px',
                mb: 1,
                bgcolor: activeTab === item.id ? 'var(--primary)' : 'transparent',
                color: activeTab === item.id ? '#fff' : 'var(--text-secondary)',
                '&:hover': { bgcolor: activeTab === item.id ? 'var(--primary-dark)' : 'rgba(0,0,0,0.05)' },
                '& .MuiListItemIcon-root': { color: activeTab === item.id ? '#fff' : 'var(--text-tertiary)' }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
          ))}
        </List>
      </div>

      {/* CONTENT AREA */}
      <div className="glass-panel" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--primary)' }} className="font-serif">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', px: 4 }}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>

        {/* AGENCY FORM */}
        {activeTab === 'AGENCY' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary)', fontWeight: 600, fontSize: '1rem' }}>Informations Générales</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Nom de l'agence" variant="outlined"
                value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="SIRET" variant="outlined"
                value={settings.siret} onChange={(e) => setSettings({ ...settings, siret: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth multiline rows={3} label="Description courte" variant="outlined"
                value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary)', fontWeight: 600, fontSize: '1rem' }}>Coordonnées</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Email de contact" variant="outlined"
                value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Téléphone" variant="outlined"
                value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Site Web" variant="outlined"
                value={settings.website} onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Adresse" variant="outlined"
                value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Ville" variant="outlined"
                value={settings.city} onChange={(e) => setSettings({ ...settings, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Code Postal" variant="outlined"
                value={settings.postalCode} onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
              />
            </Grid>
          </Grid>
        )}

        {/* NOTIFICATIONS FORM */}
        {activeTab === 'NOTIFICATIONS' && (
          <div>
            <Typography variant="h6" sx={{ mb: 3, color: 'var(--primary)', fontWeight: 600 }}>Préférences Email</Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormControlLabel
                control={<Switch checked={notifications.emailAlerts} onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })} />}
                label="Alertes Email (Nouvelles offres, messages)"
              />
              <Divider />
              <FormControlLabel
                control={<Switch checked={notifications.weeklyReport} onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })} />}
                label="Rapport Hebdomadaire (Statistiques)"
              />
              <Divider />
              <FormControlLabel
                control={<Switch checked={notifications.newLeads} onChange={(e) => setNotifications({ ...notifications, newLeads: e.target.checked })} />}
                label="Nouveaux Leads (Vendeurs/Acheteurs)"
              />
            </div>
          </div>
        )}

        {/* PLACEHOLDERS FOR OTHER TABS */}
        {(activeTab === 'SECURITY' || activeTab === 'THEME') && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-tertiary)' }}>
            <SettingsIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
            <Typography>Cette section sera bientôt disponible.</Typography>
          </div>
        )}

      </div>

    </div>
  );
}
