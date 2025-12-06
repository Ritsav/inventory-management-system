import React, { useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, IconButton, Chip, InputAdornment, TextField, Button,
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem, Tooltip,
  useTheme, useMediaQuery, Card, CardContent, CardActions, DialogContentText, Divider
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon,
  Image as ImageIcon, ShoppingCartCheckout as SellIcon, QrCode as BarcodeIcon
} from '@mui/icons-material';
import Barcode from 'react-barcode';
import { type InventoryItem, CATEGORIES } from '../types';

interface InventoryListProps {
  items: InventoryItem[];
  onDelete: (id: string) => void;
  onEdit: (item: InventoryItem) => void;
  onAdd: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  onSell: (id: string, quantity: number) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ items, onDelete, onEdit, onAdd, onSell }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Dialog State
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<InventoryItem>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Sell Dialog State
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [itemToSell, setItemToSell] = useState<InventoryItem | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Barcode Dialog State
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [itemForBarcode, setItemForBarcode] = useState<InventoryItem | null>(null);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Create/Edit Handlers
  const handleOpenAdd = () => {
    setEditMode(false);
    setCurrentItem({
      category: CATEGORIES[0],
      quantity: 0,
      price: 0,
      minStockLevel: 0
    });
    setPreviewImage(null);
    setOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditMode(true);
    setCurrentItem({ ...item });
    setPreviewImage(item.imageData || null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        alert("File is too large. Please choose an image under 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setCurrentItem(prev => ({ ...prev, imageData: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!currentItem.name || !currentItem.category) {
      alert("Name and Category are required");
      return;
    }

    if (editMode && currentItem.id) {
      onEdit(currentItem as InventoryItem);
    } else {
      onAdd(currentItem as Omit<InventoryItem, 'id' | 'lastUpdated'>);
    }
    setOpen(false);
  };

  // Delete Logic
  const handleRequestDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Sell Handlers
  const handleOpenSell = (item: InventoryItem) => {
    setItemToSell(item);
    setSellQuantity(1);
    setSellDialogOpen(true);
  };

  const handleSellSubmit = () => {
    if (itemToSell && sellQuantity > 0) {
      onSell(itemToSell.id, sellQuantity);
      setSellDialogOpen(false);
      setItemToSell(null);
    }
  };

  const handleShowBarcode = (item: InventoryItem) => {
    setItemForBarcode(item);
    setBarcodeDialogOpen(true);
  };

  const getStatusChip = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return <Chip label="Out of Stock" color="error" variant="filled" size="small" />;
    }
    if (item.quantity <= item.minStockLevel) {
      return <Chip label="Low Stock" color="warning" size="small" />;
    }
    return <Chip label="In Stock" color="success" variant="outlined" size="small" />;
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {filteredItems.map((item) => {
        const isOutOfStock = item.quantity === 0;
        return (
          <Grid size={{ xs: 12, sm: 6 }} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar 
                  src={item.imageData} 
                  variant="rounded" 
                  sx={{ width: 60, height: 60, bgcolor: 'grey.300' }}
                >
                  <ImageIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {item.category}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    {getStatusChip(item)}
                    <Typography variant="h6" color="primary">
                      ${item.price.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider />
              <CardContent sx={{ py: 1, flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">Stock Level:</Typography>
                  <Typography variant="body2" fontWeight="medium" color={isOutOfStock ? 'error' : 'inherit'}>
                    {item.quantity} units
                  </Typography>
                </Box>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                 <Button 
                   size="small" 
                   startIcon={<SellIcon />} 
                   color="secondary"
                   onClick={() => handleOpenSell(item)}
                   disabled={item.quantity === 0}
                 >
                   Sell
                 </Button>
                 <Box>
                  <IconButton size="small" onClick={() => handleShowBarcode(item)} color="default">
                    <BarcodeIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleOpenEdit(item)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleRequestDelete(item.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                 </Box>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 250px)' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={60}>Image</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Stock</TableCell>
            <TableCell align="right">Value</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredItems.map((item) => {
            const isOutOfStock = item.quantity === 0;
            return (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Avatar 
                    src={item.imageData} 
                    variant="rounded"
                    sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}
                  >
                    <ImageIcon />
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">{item.name}</Typography>
                  <Typography variant="caption" color="textSecondary">{item.supplier}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={item.category} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Typography 
                    color={isOutOfStock ? 'error' : 'text.primary'} 
                    fontWeight={isOutOfStock ? 'bold' : 'regular'}
                  >
                    {item.quantity}
                  </Typography>
                </TableCell>
                <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                <TableCell>
                  {getStatusChip(item)}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Barcode">
                     <IconButton size="small" onClick={() => handleShowBarcode(item)}>
                        <BarcodeIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
                  <Tooltip title="Sell Item">
                    <span>
                      <IconButton 
                        size="small" 
                        color="secondary" 
                        onClick={() => handleOpenSell(item)}
                        disabled={item.quantity === 0}
                      >
                        <SellIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleOpenEdit(item)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleRequestDelete(item.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
          {filteredItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                <Typography variant="body1" color="textSecondary">No items found matching your criteria.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventory Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenAdd}
          sx={{ height: 48 }}
        >
          Add Item
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
             <TextField
                fullWidth
                variant="outlined"
                placeholder="Search items, suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Filter by Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="All">All Categories</MenuItem>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12} display="flex" flexDirection="column" alignItems="center">
              <Avatar 
                src={previewImage || ''} 
                variant="rounded" 
                sx={{ width: 100, height: 100, mb: 2, bgcolor: 'grey.200' }}
              >
                {!previewImage && <ImageIcon sx={{ fontSize: 40 }} />}
              </Avatar>
              <Button variant="outlined" component="label" size="small">
                Upload Image
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
            </Grid>
            <Grid size={12}>
              <TextField 
                label="Product Name" 
                fullWidth 
                required
                value={currentItem.name || ''} 
                onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                select 
                label="Category" 
                fullWidth 
                required
                value={currentItem.category || CATEGORIES[0]} 
                onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})}
              >
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Supplier" 
                fullWidth 
                value={currentItem.supplier || ''} 
                onChange={(e) => setCurrentItem({...currentItem, supplier: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                label="Price ($)" 
                type="number" 
                fullWidth 
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                value={currentItem.price ?? ''} 
                onChange={(e) => setCurrentItem({...currentItem, price: parseFloat(e.target.value)})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                label="Quantity" 
                type="number" 
                fullWidth 
                InputProps={{ inputProps: { min: 0 } }}
                value={currentItem.quantity ?? ''} 
                onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value)})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                label="Min Stock Alert" 
                type="number" 
                fullWidth 
                InputProps={{ inputProps: { min: 0 } }}
                value={currentItem.minStockLevel ?? ''} 
                onChange={(e) => setCurrentItem({...currentItem, minStockLevel: parseInt(e.target.value)})} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog open={sellDialogOpen} onClose={() => setSellDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Quick Sale</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              {itemToSell?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Current Stock: {itemToSell?.quantity}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Quantity Sold"
              type="number"
              fullWidth
              variant="outlined"
              value={sellQuantity}
              onChange={(e) => setSellQuantity(parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 1, max: itemToSell?.quantity || 1 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSellDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSellSubmit} variant="contained" color="secondary">
            Confirm Sale
          </Button>
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
            Are you sure you want to delete this item? This action removes the item from your local inventory permanently.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Barcode Dialog */}
      <Dialog
        open={barcodeDialogOpen}
        onClose={() => setBarcodeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Item Barcode</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
           {itemForBarcode && (
             <>
               <Typography variant="h6" gutterBottom>{itemForBarcode.name}</Typography>
               <Barcode value={itemForBarcode.id} />
               <Typography variant="caption" color="textSecondary" sx={{ mt: 2 }}>
                  System ID: {itemForBarcode.id}
               </Typography>
             </>
           )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBarcodeDialogOpen(false)}>Close</Button>
          <Button onClick={() => window.print()} variant="outlined">Print</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};