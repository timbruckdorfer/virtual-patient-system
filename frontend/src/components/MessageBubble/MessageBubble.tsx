import { Box, Paper, Typography, Avatar } from '@mui/material';
import { Person, LocalHospital } from '@mui/icons-material';
import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  if (isSystem) {
    return null; // Don't show system messages
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: 1.5,
          maxWidth: { xs: '85%', sm: '70%', md: '60%' }
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: isUser ? 'primary.main' : 'grey.300',
            color: isUser ? 'white' : 'grey.700'
          }}
        >
          {isUser ? <Person /> : <LocalHospital />}
        </Avatar>
        
        <Paper
          elevation={1}
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? 'white' : 'text.primary',
            borderRadius: 2,
            maxWidth: '100%'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {message.content}
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 0.5,
              gap: 1
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: isUser ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                fontSize: '0.7rem'
              }}
            >
              {formatTime(message.timestamp)}
            </Typography>
            
            {(message.tokens_in || message.tokens_out) && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: isUser ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                  fontSize: '0.7rem'
                }}
              >
                {message.tokens_in || message.tokens_out} tokens
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

