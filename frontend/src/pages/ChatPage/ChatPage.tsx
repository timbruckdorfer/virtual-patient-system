import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import { ChatInterface } from '@/components/ChatInterface';

export function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get caseId from navigation state, fallback to 'unknown'
  const caseId = location.state?.caseId || 'unknown';

  const handleReset = () => {
    navigate('/');
  };

  // If no sessionId, redirect to home
  if (!sessionId) {
    navigate('/');
    return null;
  }

  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 80px)', // Full height minus header
        display: 'flex',
        justifyContent: 'center',
        px: 2,
        py: 2,
      }}
    >
      <Paper 
        elevation={4} 
        sx={{ 
          overflow: 'hidden',
          borderRadius: 2,
          width: '100%',
          maxWidth: 1400,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ChatInterface 
          sessionId={sessionId}
          caseId={caseId}
          onReset={handleReset}
        />
      </Paper>
    </Box>
  );
}

