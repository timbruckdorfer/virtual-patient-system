/**
 * Material UI Components and Icons Demo
 * 
 * This file demonstrates how to use Material UI components and icons
 * in your application. You can import and use these patterns throughout
 * your app.
 */

import { useState } from 'react';
import {
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Stack,
  Chip,
  Alert,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';

// Icon imports - Material UI Icons
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

export function MaterialUIDemo() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h3" gutterBottom>
        Material UI Components Demo
      </Typography>

      {/* Buttons with Icons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Buttons with Icons
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button variant="contained" startIcon={<SendIcon />}>
              Send
            </Button>
            <Button variant="outlined" startIcon={<DeleteIcon />} color="error">
              Delete
            </Button>
            <Button variant="text" startIcon={<FavoriteIcon />} color="secondary">
              Like
            </Button>
            <IconButton color="primary">
              <SettingsIcon />
            </IconButton>
          </Stack>
        </CardContent>
      </Card>

      {/* Text Fields and Loading */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Input Fields
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Enter your message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something..."
              helperText="This is a Material UI TextField"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 2000);
                }}
                disabled={loading}
              >
                Submit
              </Button>
              {loading && <CircularProgress size={24} />}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Alerts with Icons
          </Typography>
          <Stack spacing={2}>
            <Alert severity="success" icon={<CheckCircleIcon />}>
              Success! Your changes have been saved.
            </Alert>
            <Alert severity="info" icon={<InfoIcon />}>
              This is an informational message.
            </Alert>
            <Alert severity="warning" icon={<WarningIcon />}>
              Warning: Please review your input.
            </Alert>
            <Alert severity="error" icon={<ErrorIcon />}>
              Error: Something went wrong.
            </Alert>
          </Stack>
        </CardContent>
      </Card>

      {/* Chips */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Chips with Icons
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip label="Primary" color="primary" icon={<ChatIcon />} />
            <Chip label="Secondary" color="secondary" icon={<PersonIcon />} />
            <Chip 
              label="Deletable" 
              onDelete={() => alert('Delete clicked')} 
              color="error"
            />
            <Chip 
              label="Clickable" 
              onClick={() => alert('Chip clicked')}
              variant="outlined"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* List with Avatars */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            List with Avatars and Icons
          </Typography>
          <Paper variant="outlined">
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="User Message"
                  secondary="This is a message with an avatar icon"
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <ChatIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Chat Message"
                  secondary="Another message with a different icon"
                />
              </ListItem>
            </List>
          </Paper>
        </CardContent>
      </Card>

      {/* Icon Reference */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Common Icons Reference
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Import icons from '@mui/icons-material'. Popular icons include:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {[
              { icon: <SendIcon />, name: 'SendIcon' },
              { icon: <DeleteIcon />, name: 'DeleteIcon' },
              { icon: <FavoriteIcon />, name: 'FavoriteIcon' },
              { icon: <PersonIcon />, name: 'PersonIcon' },
              { icon: <ChatIcon />, name: 'ChatIcon' },
              { icon: <SettingsIcon />, name: 'SettingsIcon' },
              { icon: <InfoIcon />, name: 'InfoIcon' },
              { icon: <CheckCircleIcon />, name: 'CheckCircleIcon' },
              { icon: <WarningIcon />, name: 'WarningIcon' },
              { icon: <ErrorIcon />, name: 'ErrorIcon' },
            ].map(({ icon, name }) => (
              <Chip
                key={name}
                icon={icon}
                label={name}
                variant="outlined"
                sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            href="https://mui.com/material-ui/material-icons/"
            target="_blank"
          >
            Browse All Icons
          </Button>
          <Button
            size="small"
            href="https://mui.com/material-ui/getting-started/"
            target="_blank"
          >
            MUI Documentation
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

