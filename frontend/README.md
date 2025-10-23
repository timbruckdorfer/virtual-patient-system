# Virtual Patient System - Frontend

Modern web interface for the TUM Virtual Patient System, built with React, Vite, and Material UI.

## Features

- **Interactive Chat Interface**: Real-time conversation with AI-powered simulated patients
- **Case Selection**: Choose from different patient scenarios
- **Session Management**: Create and manage chat sessions
- **Token Tracking**: Monitor API usage and costs
- **Responsive Design**: Works on desktop and mobile devices
- **German UI**: Fully localized for German medical students
- **Material UI Components**: Modern, accessible UI components and icons

## Tech Stack

- **Vite 6** - Fast build tool and dev server
- **React 18** with hooks
- **TypeScript** for type safety
- **Material UI (MUI) 6** - React component library
- **Material Icons** - Comprehensive icon set
- **Emotion** - CSS-in-JS styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running on `http://127.0.0.1:8000`

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Usage

1. **Select a Case**: Choose from available patient scenarios
2. **Start Conversation**: Begin with a friendly greeting
3. **Conduct Anamnesis**: Ask structured questions about symptoms
4. **Monitor Progress**: View token usage and session details
5. **Reset Session**: Start a new case when finished

## Available Cases

- **Bauchschmerzen (Epigastrium)**: Herr Peter Lenz, 52, LKW-Fahrer
  - Symptoms: Epigastrische Schmerzen seit heute Morgen
  - Difficulty: Anfänger

## API Integration

The frontend communicates with the backend API:

- `POST /api/sessions` - Create new chat session
- `POST /api/chat` - Send message to patient
- `GET /api/sessions/{id}/messages` - Get session transcript
- `GET /health` - Health check

## Using Material UI

### Importing Components

```tsx
import { Button, TextField, Card, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function MyComponent() {
  return (
    <Box sx={{ p: 2 }}>
      <TextField label="Message" fullWidth />
      <Button variant="contained" startIcon={<SendIcon />}>
        Send
      </Button>
    </Box>
  );
}
```

### Common Material UI Components

- **Layout**: `Box`, `Container`, `Grid`, `Stack`, `Paper`
- **Inputs**: `TextField`, `Button`, `Select`, `Checkbox`, `Switch`
- **Display**: `Typography`, `Card`, `Avatar`, `Chip`, `Alert`
- **Navigation**: `Tabs`, `Menu`, `Drawer`, `AppBar`
- **Feedback**: `CircularProgress`, `Snackbar`, `Dialog`

### Material Icons

Browse icons at [mui.com/material-ui/material-icons](https://mui.com/material-ui/material-icons/)

```tsx
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
```

### Demo Component

See `src/examples/MaterialUIDemo.tsx` for comprehensive examples of:
- Buttons with icons
- Text fields and forms
- Alerts and notifications
- Lists with avatars
- Chips and badges
- And more!

## Development Notes

- **TypeScript** for type safety
- **Vite** for fast development and builds
- **Material UI** for consistent, accessible components
- **Path aliases**: Use `@/` to import from `src/` directory
- Real-time message updates
- Token usage tracking
- Session persistence

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main app component with MUI theme
│   ├── main.tsx             # App entry point
│   ├── components/          # React components
│   ├── lib/                 # Utilities and API client
│   └── examples/            # Material UI demo components
├── public/                  # Static assets
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```