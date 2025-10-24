import { Box, Container, Typography, Button, Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import { useState } from 'react';

// Use same API URL logic as api.ts
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return window.location.origin;
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

export function LoginPage() {
  const [vhbDialogOpen, setVhbDialogOpen] = useState(false);
  const [vhbPassword, setVhbPassword] = useState('');
  const [vhbError, setVhbError] = useState('');
  const [vhbLoading, setVhbLoading] = useState(false);

  const handleTumLogin = () => {
    // Redirect to backend auth endpoint, which will redirect to TUM OIDC
    window.location.href = `${API_BASE_URL}/auth/login?redirect_to=${encodeURIComponent('/')}`;
  };

  const handleVhbLogin = async () => {
    setVhbError('');
    setVhbLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/vhb-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password: vhbPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        setVhbError(error.detail || 'Login fehlgeschlagen');
        setVhbLoading(false);
        return;
      }

      // Login successful, redirect to home
      window.location.href = '/';
    } catch (error) {
      setVhbError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
      setVhbLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 6,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Stack spacing={4} alignItems="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <SchoolIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>

            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              Virtuelles Patientensystem
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 450 }}
            >
              Üben Sie Ihre Anamnesefähigkeiten mit KI-unterstützten virtuellen Patienten
            </Typography>

            <Box
              sx={{
                width: '100%',
                height: 2,
                bgcolor: 'divider',
                my: 2,
              }}
            />

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Bitte melden Sie sich mit Ihrer TUM-Kennung an
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleTumLogin}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                bgcolor: '#0065BD', // TUM Blue
                '&:hover': {
                  bgcolor: '#005099',
                },
              }}
            >
              Mit TUM-Kennung anmelden
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 3, maxWidth: 400 }}
            >
              Sie werden zur sicheren Anmeldeseite der TU München weitergeleitet.
              Nach erfolgreicher Authentifizierung kehren Sie automatisch hierher zurück.
            </Typography>

            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                my: 2,
              }}
            >
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
              <Typography variant="body2" color="text.secondary">
                oder
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
            </Box>

            <Button
              variant="outlined"
              size="large"
              startIcon={<BusinessIcon />}
              onClick={() => setVhbDialogOpen(true)}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                borderColor: '#4CAF50',
                color: '#4CAF50',
                '&:hover': {
                  borderColor: '#45a049',
                  bgcolor: 'rgba(76, 175, 80, 0.04)',
                },
              }}
            >
              VHB Login
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ maxWidth: 400 }}
            >
              Für Nutzer der Virtuellen Hochschule Bayern
            </Typography>
          </Stack>
        </Paper>

        {/* VHB Login Dialog */}
        <Dialog 
          open={vhbDialogOpen} 
          onClose={() => {
            setVhbDialogOpen(false);
            setVhbPassword('');
            setVhbError('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon color="success" />
              <Typography variant="h6">VHB Login</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Bitte geben Sie das VHB-Passwort ein, um sich anzumelden.
              </Typography>
              {vhbError && (
                <Alert severity="error">{vhbError}</Alert>
              )}
              <TextField
                autoFocus
                label="Passwort"
                type="password"
                fullWidth
                value={vhbPassword}
                onChange={(e) => setVhbPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleVhbLogin();
                  }
                }}
                disabled={vhbLoading}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => {
                setVhbDialogOpen(false);
                setVhbPassword('');
                setVhbError('');
              }}
              disabled={vhbLoading}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleVhbLogin}
              variant="contained"
              color="success"
              disabled={vhbLoading || !vhbPassword}
            >
              {vhbLoading ? 'Anmelden...' : 'Anmelden'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

