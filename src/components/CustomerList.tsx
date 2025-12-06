import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, DialogContentText, useTheme, useMediaQuery, Card, CardContent,
  CardActions, Avatar, Divider
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Person as PersonIcon, Phone as PhoneIcon, Email as EmailIcon, Home as HomeIcon } from '@mui/icons-material';
import type { Customer } from '../types';
import * as Storage from '../services/storage';

export const CustomerList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({});

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCustomers(Storage.getCustomers());
  };

  const handleOpen = (customer?: Customer) => {
    if (customer) {
      setCurrentCustomer(customer);
    } else {
      setCurrentCustomer({});
    }
    setOpen(true);
  };

  const handleSave = () => {
    if (!currentCustomer.name || !currentCustomer.email) return;

    if (currentCustomer.id) {
      Storage.updateCustomer(currentCustomer as Customer);
    } else {
      Storage.addCustomer(currentCustomer as Omit<Customer, 'id' | 'joinedDate'>);
    }
    setOpen(false);
    loadData();
  };

  const handleRequestDelete = (id: string) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      Storage.deleteCustomer(customerToDelete);
      setCustomerToDelete(null);
      setDeleteDialogOpen(false);
      loadData();
    }
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {customers.map((cust) => (
        <Grid size={{ xs: 12 }} key={cust.id}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{cust.name}</Typography>
                  <Typography variant="caption" color="textSecondary">ID: {cust.id}</Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" alignItems="center" mb={1}>
                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2">{cust.email}</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2">{cust.phone}</Typography>
              </Box>
              <Box display="flex" alignItems="start">
                <HomeIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'action.active' }} />
                <Typography variant="body2">{cust.address}</Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(cust)}>
                Edit
              </Button>
              <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleRequestDelete(cust.id)}>
                Delete
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
      {customers.length === 0 && (
        <Grid size={{ xs: 12 }}>
          <Typography align="center" color="textSecondary">No customers found.</Typography>
        </Grid>
      )}
    </Grid>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Address</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((cust) => (
            <TableRow key={cust.id} hover>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                  {cust.name}
                </Box>
              </TableCell>
              <TableCell>{cust.email}</TableCell>
              <TableCell>{cust.phone}</TableCell>
              <TableCell>{cust.address}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => handleOpen(cust)} color="primary" size="small">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleRequestDelete(cust.id)} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">No customers found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customer Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Customer
        </Button>
      </Box>

      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentCustomer.id ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField 
                label="Full Name" fullWidth value={currentCustomer.name || ''} 
                onChange={e => setCurrentCustomer({...currentCustomer, name: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Email" fullWidth value={currentCustomer.email || ''} 
                onChange={e => setCurrentCustomer({...currentCustomer, email: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Phone" fullWidth value={currentCustomer.phone || ''} 
                onChange={e => setCurrentCustomer({...currentCustomer, phone: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField 
                label="Address" fullWidth multiline rows={2} value={currentCustomer.address || ''} 
                onChange={e => setCurrentCustomer({...currentCustomer, address: e.target.value})} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this customer? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};