import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Lightbulb,
  Assessment,
} from '@mui/icons-material';
import { Evaluation } from '@/types';

interface EvaluationDialogProps {
  open: boolean;
  evaluation: Evaluation | null;
  onClose: () => void;
}

export function EvaluationDialog({ open, evaluation, onClose }: EvaluationDialogProps) {
  if (!evaluation) return null;

  const getScoreColor = (score: number): string => {
    if (score >= 4) return 'success.main';
    if (score >= 3) return 'warning.main';
    return 'error.main';
  };

  const getScoreLabel = (score: number): string => {
    switch (score) {
      case 1: return 'Erfüllt nicht';
      case 2: return 'Eher nicht';
      case 3: return 'Teilweise';
      case 4: return 'Eher erfüllt';
      case 5: return 'Vollständig erfüllt';
      default: return String(score);
    }
  };

  const averageScore = evaluation.criteria.reduce((sum, c) => sum + c.score, 0) / evaluation.criteria.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Assessment sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" component="div" fontWeight={600}>
              Anamnese-Evaluation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Detailliertes Feedback zu Ihrer Gesprächsführung
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* Overall Score Summary */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            backgroundColor: 'primary.lighter',
            border: 1,
            borderColor: 'primary.light',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Gesamtbewertung
            </Typography>
            <Chip
              icon={<CheckCircle />}
              label={`${averageScore.toFixed(1)} / 5.0`}
              color={averageScore >= 4 ? 'success' : averageScore >= 3 ? 'warning' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={(averageScore / 5) * 100}
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                backgroundColor: averageScore >= 4 ? 'success.main' : averageScore >= 3 ? 'warning.main' : 'error.main',
              },
            }}
          />
        </Paper>

        {/* Criteria Accordions */}
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
          Bewertungskriterien
        </Typography>

        {evaluation.criteria.map((criterion, index) => (
          <Accordion
            key={index}
            defaultExpanded={index === 0}
            sx={{
              mb: 1.5,
              '&:before': { display: 'none' },
              boxShadow: 1,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                '&:hover': { backgroundColor: 'grey.50' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                <Typography variant="body1" fontWeight={500} sx={{ flexGrow: 1 }}>
                  {criterion.name}
                </Typography>
                <Chip
                  label={`${criterion.score}/5`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: getScoreColor(criterion.score),
                    color: 'white',
                  }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Box sx={{ pl: 0 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  <strong>Bewertung:</strong> {getScoreLabel(criterion.score)}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {criterion.explanation}
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Improvement Suggestions */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mt: 3,
            backgroundColor: 'info.lighter',
            border: 1,
            borderColor: 'info.light',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Lightbulb sx={{ fontSize: 24, color: 'info.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Verbesserungsvorschläge
            </Typography>
          </Box>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {evaluation.improvement_suggestions.map((suggestion, index) => (
              <Typography
                key={index}
                component="li"
                variant="body2"
                sx={{ mb: index < evaluation.improvement_suggestions.length - 1 ? 1 : 0 }}
              >
                {suggestion}
              </Typography>
            ))}
          </Box>
        </Paper>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          size="large"
          fullWidth
          sx={{ py: 1.5 }}
        >
          Zurück zur Fallauswahl
        </Button>
      </DialogActions>
    </Dialog>
  );
}

