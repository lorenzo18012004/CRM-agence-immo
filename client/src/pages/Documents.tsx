import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Upload as UploadIcon,
  Search as SearchIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Document {
  id: string;
  originalName: string;
  type: string;
  size: number;
  createdAt: string;
  path: string;
}

// --- MOCK DATA ---
const MOCK_DOCUMENTS: Document[] = [
  { id: '1', originalName: 'Contrat_Vente_Villa_Cannes.pdf', type: 'CONTRACT', size: 2400000, createdAt: '2024-03-10T10:00:00', path: '/docs/1' },
  { id: '2', originalName: 'Diagnostic_DPE_Appt_Nice.pdf', type: 'PROPERTY_DOC', size: 1500000, createdAt: '2024-02-28T14:30:00', path: '/docs/2' },
  { id: '3', originalName: 'Photo_Facades.jpg', type: 'PHOTO', size: 3800000, createdAt: '2024-03-15T09:15:00', path: '/docs/3' },
  { id: '4', originalName: 'Identite_Acquereur_Dupont.pdf', type: 'IDENTITY', size: 850000, createdAt: '2024-01-20T11:45:00', path: '/docs/4' },
];

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    // Simulate Fetch
    setTimeout(() => {
      setDocuments(MOCK_DOCUMENTS);
      setLoading(false);
    }, 800);
  }, []);

  const getIcon = (type: string) => {
    if (type.includes('PDF') || type === 'CONTRACT' || type === 'IDENTITY') return <PdfIcon sx={{ fontSize: 40, color: '#ef4444' }} />;
    if (type.includes('PHOTO') || type === 'JPG' || type === 'PNG') return <ImageIcon sx={{ fontSize: 40, color: '#3b82f6' }} />;
    return <FileIcon sx={{ fontSize: 40, color: 'var(--text-secondary)' }} />;
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || d.type === filterType;
    return matchesSearch && matchesType;
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
            <FolderIcon fontSize="small" /> Bibliothèque
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Documents</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
            component="label"
          >
            Uploader
            <input type="file" hidden />
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher un fichier..."
            variant="standard"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              disableUnderline: true
            }}
            sx={{ minWidth: 250 }}
          />
          <Tabs value={filterType} onChange={(_e, v) => setFilterType(v)} textColor="inherit" indicatorColor="primary">
            <Tab label="Tous" value="ALL" sx={{ textTransform: 'none' }} />
            <Tab label="Contrats" value="CONTRACT" sx={{ textTransform: 'none' }} />
            <Tab label="Identité" value="IDENTITY" sx={{ textTransform: 'none' }} />
            <Tab label="Photos" value="PHOTO" sx={{ textTransform: 'none' }} />
          </Tabs>
        </div>
      </div>

      {/* GRID VIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="glass-panel"
            style={{
              padding: '24px',
              position: 'relative',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* Options Menu */}
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <IconButton size="small" onClick={handleMenuClick}>
                <MoreIcon fontSize="small" />
              </IconButton>
            </div>

            {/* Icon */}
            <div style={{
              width: 80, height: 80, borderRadius: '16px',
              background: 'rgba(15, 23, 42, 0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '8px'
            }}>
              {getIcon(doc.type)}
            </div>

            {/* Info */}
            <div style={{ width: '100%' }}>
              <div style={{
                fontWeight: 600, color: 'var(--primary)',
                marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                fontSize: '0.95rem'
              }}>
                {doc.originalName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                {(doc.size / 1024 / 1024).toFixed(2)} MB • {format(new Date(doc.createdAt), 'dd MMM yyyy', { locale: fr })}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: '12px', boxShadow: 'var(--shadow-lg)' } }}
      >
        <MenuItem onClick={handleMenuClose} disableRipple>
          <DownloadIcon fontSize="small" sx={{ mr: 1.5, color: 'var(--text-secondary)' }} /> Télécharger
        </MenuItem>
        <MenuItem onClick={handleMenuClose} disableRipple sx={{ color: 'var(--danger-color)' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Supprimer
        </MenuItem>
      </Menu>

    </div>
  );
}
