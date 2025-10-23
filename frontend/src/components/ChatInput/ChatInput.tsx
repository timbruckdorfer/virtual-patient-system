import { useState, KeyboardEvent, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { Send, Lightbulb, Mic, StopCircle } from '@mui/icons-material';
import { apiClient } from '@/lib/api';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startRecording = async () => {
    setRecordingError(null);
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = async () => {
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Only transcribe if we have data
        if (audioBlob.size > 0) {
          setIsTranscribing(true);
          
          try {
            const transcribedText = await apiClient.transcribeAudio(audioBlob);
            
            // Set transcribed text in input field
            setMessage(transcribedText);
          } catch (error) {
            console.error('Transcription error:', error);
            setRecordingError('Transkription fehlgeschlagen. Bitte versuchen Sie es erneut.');
          } finally {
            setIsTranscribing(false);
          }
        }
        
        audioChunksRef.current = [];
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingError('Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Mikrofon-Zugriff in Ihren Browser-Einstellungen.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!disabled && !isTranscribing) {
      startRecording();
    }
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        borderTop: 1,
        borderColor: 'divider',
        p: 2,
        backgroundColor: 'background.paper'
      }}
    >
      {recordingError && (
        <Alert severity="error" onClose={() => setRecordingError(null)} sx={{ mb: 2 }}>
          {recordingError}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isRecording 
              ? "Aufnahme läuft... Erneut klicken zum Stoppen" 
              : isTranscribing 
                ? "Transkribiere..." 
                : "Geben Sie Ihre Frage ein oder klicken Sie auf das Mikrofon..."
          }
          disabled={disabled || isRecording || isTranscribing}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.default',
            }
          }}
        />
        
        {/* Microphone Button */}
        <IconButton
          onClick={handleMicClick}
          disabled={disabled || isTranscribing}
          sx={{
            height: 56,
            width: 56,
            bgcolor: isRecording ? 'error.main' : 'grey.300',
            color: 'white',
            '&:hover': {
              bgcolor: isRecording ? 'error.dark' : 'grey.400',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled',
            },
            animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)',
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)',
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)',
              },
            },
          }}
        >
          {isTranscribing ? (
            <CircularProgress size={24} color="inherit" />
          ) : isRecording ? (
            <StopCircle />
          ) : (
            <Mic />
          )}
        </IconButton>
        
        {/* Send Button */}
        <IconButton
          color="primary"
          onClick={handleSubmit}
          disabled={!message.trim() || disabled || isRecording || isTranscribing}
          sx={{
            height: 56,
            width: 56,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled',
            }
          }}
        >
          <Send />
        </IconButton>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
        <Lightbulb sx={{ fontSize: 16, color: 'warning.main' }} />
        <Typography variant="caption" color="text.secondary">
          {isRecording 
            ? "🎤 Aufnahme läuft... Klicken Sie erneut auf das Mikrofon zum Stoppen"
            : "Tipp: Stellen Sie jeweils nur eine Frage und geben Sie dem Patienten Zeit zu antworten"}
        </Typography>
      </Box>
    </Paper>
  );
}

