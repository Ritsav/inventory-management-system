import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, List, ListItem, ListItemText, Grid, Alert,
  useTheme, useMediaQuery, Card, CardContent, Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import type { Order, Customer, InventoryItem, OrderItem } from '../types';
import * as Storage from '../services/storage';

export const OrderList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  
  // New Order State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Selection State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  // Item Adder State
  const [selectedItemId, setSelectedItemId] = useState('');
  const [addQty, setAddQty] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(Storage.getOrders());
    setCustomers(Storage.getCustomers());
    setInventory(Storage.getInventory());
  };

  const handleOpenNewOrder = () => {
    setSelectedCustomerId('');
    setCurrentOrderItems([]);
    setError(null);
    setOpen(true);
  };

  const addItemToOrder = () => {
    setError(null);
    const item = inventory.find(i => i.id === selectedItemId);
    if (!item) return;

    // Check if user is trying to add more than stock
    // Also check if they already added this item to the current order list
    const alreadyInCart = currentOrderItems.find(i => i.itemId === item.id);
    const currentCartQty = alreadyInCart ? alreadyInCart.quantity : 0;
    const totalRequested = currentCartQty + addQty;

    if (totalRequested > item.quantity) {
      setError(`Insufficient stock! Only ${item.quantity} units available. You already have ${currentCartQty} in cart.`);
      return;
    }

    if (alreadyInCart) {
      // Update quantity of existing line item
      const updatedItems = currentOrderItems.map(i => 
        i.itemId === item.id ? { ...i, quantity: i.quantity + addQty } : i
      );
      setCurrentOrderItems(updatedItems);
    } else {
      // Add new line item
      const newItem: OrderItem = {
        itemId: item.id,
        itemName: item.name,
        quantity: addQty,
        priceAtSale: item.price
      };
      setCurrentOrderItems([...currentOrderItems, newItem]);
    }

    setSelectedItemId('');
    setAddQty(1);
  };

  const removeOrderItem = (index: number) => {
    const updated = [...currentOrderItems];
    updated.splice(index, 1);
    setCurrentOrderItems(updated);
    setError(null); // Clear error if any
  };

  const calculateTotal = () => {
    return currentOrderItems.reduce((acc, item) => acc + (item.quantity * item.priceAtSale), 0);
  };

  const handleSubmitOrder = () => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer || currentOrderItems.length === 0) return;

    Storage.createOrder({
      customerId: customer.id,
      customerName: customer.name,
      items: currentOrderItems,
      totalAmount: calculateTotal()
    });

    setOpen(false);
    loadData(); // Reload orders and inventory (stock reduced)
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {orders.map((order) => (
        <Grid size={{ xs: 12 }} key={order.id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <ReceiptIcon color="action" fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                    {order.id}
                  </Typography>
                </Box>
                <Chip label={order.status} color="success" size="small" />
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="h6" component="div">
                {order.customerName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {new Date(order.date).toLocaleDateString()}
              </Typography>
              
              <Box display="flex" justifyContent="space-between" mt={2} alignItems="center">
                <Typography variant="body2">
                  Items: {order.items.reduce((acc, i) => acc + i.quantity, 0)}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${order.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {orders.length === 0 && (
         <Grid size={{ xs: 12 }}>
            <Typography align="center" color="textSecondary">No orders found.</Typography>
         </Grid>
      )}
    </Grid>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Items Count</TableCell>
            <TableCell align="right">Total Amount</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell sx={{ fontFamily: 'monospace' }}>{order.id}</TableCell>
              <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{order.items.reduce((acc, i) => acc + i.quantity, 0)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>${order.totalAmount.toFixed(2)}</TableCell>
              <TableCell align="center">
                <Chip label={order.status} color="success" size="small" />
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">No orders found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Order Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNewOrder}>
          New Sales Order
        </Button>
      </Box>

      {isMobile ? renderMobileView() : renderDesktopView()}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Sales Order</DialogTitle>
        <DialogContent dividers>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label="Select Customer"
                fullWidth
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>Add Items to Order</Typography>
                <Box display="flex" gap={2} alignItems="center" flexDirection={isMobile ? 'column' : 'row'}>
                  <TextField
                    select
                    label="Product"
                    fullWidth
                    size="small"
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value);
                      setError(null);
                    }}
                  >
                    {inventory.filter(i => i.quantity > 0).map(i => (
                      <MenuItem key={i.id} value={i.id}>
                        {i.name} (${i.price}) - Stock: {i.quantity}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Box display="flex" gap={2} width={isMobile ? '100%' : 'auto'}>
                    <TextField
                      type="number"
                      label="Qty"
                      size="small"
                      sx={{ width: isMobile ? '50%' : 100 }}
                      value={addQty}
                      onChange={(e) => {
                        setAddQty(parseInt(e.target.value));
                        setError(null);
                      }}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                    <Button 
                      variant="outlined" 
                      onClick={addItemToOrder} 
                      disabled={!selectedItemId}
                      fullWidth={isMobile}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>Order Items</Typography>
              <List dense sx={{ border: '1px solid #eee', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                {currentOrderItems.length === 0 && <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>No items added yet.</Typography>}
                {currentOrderItems.map((item, idx) => (
                  <ListItem key={idx} secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => removeOrderItem(idx)}><DeleteIcon /></IconButton>
                  }>
                    <ListItemText 
                      primary={item.itemName} 
                      secondary={`${item.quantity} x $${item.priceAtSale.toFixed(2)}`} 
                    />
                    <Typography variant="body2" fontWeight="bold">
                      ${(item.quantity * item.priceAtSale).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Typography variant="h6">Total: ${calculateTotal().toFixed(2)}</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitOrder} variant="contained" disabled={!selectedCustomerId || currentOrderItems.length === 0}>
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};