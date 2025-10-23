import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { Header } from '@/components/Header';
import { CaseSelectionPage } from '@/pages/CaseSelectionPage';
import { ChatPage } from '@/pages/ChatPage';
import { LoginPage } from '@/pages/LoginPage';
import { useAuth } from '@/hooks/useAuth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <Header />
                <Routes>
                  <Route path="/" element={<CaseSelectionPage />} />
                  <Route path="/chat/:sessionId" element={<ChatPage />} />
                </Routes>
              </Box>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
