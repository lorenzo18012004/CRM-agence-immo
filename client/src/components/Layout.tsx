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
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Folder as FolderIcon,
  CalendarToday as CalendarIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Assignment as AssignmentIcon,
  Task as TaskIcon,
  Gavel as GavelIcon,
  AttachMoney as MoneyIcon,
  Email as EmailIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Business as AgencyIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH_OPEN = 280;
const DRAWER_WIDTH_COLLAPSED = 88;

const menuItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' }, // Added AnalyticsIcon import below if missing? No, I need to check imports.
  { text: 'Biens', icon: <HomeIcon />, path: '/properties' },
  { text: 'Mandats', icon: <AssignmentIcon />, path: '/mandates' },
  { text: 'Contrats', icon: <DescriptionIcon />, path: '/contracts' },
  { text: 'Offres', icon: <GavelIcon />, path: '/offers' },
  { text: 'Clients', icon: <PeopleIcon />, path: '/clients' },
  { text: 'Documents', icon: <FolderIcon />, path: '/documents' },
  { text: 'Rendez-vous', icon: <CalendarIcon />, path: '/appointments' },
  { text: 'Tâches', icon: <TaskIcon />, path: '/tasks' },
  { text: 'Finances', icon: <MoneyIcon />, path: '/payments' },
  { text: 'Communications', icon: <EmailIcon />, path: '/communications' },
  { text: 'CMS', icon: <ArticleIcon />, path: '/cms' },
  { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/users' },
  { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings' },
];


export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  // Logic to handle drawer toggle (Mobile vs Desktop Collapse)
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
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

  const currentWidth = isDesktop ? (isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_OPEN) : DRAWER_WIDTH_OPEN;

  const drawerContent = (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0f172a', // Midnight Blue (Primary)
      color: '#fff',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* HEADER / BRAND */}
      <div style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        padding: isCollapsed ? '0' : '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <div style={{ minWidth: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <AgencyIcon />
            </div>
            <div style={{ whiteSpace: 'nowrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, letterSpacing: '0.5px' }}>LUXE IMMO</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', fontSize: '0.65rem' }}>PRESTIGE</Typography>
            </div>
          </div>
        ) : (
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <AgencyIcon />
          </div>
        )}

        {/* Collapse Button (Desktop Only) */}
        {!isCollapsed && isDesktop && (
          <IconButton onClick={handleCollapseToggle} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#fff' } }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </div>

      {/* MENU ITEMS */}
      <List sx={{ px: isCollapsed ? 1.5 : 2, pt: 3, flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <Tooltip key={item.text} title={isCollapsed ? item.text : ''} placement="right" arrow>
              <ListItem disablePadding sx={{ mb: 1, display: 'block' }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    navigate(item.path);
                    if (!isDesktop) setMobileOpen(false);
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: isCollapsed ? 'center' : 'initial',
                    borderRadius: '12px',
                    px: 2.5,
                    backgroundColor: isSelected ? 'rgba(217, 119, 6, 0.15) !important' : 'transparent', // Gold tint
                    borderLeft: isSelected && !isCollapsed ? '4px solid #d97706' : '4px solid transparent',
                    color: isSelected ? '#d97706' : 'rgba(255,255,255,0.7)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      '& .MuiListItemIcon-root': { color: '#fff' }
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isCollapsed ? 0 : 2,
                      justifyContent: 'center',
                      color: isSelected ? '#d97706' : 'rgba(255,255,255,0.5)',
                      transition: 'color 0.2s'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: isCollapsed ? 0 : 1,
                      display: isCollapsed ? 'none' : 'block',
                      transition: 'opacity 0.2s'
                    }}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '0.9rem',
                      fontFamily: isSelected ? 'var(--font-serif)' : 'inherit',
                      letterSpacing: isSelected ? '0.5px' : 'normal'
                    }}
                  />
                  {isSelected && !isCollapsed && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#d97706', marginLeft: 'auto' }}></div>
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* FOOTER TOGGLE (Collapsed mode expand button) */}
      {isCollapsed && isDesktop && (
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <IconButton onClick={handleCollapseToggle} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}>
            <ChevronRightIcon />
          </IconButton>
        </div>
      )}

      {/* USER PROFILE (Condensed) */}
      <div style={{ padding: isCollapsed ? '20px 0' : '24px', borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '16px' }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#d97706', color: '#fff', fontWeight: 700, border: '2px solid rgba(255,255,255,0.1)' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                {user?.role || 'Agent'}
              </Typography>
            </div>
          )}
          {!isCollapsed && (
            <IconButton size="small" onClick={handleLogout} sx={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#d97706' } }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>

    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* MOBILE DRAWER */}
      <Box component="nav" sx={{ width: { sm: currentWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s ease' }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH_OPEN, border: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* DESKTOP PERMANENT DRAWER */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentWidth,
              border: 'none',
              overflowX: 'hidden',
              transition: 'width 0.3s ease'
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${currentWidth}px)` },
          transition: 'width 0.3s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* TOP BAR (Minimalist, mostly for mobile toggle) */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, display: { sm: 'none' } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: 'var(--primary)' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: 'var(--primary)', fontWeight: 700 }}>LUXE IMMO</Typography>
        </Box>

        <Outlet />
      </Box>
    </Box>
  );
}
