import { Box, Typography, Button } from '@mui/material';
import { Home } from '@mui/icons-material';

interface SessionInfoProps {
  caseTitle: string;
  sessionId: string;
  onReset: () => void;
}

export function SessionInfo({ caseTitle, onReset }: SessionInfoProps) {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
        borderBottom: '1px solid',
        borderColor: 'primary.light',
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          component="h2"
          sx={{ 
            fontWeight: 600,
            color: 'primary.dark',
          }}
        >
          {caseTitle}
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={onReset}
          size="small"
          sx={{
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Neuer Fall
        </Button>
      </Box>
    </Box>
  );
}

