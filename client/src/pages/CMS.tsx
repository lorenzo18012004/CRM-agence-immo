import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Article as ArticleIcon,
  Web as PageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Image as ImageIcon,
  Public as PublicIcon
} from '@mui/icons-material';

interface ContentItem {
  id: string;
  title: string;
  status: 'PUBLISHED' | 'DRAFT';
  author: string;
  date: string;
  image?: string;
  views?: number;
}

const MOCK_PAGES: ContentItem[] = [
  { id: '1', title: 'Accueil', status: 'PUBLISHED', author: 'Admin', date: '2024-01-10', views: 15400 },
  { id: '2', title: 'Nos Agences', status: 'PUBLISHED', author: 'Admin', date: '2024-01-12', views: 8200 },
  { id: '3', title: 'Recrutement', status: 'DRAFT', author: 'HR', date: '2024-03-01', views: 0 },
];

const MOCK_POSTS: ContentItem[] = [
  { id: '1', title: 'Tendances Immobilier Luxe 2024', status: 'PUBLISHED', author: 'Sophie Martin', date: '2024-03-15', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', views: 1200 },
  { id: '2', title: 'Investir à Cannes : Les quartiers porteurs', status: 'DRAFT', author: 'Jean Dupont', date: '2024-03-20', image: 'https://images.unsplash.com/photo-1534234828563-0259772ee54f', views: 0 },
];

export default function CMS() {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderContentCard = (item: ContentItem, type: 'PAGE' | 'POST') => (
    <div key={item.id} className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Visual Header */}
      <div style={{
        height: type === 'POST' ? '160px' : '60px',
        background: item.image ? `url(${item.image}) center/cover` : 'var(--primary)',
        position: 'relative'
      }}>
        {(!item.image && type === 'POST') && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.3)' }}>
            <ImageIcon sx={{ fontSize: 48 }} />
          </div>
        )}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <Chip
            label={item.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
            size="small"
            sx={{
              bgcolor: item.status === 'PUBLISHED' ? 'var(--success-color)' : 'rgba(0,0,0,0.5)',
              color: '#fff', fontWeight: 600, backdropFilter: 'blur(4px)'
            }}
          />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {type === 'PAGE' ? <PageIcon fontSize="inherit" /> : <ArticleIcon fontSize="inherit" />}
          {type === 'PAGE' ? 'Page' : 'Article'}
        </div>

        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: 'var(--primary)', lineHeight: 1.3 }}>{item.title}</h3>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div>Par {item.author}</div>
          <div>{item.date}</div>
        </div>
      </div>

      {/* Actions Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ViewIcon fontSize="inherit" /> {item.views} vues
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <IconButton size="small" sx={{ color: 'var(--primary)' }}> <EditIcon fontSize="small" /> </IconButton>
          <IconButton size="small" sx={{ color: 'var(--danger-color)' }}> <DeleteIcon fontSize="small" /> </IconButton>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <PublicIcon fontSize="small" /> Site Web
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Contenu (CMS)</h1>
        </div>
        <div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
          >
            {tabValue === 0 ? 'Nouvelle Page' : 'Nouvel Article'}
          </Button>
        </div>
      </div>

      {/* TABS */}
      <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleChange} textColor="primary" indicatorColor="primary">
          <Tab label="Pages (3)" sx={{ textTransform: 'none', fontSize: '1rem' }} />
          <Tab label="Blog / Articles (2)" sx={{ textTransform: 'none', fontSize: '1rem' }} />
        </Tabs>
      </Box>

      {/* CONTENT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {tabValue === 0
          ? MOCK_PAGES.map(page => renderContentCard(page, 'PAGE'))
          : MOCK_POSTS.map(post => renderContentCard(post, 'POST'))
        }
      </div>

    </div>
  );
}
