import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert } from '@mui/material';
import { CaseSelector } from '@/components/CaseSelector';
import { useSession } from '@/hooks/useSession';

export function CaseSelectionPage() {
  const navigate = useNavigate();
  const { createSession, isLoading, error } = useSession();

  const handleCaseSelect = async (caseId: string) => {
    const sessionId = await createSession(caseId);
    
    if (sessionId) {
      // Navigate to chat page with sessionId and caseId
      navigate(`/chat/${sessionId}`, { state: { caseId } });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center" 
          sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}
        >
          Virtuelles Patientensystem
        </Typography>
        <Typography 
          variant="h6" 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 4, fontWeight: 400 }}
        >
          Üben Sie Ihre Anamnesefähigkeiten mit KI-unterstützten virtuellen Patienten
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: 'md', mx: 'auto' }}>
            {error} - Bitte stellen Sie sicher, dass der Backend-Server läuft.
          </Alert>
        )}
      </Box>
      
      <CaseSelector 
        onCaseSelect={handleCaseSelect}
        isLoading={isLoading}
      />
    </Container>
  );
}

