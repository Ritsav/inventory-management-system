import React, { useState } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, Alert 
} from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import type { InventoryItem } from '../types';
import { getInventoryInsights } from '../services/geminiService';

interface PlanningProps {
  items: InventoryItem[];
}

export const Planning: React.FC<PlanningProps> = ({ items }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInventoryInsights(items);
      setInsights(result || "No insights generated.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Future Planning & AI Insights
        </Typography>
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
          onClick={handleGenerateInsights}
          disabled={loading}
          sx={{ py: 1.5, px: 3 }}
        >
          {loading ? 'Analyzing Inventory...' : 'Generate AI Report'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {!insights && !loading && !error && (
        <Paper sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
          <AutoAwesomeIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">
            Leverage AI to optimize your inventory.
          </Typography>
          <Typography>
            Click the button above to generate a comprehensive analysis of your stock levels, value distribution, and restock recommendations.
          </Typography>
        </Paper>
      )}

      {insights && (
        <Paper sx={{ p: 4, bgcolor: '#fcfcfc' }}>
          <div className="prose prose-blue max-w-none">
             <ReactMarkdown 
               components={{
                 h1: ({node, ...props}) => <Typography variant="h4" gutterBottom {...props} sx={{ mt: 2, mb: 2, color: '#1565c0' }} />,
                 h2: ({node, ...props}) => <Typography variant="h5" gutterBottom {...props} sx={{ mt: 3, mb: 2, color: '#1976d2' }} />,
                 h3: ({node, ...props}) => <Typography variant="h6" gutterBottom {...props} sx={{ mt: 2, mb: 1, fontWeight: 'bold' }} />,
                 p: ({node, ...props}) => <Typography paragraph {...props} sx={{ lineHeight: 1.7 }} />,
                 ul: ({node, ...props}) => <Box component="ul" sx={{ pl: 4 }} {...props} />,
                 li: ({node, ...props}) => <Box component="li" sx={{ mb: 1 }} {...props} />,
               }}
             >
               {insights}
             </ReactMarkdown>
          </div>
        </Paper>
      )}
    </Box>
  );
};