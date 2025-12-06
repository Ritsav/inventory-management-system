import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, List, ListItem, ListItemText, Grid,
  useTheme, useMediaQuery, Card, CardContent, Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, LocalShipping as ShippingIcon } from '@mui/icons-material';
import type { Purchase, InventoryItem, PurchaseItem } from '../types';
import * as Storage from '../services/storage';

export const PurchaseList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [open, setOpen] = useState(false);
  
  const [supplierName, setSupplierName] = useState('');
  const [currentItems, setCurrentItems] = useState<PurchaseItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  // Item Adder
  const [selectedItemId, setSelectedItemId] = useState('');
  const [addQty, setAddQty] = useState(10);
  const [costPrice, setCostPrice] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPurchases(Storage.getPurchases());
    setInventory(Storage.getInventory());
  };

  const handleOpenNew = () => {
    setSupplierName('');
    setCurrentItems([]);
    setOpen(true);
  };

  const addItemToPurchase = () => {
    const item = inventory.find(i => i.id === selectedItemId);
    if (!item) return;

    const newItem: PurchaseItem = {
      itemId: item.id,
      itemName: item.name,
      quantity: addQty,
      costPrice: costPrice
    };

    setCurrentItems([...currentItems, newItem]);
    setSelectedItemId('');
    setAddQty(10);
  };

  const calculateTotal = () => {
    return currentItems.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);
  };

  const handleSubmit = () => {
    if (!supplierName || currentItems.length === 0) return;

    Storage.createPurchase({
      supplier: supplierName,
      items: currentItems,
      totalCost: calculateTotal()
    });

    setOpen(false);
    loadData();
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {purchases.map((p) => (
        <Grid size={{ xs: 12 }} key={p.id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                  {p.id}
                </Typography>
                <Chip icon={<ShippingIcon />} label={p.status} color="info" size="small" />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">{p.supplier}</Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date(p.date).toLocaleDateString()}
              </Typography>
              <Box display="flex" justifyContent="space-between" mt={2} alignItems="center">
                <Typography variant="body2">
                  Items: {p.items.reduce((acc, i) => acc + i.quantity, 0)}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${p.totalCost.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {purchases.length === 0 && (
        <Grid size={{ xs: 12 }}>
           <Typography align="center" color="textSecondary">No purchases recorded.</Typography>
        </Grid>
      )}
    </Grid>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Purchase ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Supplier</TableCell>
            <TableCell>Items Received</TableCell>
            <TableCell align="right">Total Cost</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {purchases.map((p) => (
            <TableRow key={p.id} hover>
              <TableCell sx={{ fontFamily: 'monospace' }}>{p.id}</TableCell>
              <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
              <TableCell>{p.supplier}</TableCell>
              <TableCell>{p.items.reduce((acc, i) => acc + i.quantity, 0)}</TableCell>
              <TableCell align="right">${p.totalCost.toFixed(2)}</TableCell>
              <TableCell align="center">
                <Chip icon={<ShippingIcon />} label={p.status} color="info" size="small" />
              </TableCell>
            </TableRow>
          ))}
          {purchases.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">No purchases recorded.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Purchase Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
          Restock Inventory
        </Button>
      </Box>

      {isMobile ? renderMobileView() : renderDesktopView()}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Receive New Stock</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Supplier Name"
                fullWidth
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>Add Items</Typography>
                <Box display="flex" gap={2} alignItems="center" flexDirection={isMobile ? 'column' : 'row'}>
                  <TextField
                    select
                    label="Product"
                    fullWidth
                    size="small"
                    value={selectedItemId}
                    onChange={(e) => {
                       setSelectedItemId(e.target.value);
                       // Auto-fill cost from current price as a default estimate
                       const i = inventory.find(inv => inv.id === e.target.value);
                       if(i) setCostPrice(Number((i.price * 0.6).toFixed(2))); 
                    }}
                  >
                    {inventory.map(i => (
                      <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                    ))}
                  </TextField>
                  <Box display="flex" gap={2} width={isMobile ? '100%' : 'auto'}>
                    <TextField
                      type="number"
                      label="Qty"
                      size="small"
                      sx={{ width: isMobile ? '50%' : 100 }}
                      value={addQty}
                      onChange={(e) => setAddQty(parseInt(e.target.value))}
                    />
                    <TextField
                      type="number"
                      label="Unit Cost"
                      size="small"
                      sx={{ width: isMobile ? '50%' : 120 }}
                      value={costPrice}
                      onChange={(e) => setCostPrice(parseFloat(e.target.value))}
                    />
                  </Box>
                  <Button variant="outlined" onClick={addItemToPurchase} disabled={!selectedItemId} fullWidth={isMobile}>Add</Button>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
               <Typography variant="subtitle1" gutterBottom>Purchase Items</Typography>
               <List dense sx={{ border: '1px solid #eee', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                {currentItems.map((item, idx) => (
                  <ListItem key={idx} secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => {
                        const next = [...currentItems]; next.splice(idx,1); setCurrentItems(next);
                    }}><DeleteIcon /></IconButton>
                  }>
                    <ListItemText 
                      primary={item.itemName} 
                      secondary={`${item.quantity} units @ $${item.costPrice}`} 
                    />
                    <Typography variant="body2" fontWeight="bold">
                      ${(item.quantity * item.costPrice).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
               </List>
               <Box display="flex" justifyContent="flex-end" mt={2}>
                 <Typography variant="h6">Total Cost: ${calculateTotal().toFixed(2)}</Typography>
               </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!supplierName || currentItems.length === 0}>
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};