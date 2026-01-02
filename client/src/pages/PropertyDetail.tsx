import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Property } from '../types';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'APARTMENT' as Property['type'],
    status: 'AVAILABLE' as Property['status'],
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    price: 0,
    surface: 0,
    rooms: 0,
    bedrooms: 0,
    bathrooms: 0,
    floor: 0,
    hasElevator: false,
    hasParking: false,
    hasBalcony: false,
    hasGarden: false,
    yearBuilt: 0,
    energyClass: '',
    co2Emission: 0,
  });

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/properties/${id}`);
      const prop = response.data;
      setProperty(prop);
      setFormData({
        title: prop.title || '',
        description: prop.description || '',
        type: prop.type || 'APARTMENT',
        status: prop.status || 'AVAILABLE',
        address: prop.address || '',
        city: prop.city || '',
        postalCode: prop.postalCode || '',
        country: prop.country || 'France',
        price: prop.price || 0,
        surface: prop.surface || 0,
        rooms: prop.rooms || 0,
        bedrooms: prop.bedrooms || 0,
        bathrooms: prop.bathrooms || 0,
        floor: prop.floor || 0,
        hasElevator: prop.hasElevator || false,
        hasParking: prop.hasParking || false,
        hasBalcony: prop.hasBalcony || false,
        hasGarden: prop.hasGarden || false,
        yearBuilt: prop.yearBuilt || 0,
        energyClass: prop.energyClass || '',
        co2Emission: prop.co2Emission || 0,
      });
    } catch (error: any) {
      console.error('Error fetching property:', error);
      setError(error.response?.data?.error || 'Erreur lors du chargement du bien');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const { data } = await axios.put(`/properties/${id}`, formData);
      setProperty(data);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error updating property:', error);
      setError(error.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        type: property.type || 'APARTMENT',
        status: property.status || 'AVAILABLE',
        address: property.address || '',
        city: property.city || '',
        postalCode: property.postalCode || '',
        country: property.country || 'France',
        price: property.price || 0,
        surface: property.surface || 0,
        rooms: property.rooms || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        floor: property.floor || 0,
        hasElevator: property.hasElevator || false,
        hasParking: property.hasParking || false,
        hasBalcony: property.hasBalcony || false,
        hasGarden: property.hasGarden || false,
        yearBuilt: property.yearBuilt || 0,
        energyClass: property.energyClass || '',
        co2Emission: property.co2Emission || 0,
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 10MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post(`/properties/${id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh property data
      await fetchProperty();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      setError(error.response?.data?.error || 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      return;
    }

    try {
      setError(null);
      await axios.delete(`/properties/${id}/photos/${photoId}`);
      await fetchProperty();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      setError(error.response?.data?.error || 'Erreur lors de la suppression de la photo');
    }
  };

  const handleSetMainPhoto = async (photoId: string) => {
    try {
      setError(null);
      await axios.patch(`/properties/${id}/photos/${photoId}/set-main`);
      await fetchProperty();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error setting main photo:', error);
      setError(error.response?.data?.error || 'Erreur lors de la définition de la photo principale');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: 'var(--primary)' }} />
      </Box>
    );
  }

  if (!property) {
    return (
      <Box p={4}>
        <Typography color="error">Bien non trouvé</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/properties')} sx={{ mt: 2 }}>
          Retour
        </Button>
      </Box>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/properties')}
          sx={{ color: 'var(--text-secondary)', textTransform: 'none' }}
        >
          Retour
        </Button>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!isEditing ? (
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              onClick={() => setIsEditing(true)}
              sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
            >
              Modifier
            </Button>
          ) : (
            <>
              <Button
                startIcon={<CancelIcon />}
                variant="outlined"
                onClick={handleCancel}
                sx={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', textTransform: 'none', px: 3 }}
              >
                Annuler
              </Button>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{ bgcolor: 'var(--primary)', borderRadius: '50px', textTransform: 'none', px: 3 }}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)} sx={{ mb: 2 }}>
          Bien mis à jour avec succès
        </Alert>
      )}

      {/* Main Content */}
      <div className="glass-panel" style={{ padding: '40px' }}>
        {/* Title and Status */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <TextField
                fullWidth
                label="Titre"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="h4" className="font-serif" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                {property.title}
              </Typography>
            )}
            <Typography variant="body1" style={{ color: 'var(--text-secondary)' }}>
              Référence: {property.reference}
            </Typography>
          </div>
          <div>
            {isEditing ? (
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  label="Statut"
                >
                  <MenuItem value="AVAILABLE">Disponible</MenuItem>
                  <MenuItem value="SOLD">Vendu</MenuItem>
                  <MenuItem value="RENTED">Loué</MenuItem>
                  <MenuItem value="PENDING">En attente</MenuItem>
                  <MenuItem value="WITHDRAWN">Retiré</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Chip
                label={property.status === 'AVAILABLE' ? 'Disponible' : property.status === 'SOLD' ? 'Vendu' : property.status === 'RENTED' ? 'Loué' : property.status === 'PENDING' ? 'En attente' : 'Retiré'}
                color={property.status === 'AVAILABLE' ? 'success' : property.status === 'SOLD' ? 'error' : 'default'}
                sx={{ fontWeight: 600 }}
              />
            )}
          </div>
        </div>

        {/* Photos Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Typography variant="h6" style={{ color: 'var(--primary)' }}>
              Photos ({property.photos?.length || 0})
            </Typography>
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              <Button
                startIcon={<AddPhotoIcon />}
                variant="outlined"
                component="span"
                disabled={uploading}
                sx={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', textTransform: 'none' }}
              >
                {uploading ? 'Upload en cours...' : 'Ajouter une photo'}
              </Button>
            </label>
          </div>

          {property.photos && property.photos.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {property.photos.map((photo: any) => (
                <div
                  key={photo.id}
                  style={{
                    position: 'relative',
                    aspectRatio: '4/3',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: photo.isMain ? '3px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  }}
                >
                  <img
                    src={photo.url.startsWith('http') ? photo.url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${photo.url}`}
                    alt="Property photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '12px',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleSetMainPhoto(photo.id)}
                        sx={{
                          bgcolor: photo.isMain ? 'var(--accent-gold)' : 'rgba(255,255,255,0.9)',
                          color: photo.isMain ? '#fff' : 'var(--text-primary)',
                          '&:hover': { bgcolor: photo.isMain ? 'var(--accent-gold)' : 'rgba(255,255,255,1)' },
                        }}
                      >
                        {photo.isMain ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePhoto(photo.id)}
                        sx={{
                          bgcolor: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          '&:hover': { bgcolor: 'rgba(239, 68, 68, 1)' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                    {photo.isMain && (
                      <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
                        Photo principale
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
              <AddPhotoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1" style={{ marginBottom: '8px' }}>
                Aucune photo
              </Typography>
              <Typography variant="body2">
                Ajoutez des photos pour mettre en valeur votre bien
              </Typography>
            </div>
          )}
        </div>

        <Grid container spacing={3}>
          {/* Left Column - Main Info */}
          <Grid item xs={12} md={8}>
            {/* Description */}
            <div style={{ marginBottom: '32px' }}>
              <Typography variant="h6" style={{ color: 'var(--primary)', marginBottom: '16px' }}>
                Description
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              ) : (
                <Typography variant="body1" style={{ color: 'var(--text-secondary)' }}>
                  {property.description || 'Aucune description'}
                </Typography>
              )}
            </div>

            {/* Characteristics */}
            <div style={{ marginBottom: '32px' }}>
              <Typography variant="h6" style={{ color: 'var(--primary)', marginBottom: '16px' }}>
                Caractéristiques
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                    Type
                  </Typography>
                  {isEditing ? (
                    <FormControl fullWidth>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                      >
                        <MenuItem value="APARTMENT">Appartement</MenuItem>
                        <MenuItem value="HOUSE">Maison</MenuItem>
                        <MenuItem value="VILLA">Villa</MenuItem>
                        <MenuItem value="STUDIO">Studio</MenuItem>
                        <MenuItem value="LAND">Terrain</MenuItem>
                        <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                        <MenuItem value="OFFICE">Bureau</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="body1">{property.type}</Typography>
                  )}
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                    Surface
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      type="number"
                      value={formData.surface}
                      onChange={(e) => handleChange('surface', parseFloat(e.target.value) || 0)}
                      InputProps={{ endAdornment: 'm²' }}
                    />
                  ) : (
                    <Typography variant="body1">{property.surface} m²</Typography>
                  )}
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                    Pièces
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      type="number"
                      value={formData.rooms}
                      onChange={(e) => handleChange('rooms', parseInt(e.target.value) || 0)}
                    />
                  ) : (
                    <Typography variant="body1">{property.rooms || '-'}</Typography>
                  )}
                </Grid>
                {property.bedrooms !== undefined && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                      Chambres
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <Typography variant="body1">{property.bedrooms || '-'}</Typography>
                    )}
                  </Grid>
                )}
                {property.bathrooms !== undefined && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                      Salles de bain
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        type="number"
                        value={formData.bathrooms}
                        onChange={(e) => handleChange('bathrooms', parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <Typography variant="body1">{property.bathrooms || '-'}</Typography>
                    )}
                  </Grid>
                )}
                {property.floor !== undefined && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                      Étage
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        type="number"
                        value={formData.floor}
                        onChange={(e) => handleChange('floor', parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <Typography variant="body1">{property.floor || '-'}</Typography>
                    )}
                  </Grid>
                )}
              </Grid>
            </div>

            {/* Features */}
            <div style={{ marginBottom: '32px' }}>
              <Typography variant="h6" style={{ color: 'var(--primary)', marginBottom: '16px' }}>
                Équipements
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  {isEditing ? (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasElevator}
                          onChange={(e) => handleChange('hasElevator', e.target.checked)}
                        />
                      }
                      label="Ascenseur"
                    />
                  ) : (
                    <Typography variant="body1">
                      {property.hasElevator ? '✓ Ascenseur' : '✗ Ascenseur'}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={6} sm={3}>
                  {isEditing ? (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasParking}
                          onChange={(e) => handleChange('hasParking', e.target.checked)}
                        />
                      }
                      label="Parking"
                    />
                  ) : (
                    <Typography variant="body1">
                      {property.hasParking ? '✓ Parking' : '✗ Parking'}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={6} sm={3}>
                  {isEditing ? (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasBalcony}
                          onChange={(e) => handleChange('hasBalcony', e.target.checked)}
                        />
                      }
                      label="Balcon"
                    />
                  ) : (
                    <Typography variant="body1">
                      {property.hasBalcony ? '✓ Balcon' : '✗ Balcon'}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={6} sm={3}>
                  {isEditing ? (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasGarden}
                          onChange={(e) => handleChange('hasGarden', e.target.checked)}
                        />
                      }
                      label="Jardin"
                    />
                  ) : (
                    <Typography variant="body1">
                      {property.hasGarden ? '✓ Jardin' : '✗ Jardin'}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </div>

            {/* Energy Info */}
            {(property.yearBuilt || property.energyClass) && (
              <div>
                <Typography variant="h6" style={{ color: 'var(--primary)', marginBottom: '16px' }}>
                  Informations énergétiques
                </Typography>
                <Grid container spacing={2}>
                  {property.yearBuilt && (
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                        Année de construction
                      </Typography>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          type="number"
                          value={formData.yearBuilt}
                          onChange={(e) => handleChange('yearBuilt', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        <Typography variant="body1">{property.yearBuilt}</Typography>
                      )}
                    </Grid>
                  )}
                  {property.energyClass && (
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                        Classe énergétique
                      </Typography>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          value={formData.energyClass}
                          onChange={(e) => handleChange('energyClass', e.target.value)}
                        />
                      ) : (
                        <Typography variant="body1">{property.energyClass}</Typography>
                      )}
                    </Grid>
                  )}
                </Grid>
              </div>
            )}
          </Grid>

          {/* Right Column - Price and Address */}
          <Grid item xs={12} md={4}>
            <div className="glass-panel" style={{ padding: '24px', position: 'sticky', top: '20px' }}>
              <Typography variant="h5" className="font-serif" style={{ color: 'var(--primary)', marginBottom: '16px' }}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    type="number"
                    label="Prix"
                    value={formData.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: '€',
                    }}
                  />
                ) : (
                  new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(property.price)
                )}
              </Typography>

              <div style={{ marginBottom: '16px' }}>
                {isEditing ? (
                  <>
                    <TextField
                      fullWidth
                      label="Adresse"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Code postal"
                          value={formData.postalCode}
                          onChange={(e) => handleChange('postalCode', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Ville"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      fullWidth
                      label="Pays"
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      sx={{ mt: 2 }}
                    />
                  </>
                ) : (
                  <>
                    <Typography variant="body2" style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {property.address}
                    </Typography>
                    <Typography variant="body2" style={{ color: 'var(--text-secondary)' }}>
                      {property.postalCode} {property.city}
                    </Typography>
                    {property.country && (
                      <Typography variant="body2" style={{ color: 'var(--text-secondary)' }}>
                        {property.country}
                      </Typography>
                    )}
                  </>
                )}
              </div>

              {property.user && (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                  <Typography variant="body2" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                    Agent responsable
                  </Typography>
                  <Typography variant="body1" style={{ color: 'var(--text-primary)' }}>
                    {property.user.firstName} {property.user.lastName}
                  </Typography>
                </div>
              )}
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
