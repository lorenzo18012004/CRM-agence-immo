import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    MenuItem,
    Grid,
    Chip,
    InputAdornment,
    Typography,
    IconButton
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    CloudUpload as UploadIcon,
    Home as HomeIcon,
    Euro as EuroIcon
} from '@mui/icons-material';

const propertyTypes = [
    { value: 'APARTMENT', label: 'Appartement' },
    { value: 'HOUSE', label: 'Maison' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'STUDIO', label: 'Studio' },
    { value: 'LAND', label: 'Terrain' },
    { value: 'COMMERCIAL', label: 'Local commercial' },
    { value: 'OFFICE', label: 'Bureau' },
];

export default function PropertyNew() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'APARTMENT',
        price: '',
        surface: '',
        rooms: '',
        bedrooms: '',
        bathrooms: '',
        address: '',
        postalCode: '',
        city: '',
        description: ''
    });

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            navigate('/properties');
        }, 1500);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>

            {/* HEADER */}
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <IconButton onClick={() => navigate('/properties')} sx={{ color: 'var(--text-secondary)' }}>
                    <ArrowBackIcon />
                </IconButton>
                <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Gestion des Mandats
                    </div>
                    <h1 className="font-serif" style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>Nouveau Bien</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

                    {/* LEFT COLUMN: MAIN INFO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* General Info */}
                        <div className="glass-panel" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)' }}>
                                <HomeIcon />
                                <h3 style={{ margin: 0, fontWeight: 600 }}>Informations Générales</h3>
                            </div>

                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth label="Titre de l'annonce" variant="outlined"
                                        value={formData.title} onChange={handleChange('title')}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select fullWidth label="Type de bien"
                                        value={formData.type} onChange={handleChange('type')}
                                    >
                                        {propertyTypes.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth label="Prix FAI" type="number"
                                        value={formData.price} onChange={handleChange('price')}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><EuroIcon fontSize="small" /></InputAdornment>
                                        }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth multiline rows={4} label="Description détaillée"
                                        value={formData.description} onChange={handleChange('description')}
                                    />
                                </Grid>
                            </Grid>
                        </div>

                        {/* Specs */}
                        <div className="glass-panel" style={{ padding: '32px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--primary)', fontWeight: 600 }}>Caractéristiques</h3>
                            <Grid container spacing={3}>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        fullWidth label="Surface (m²)" type="number"
                                        value={formData.surface} onChange={handleChange('surface')}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        fullWidth label="Pièces" type="number"
                                        value={formData.rooms} onChange={handleChange('rooms')}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        fullWidth label="Chambres" type="number"
                                        value={formData.bedrooms} onChange={handleChange('bedrooms')}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        fullWidth label="SDB" type="number"
                                        value={formData.bathrooms} onChange={handleChange('bathrooms')}
                                    />
                                </Grid>
                            </Grid>
                        </div>

                        {/* Location */}
                        <div className="glass-panel" style={{ padding: '32px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--primary)', fontWeight: 600 }}>Localisation</h3>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth label="Adresse"
                                        value={formData.address} onChange={handleChange('address')}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth label="Code Postal"
                                        value={formData.postalCode} onChange={handleChange('postalCode')}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth label="Ville"
                                        value={formData.city} onChange={handleChange('city')}
                                    />
                                </Grid>
                            </Grid>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: MEDIA & ACTIONS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Actions */}
                        <div className="glass-panel" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
                            <Button
                                fullWidth variant="contained" size="large" type="submit"
                                startIcon={<SaveIcon />}
                                disabled={loading}
                                sx={{ bgcolor: 'var(--primary)', py: 1.5, mb: 2 }}
                            >
                                {loading ? 'Création...' : 'Valider le Mandat'}
                            </Button>
                            <Button
                                fullWidth variant="outlined"
                                onClick={() => navigate('/properties')}
                                sx={{ borderColor: '#e2e8f0', color: 'var(--text-secondary)' }}
                            >
                                Annuler
                            </Button>
                        </div>

                        {/* Photos Placeholder */}
                        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px', borderColor: '#cbd5e1' }}>
                            <UploadIcon sx={{ fontSize: 48, color: 'var(--text-tertiary)', mb: 2 }} />
                            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Photos du bien</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>Glissez-déposez vos fichiers ici</div>
                        </div>

                    </div>

                </div>
            </form>
        </div>
    );
}
