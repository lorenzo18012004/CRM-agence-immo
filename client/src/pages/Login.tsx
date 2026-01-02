import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

export default function Login() {
  const [step, setStep] = useState<'agency' | 'credentials'>('agency');
  const [agencyCode, setAgencyCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agency, setAgency] = useState<any>(null);
  const { verifyAgency, login } = useAuth();
  const navigate = useNavigate();

  // Vérifier si on a déjà un code agence en localStorage
  useEffect(() => {
    const storedAgencyCode = localStorage.getItem('agencyCode');
    if (storedAgencyCode) {
      setAgencyCode(storedAgencyCode);
      handleVerifyAgency(storedAgencyCode);
    }
  }, []);

  const handleVerifyAgency = async (code?: string) => {
    const codeToVerify = code || agencyCode;
    if (!codeToVerify) return;

    setError('');
    setLoading(true);

    try {
      const agencyData = await verifyAgency(codeToVerify);
      setAgency(agencyData);
      setStep('credentials');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Code agence invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleVerifyAgency();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, agencyCode);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('agency');
    setEmail('');
    setPassword('');
    setError('');
    setAgency(null);
  };

  if (step === 'agency') {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              CRM Immobilier
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Entrez le code de votre agence
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleAgencySubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="agencyCode"
                label="Code agence"
                name="agencyCode"
                autoFocus
                value={agencyCode}
                onChange={(e) => setAgencyCode(e.target.value)}
                placeholder="Ex: 6165"
                inputProps={{ maxLength: 10 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Continuer'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            {agency?.name || 'CRM Immobilier'}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1 }}>
            Code agence: {agencyCode}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Connectez-vous à votre compte
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 1 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Se connecter'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={handleBack}
              sx={{ mt: 1 }}
              disabled={loading}
            >
              Retour
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
