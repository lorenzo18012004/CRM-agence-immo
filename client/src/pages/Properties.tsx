import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Bed as BedIcon,
  Bathtub as BathIcon,
  SquareFoot as SurfaceIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Property } from '../types';

const PropertyCard = ({ property, onClick }: { property: Property & { photos?: any[] }, onClick: () => void }) => {
  // Get first photo URL or placeholder
  const imageUrl = property.photos && property.photos.length > 0
    ? property.photos[0].url
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div
      className="glass-panel"
      style={{
        overflow: 'hidden', padding: 0, cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s',
        position: 'relative'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image Container */}
      <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={imageUrl}
          alt={property.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
        />
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
          {property.type}
        </div>
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          {property.status === 'SOLD' && <Chip label="VENDU" size="small" sx={{ bgcolor: 'var(--danger-color)', color: '#fff', fontWeight: 700 }} />}
          {property.status === 'PENDING' && <Chip label="OFFRE EN COURS" size="small" sx={{ bgcolor: 'var(--warning-color)', color: '#fff', fontWeight: 700 }} />}
          {property.status === 'RENTED' && <Chip label="LOUÉ" size="small" sx={{ bgcolor: 'var(--text-secondary)', color: '#fff', fontWeight: 700 }} />}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 className="font-serif" style={{ fontSize: '1.2rem', margin: 0, color: 'var(--primary)', lineHeight: 1.2 }}>{property.title}</h3>
          <div className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
          <LocationIcon fontSize="inherit" />
          {property.city} ({property.postalCode})
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            <SurfaceIcon fontSize="small" sx={{ color: 'var(--text-tertiary)' }} /> {property.surface}m²
          </div>
          {(property.bedrooms || 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              <BedIcon fontSize="small" sx={{ color: 'var(--text-tertiary)' }} /> {property.bedrooms}
            </div>
          )}
          {(property.bathrooms || 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              <BathIcon fontSize="small" sx={{ color: 'var(--text-tertiary)' }} /> {property.bathrooms}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// --- MOCK DATA ---
// --- MOCK DATA ---
const createMockProperty = (data: any): Property => ({
  ...data,
  address: '123 Avenue de la République',
  country: 'France',
  hasElevator: data.hasElevator ?? false,
  hasParking: data.hasParking ?? true,
  hasBalcony: data.hasBalcony ?? true,
  hasGarden: data.hasGarden ?? false,
  rooms: 5,
  floor: 2,
  yearBuilt: 2010,
  energyClass: 'A',
  co2Emission: 10,
  reference: `REF-${data.id.padStart(3, '0')}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  photos: data.photos
});

const MOCK_PROPERTIES: Property[] = [
  createMockProperty({
    id: '1', title: 'Villa Contemporaine Cannes', type: 'VILLA', price: 4500000,
    surface: 350, bedrooms: 5, bathrooms: 4, city: 'Cannes', postalCode: '06400',
    status: 'AVAILABLE', description: 'Magnifique villa...',
    hasGarden: true, hasParking: true,
    photos: [{ id: 'p1', url: 'https://images.unsplash.com/photo-1613490493576-2f5037657911?auto=format&fit=crop&w=800&q=80', filename: 'villa.jpg', isMain: true, order: 1 }]
  }),
  createMockProperty({
    id: '2', title: 'Penthouse Vue Mer', type: 'APARTMENT', price: 2800000,
    surface: 180, bedrooms: 3, bathrooms: 2, city: 'Nice', postalCode: '06000',
    status: 'PENDING', description: 'Vue imprenable...',
    hasElevator: true,
    photos: [{ id: 'p2', url: 'https://images.unsplash.com/photo-1512918760533-507d06f9d769?auto=format&fit=crop&w=800&q=80', filename: 'penthouse.jpg', isMain: true, order: 1 }]
  }),
  createMockProperty({
    id: '3', title: 'Bastide Provençale', type: 'HOUSE', price: 1850000,
    surface: 240, bedrooms: 4, bathrooms: 3, city: 'Mougins', postalCode: '06250',
    status: 'SOLD', description: 'Charme authentique...',
    hasGarden: true,
    photos: [{ id: 'p3', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', filename: 'bastide.jpg', isMain: true, order: 1 }]
  }),
  createMockProperty({
    id: '4', title: 'Loft Industriel', type: 'APARTMENT', price: 950000,
    surface: 120, bedrooms: 2, bathrooms: 2, city: 'Antibes', postalCode: '06600',
    status: 'AVAILABLE', description: 'Design unique...',
    photos: [{ id: 'p4', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', filename: 'loft.jpg', isMain: true, order: 1 }]
  })
];

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, [filterType]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.append('type', filterType);
      if (searchQuery) params.append('search', searchQuery);

      const response = await axios.get(`/properties?${params.toString()}`);
      setProperties(response.data.properties || []);
    } catch (error: any) {
      console.warn('API not available (Demo Mode), using Mock Data');
      // Filter mocks locally since API failed
      let mocks = MOCK_PROPERTIES;
      if (filterType !== 'ALL') mocks = mocks.filter(p => p.type === filterType);
      if (searchQuery) mocks = mocks.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
      setProperties(mocks);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Debounce search
    setTimeout(() => {
      fetchProperties();
    }, 500);
  };

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
            Portefeuille
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Biens d'Exception</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
            onClick={() => navigate('/properties/new')}
          >
            Nouveau Bien
          </Button>
        </div>
      </div>

      {/* FILTERS & CONTROLS */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher..."
            variant="standard"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              disableUnderline: true
            }}
            sx={{ minWidth: 200 }}
          />
          <Tabs value={filterType} onChange={(_e, v) => setFilterType(v)} textColor="inherit" indicatorColor="primary">
            <Tab label="Tous" value="ALL" sx={{ textTransform: 'none' }} />
            <Tab label="Villas" value="VILLA" sx={{ textTransform: 'none' }} />
            <Tab label="Appartements" value="APARTMENT" sx={{ textTransform: 'none' }} />
            <Tab label="Maisons" value="HOUSE" sx={{ textTransform: 'none' }} />
            <Tab label="Terrains" value="LAND" sx={{ textTransform: 'none' }} />
            <Tab label="Bureaux" value="OFFICE" sx={{ textTransform: 'none' }} />
            <Tab label="Commerciaux" value="COMMERCIAL" sx={{ textTransform: 'none' }} />
          </Tabs>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <IconButton onClick={() => setViewMode('grid')} color={viewMode === 'grid' ? 'primary' : 'default'}><GridViewIcon /></IconButton>
          <IconButton onClick={() => setViewMode('list')} color={viewMode === 'list' ? 'primary' : 'default'}><ViewListIcon /></IconButton>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <Typography variant="h6" style={{ marginBottom: '8px' }}>Aucun bien trouvé</Typography>
            <Typography variant="body2">Essayez de modifier vos filtres ou créez un nouveau bien.</Typography>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} onClick={() => navigate(`/properties/${property.id}`)} />
            ))}
          </div>
        )
      ) : (
        /* LIST VIEW */
        <div className="glass-panel" style={{ padding: '0' }}>
          {properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <Typography variant="h6" style={{ marginBottom: '8px' }}>Aucun bien trouvé</Typography>
              <Typography variant="body2">Essayez de modifier vos filtres ou créez un nouveau bien.</Typography>
            </div>
          ) : (
            properties.map((property: Property & { photos?: any[] }) => {
              const imageUrl = property.photos && property.photos.length > 0
                ? property.photos[0].url
                : 'https://via.placeholder.com/400x300?text=No+Image';
              return (
                <div key={property.id} style={{ display: 'flex', padding: '16px', borderBottom: '1px solid #e2e8f0', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/properties/${property.id}`)}>
                  <div style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', marginRight: 16 }}>
                    <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{property.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{property.city}</div>
                  </div>
                  <div className="font-serif" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
