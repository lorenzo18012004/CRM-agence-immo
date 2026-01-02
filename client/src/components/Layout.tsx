import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArticleIcon from '@mui/icons-material/Article';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TaskIcon from '@mui/icons-material/Task';
import GavelIcon from '@mui/icons-material/Gavel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EmailIcon from '@mui/icons-material/Email';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260; // Slightly wider for premium look

const menuItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Biens', icon: <HomeIcon />, path: '/properties' },
  { text: 'Mandats', icon: <AssignmentIcon />, path: '/mandates' },
  { text: 'Contrats', icon: <DescriptionIcon />, path: '/contracts' },
  { text: 'Offres', icon: <GavelIcon />, path: '/offers' },
  { text: 'Clients', icon: <PeopleIcon />, path: '/clients' },
  { text: 'Documents', icon: <FolderIcon />, path: '/documents' },
  { text: 'Rendez-vous', icon: <CalendarTodayIcon />, path: '/appointments' },
  { text: 'Tâches', icon: <TaskIcon />, path: '/tasks' },
  { text: 'Finances', icon: <AttachMoneyIcon />, path: '/payments' },
  { text: 'Communications', icon: <EmailIcon />, path: '/communications' },
  { text: 'CMS', icon: <ArticleIcon />, path: '/cms' },
  { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/users' },
  { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const drawer = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-card)' }}>
      <Toolbar sx={{ px: 3 }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
          CRM Immobilier
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
      <List sx={{ px: 2, pt: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.08) !important' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  '&:hover': {
                    backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.12)' : 'rgba(0,0,0,0.02)',
                  },
                }}
              >
                <ListItemIcon sx={{
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  minWidth: '40px'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.9rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'var(--bg-app)', // Blend with background or make white
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          color: 'var(--text-primary)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} /> {/* Spacer */}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton size="small" sx={{ color: 'var(--text-secondary)' }}>
              {/* Could add notification icon here */}
              <EmailIcon />
            </IconButton>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{
                bgcolor: 'var(--primary)',
                color: '#fff',
                width: 36,
                height: 36,
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                boxShadow: 'var(--shadow-lg)',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.05)',
              }
            }}
          >
            <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
              <AccountCircleIcon sx={{ mr: 1, color: 'var(--text-secondary)' }} />
              Mon profil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1, color: 'var(--text-secondary)' }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: 'var(--shadow-lg)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(0,0,0,0.05)',
              bgcolor: 'var(--bg-card)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

