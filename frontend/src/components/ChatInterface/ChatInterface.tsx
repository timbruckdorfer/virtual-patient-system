import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  CircularProgress,
  List,
  Paper
} from '@mui/material';
import { ChatBubbleOutline, Lightbulb, Person } from '@mui/icons-material';
import { Message, CaseDetails } from '@/types';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { SessionInfo } from '@/components/SessionInfo';

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

interface ChatInterfaceProps {
  sessionId: string;
  caseId: string;
  onReset: () => void;
}

const CASE_TITLES: Record<string, string> = {
  bauchschmerzen: 'Bauchschmerzen',
  brustschmerzen: 'Brustschmerzen',
  depression: 'Depression',
  dyspnoe: 'Dyspnoe',
  husten: 'Husten',
  kopfschmerzen: 'Kopfschmerzen',
  rueckenschmerzen: 'Rückenschmerzen',
};

export function ChatInterface({ sessionId, caseId, onReset }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch case details when component mounts
    const fetchCaseDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCaseDetails(data);
        }
      } catch (error) {
        console.error('Error fetching case details:', error);
      }
    };

    fetchCaseDetails();
  }, [caseId]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          session_id: sessionId,
          message: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCaseTitle = (caseId: string) => {
    return CASE_TITLES[caseId] || caseId;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SessionInfo 
        caseTitle={getCaseTitle(caseId)}
        sessionId={sessionId}
        onReset={onReset}
      />
      
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          p: 3,
          backgroundColor: 'grey.50'
        }}
      >
        {messages.length === 0 && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 6,
              px: 3
            }}
          >
            <ChatBubbleOutline 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                mb: 2
              }} 
            />
            <Typography 
              variant="h6" 
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Gespräch gestartet!
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Beginnen Sie mit einer freundlichen Begrüßung und führen Sie eine strukturierte Anamnese durch.
            </Typography>
            
            {/* Patient Information Card */}
            {caseDetails && (
              <Paper 
                elevation={0}
                sx={{ 
                  mt: 3,
                  p: 2.5,
                  backgroundColor: 'primary.lighter',
                  border: 1,
                  borderColor: 'primary.light',
                  maxWidth: 500,
                  mx: 'auto',
                  mb: 3
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Person sx={{ fontSize: 24, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                    Patient:in
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body1" color="text.primary" sx={{ mb: 0.5 }}>
                    <strong>Name:</strong> {caseDetails.patient_name}
                  </Typography>
                  <Typography variant="body1" color="text.primary" sx={{ mb: 0.5 }}>
                    <strong>Alter:</strong> {caseDetails.patient_age} Jahre
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    <strong>Beruf:</strong> {caseDetails.patient_occupation}
                  </Typography>
                </Box>
              </Paper>
            )}
            
            {/* General Communication Tips */}
            <Paper 
              elevation={0}
              sx={{ 
                mt: 3,
                p: 2.5,
                backgroundColor: 'info.lighter',
                border: 1,
                borderColor: 'info.light',
                maxWidth: 500,
                mx: 'auto'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Lightbulb sx={{ fontSize: 20, color: 'warning.main' }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Tipps für ein gutes Gespräch:
                </Typography>
              </Box>
              <List sx={{ listStyleType: 'disc', pl: 4 }}>
                <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 0.5 }}>
                  Halten Sie das Gespräch natürlich und einfach
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 0.5 }}>
                  Stellen Sie nur eine Frage auf einmal
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 0.5 }}>
                  Hören Sie aktiv zu und gehen Sie auf die Antworten ein
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 0.5 }}>
                  Verwenden Sie eine verständliche, patientenfreundliche Sprache
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item' }}>
                  Strukturieren Sie Ihre Anamnese systematisch
                </Typography>
              </List>
            </Paper>
          </Box>
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Paper 
              elevation={1}
              sx={{ 
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Patient antwortet...
              </Typography>
            </Paper>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
    </Box>
  );
}

