/* eslint-disable react/prop-types */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Box,
  Alert,
  Typography,
} from '@mui/material';
import { useState } from 'react';

const RejectionModal = ({ open, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reject verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="rejection-dialog-title"
      aria-describedby="rejection-dialog-description"
    >
      <DialogTitle id="rejection-dialog-title" sx={{ pb: 1 }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          Reject Verification Request
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Alert
            severity="warning"
            sx={{
              backgroundColor: '',
              color: 'warning.dark',
              '& .MuiAlert-icon': {
                color: 'warning.dark',
              },
            }}
          >
            <Typography variant="body2" fontWeight="medium">
              Warning: Rejecting verification will permanently delete all
              uploaded documents.
            </Typography>
          </Alert>
        </Box>

        <TextField
          label="Rejection Reason"
          multiline
          minRows={4}
          maxRows={6}
          variant="outlined"
          fullWidth
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Please provide a detailed reason for rejection (required)"
          error={!!error}
          helperText={error}
          disabled={isSubmitting}
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#008080', // Teal border
              },
              '&:hover fieldset': {
                borderColor: '#008080',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#008080',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#008080', // Teal label
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#008080', // Teal label when focused
            },
          }}
          inputProps={{
            'aria-describedby': 'rejection-reason-helper-text',
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          id="rejection-reason-helper-text"
        >
          This reason will be sent to the user
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          color="inherit"
          sx={{ mr: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="error"
          variant="contained"
          disabled={!reason.trim() || isSubmitting}
          endIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
          sx={{
            minWidth: 150,
            '&:disabled': {
              backgroundColor: 'action.disabledBackground',
            },
          }}
        >
          {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectionModal;
