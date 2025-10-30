import { Box, Typography, Button, Tooltip, CircularProgress } from '@mui/material';
import { Home, Assessment } from '@mui/icons-material';

interface SessionInfoProps {
  caseTitle: string;
  sessionId: string;
  messageCount: number;
  onReset: () => void;
  onEvaluate: () => void;
  isEvaluating?: boolean;
}

export function SessionInfo({ 
  caseTitle, 
  messageCount, 
  onReset, 
  onEvaluate,
  isEvaluating = false 
}: SessionInfoProps) {
  const canEvaluate = messageCount >= 5;

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
        
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip
            title={
              canEvaluate 
                ? 'Erhalten Sie detailliertes Feedback zu Ihrer Gesprächsführung' 
                : `Mindestens 5 Nachrichten erforderlich (${messageCount}/5)`
            }
            arrow
          >
            <span>
              <Button
                variant="outlined"
                startIcon={isEvaluating ? <CircularProgress size={16} /> : <Assessment />}
                onClick={onEvaluate}
                disabled={!canEvaluate || isEvaluating}
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderColor: 'success.main',
                  color: 'success.main',
                  '&:hover': {
                    borderColor: 'success.dark',
                    backgroundColor: 'success.lighter',
                  },
                  '&.Mui-disabled': {
                    borderColor: 'grey.300',
                    color: 'grey.400',
                  },
                }}
              >
                {isEvaluating ? 'Evaluierung läuft...' : 'Evaluieren'}
              </Button>
            </span>
          </Tooltip>

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
    </Box>
  );
}

