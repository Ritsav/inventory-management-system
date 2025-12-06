import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, LinearProgress, Divider,
  useTheme, useMediaQuery, List, ListItem, ListItemText, ListItemAvatar, Avatar
} from '@mui/material';
import { 
  TrendingUp, TrendingDown, AttachMoney, Storage, ShoppingCart, Receipt, Category
} from '@mui/icons-material';
import { type InventoryItem, CATEGORIES, type Order } from '../types';
import * as StorageService from '../services/storage';

interface AnalyticsProps {
  items: InventoryItem[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ items }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(StorageService.getOrders());
  }, []);

  // --- Inventory KPIs ---
  const totalInventoryValue = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = items.length;
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
  const averagePrice = totalItems > 0 ? totalInventoryValue / totalUnits : 0; 

  const sortedByValue = [...items].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity)).slice(0, 5);

  const categoryStats = CATEGORIES.map(cat => {
    const catItems = items.filter(i => i.category === cat);
    const count = catItems.length;
    const value = catItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    return { name: cat, count, value };
  }).filter(c => c.count > 0).sort((a, b) => b.value - a.value);

  const outOfStock = items.filter(i => i.quantity === 0).length;
  const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= i.minStockLevel).length;
  const inStock = items.filter(i => i.quantity > i.minStockLevel).length;

  // --- Sales KPIs ---
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const totalOrders = orders.length;
  const totalItemsSold = orders.reduce((acc, order) => acc + order.items.reduce((iAcc, item) => iAcc + item.quantity, 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Sales by Status
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  const AnalyticsCard = ({ title, value, subtitle, color, icon }: any) => (
    <Paper sx={{ p: 3, height: '100%', borderLeft: `4px solid ${color}`, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 10, right: 10, opacity: 0.1, transform: 'scale(2)' }}>
        {icon}
      </Box>
      <Typography variant="overline" color="textSecondary">{title}</Typography>
      <Typography variant="h4" sx={{ my: 1 }}>{value}</Typography>
      <Typography variant="body2" color="textSecondary">{subtitle}</Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Statistical Analysis
      </Typography>

      {/* --- Inventory Section --- */}
      <Typography variant="h5" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Storage /> Inventory Health
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsCard 
            title="Avg Unit Value" 
            value={`$${averagePrice.toFixed(2)}`} 
            subtitle="Weighted Average"
            color="#1976d2"
            icon={<AttachMoney />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsCard 
            title="Total Inventory Value" 
            value={`$${totalInventoryValue.toLocaleString()}`} 
            subtitle={`${totalUnits} total units`}
            color="#2e7d32"
            icon={<Storage />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsCard 
            title="Stock Health" 
            value={`${totalItems > 0 ? ((inStock / totalItems) * 100).toFixed(1) : 0}%`} 
            subtitle="Items in Good Standing"
            color="#ed6c02"
            icon={<TrendingUp />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsCard 
            title="Out of Stock" 
            value={outOfStock} 
            subtitle={`${lowStock} low stock items`}
            color="#d32f2f"
            icon={<TrendingDown />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
              <Typography variant="h6">Top 5 Highest Value Assets</Typography>
            </Box>
            
            {isMobile ? (
              <List>
                {sortedByValue.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="textPrimary">
                              {item.quantity} units @ ${item.price}
                            </Typography>
                            <br />
                            <Typography variant="body2" component="span" fontWeight="bold" color="success.main">
                              Total: ${(item.price * item.quantity).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < sortedByValue.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Total Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedByValue.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                          {item.name}
                        </TableCell>
                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right" sx={{ color: 'green', fontWeight: 'bold' }}>
                          ${(item.price * item.quantity).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
             <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
              <Typography variant="h6">Category Breakdown</Typography>
            </Box>
            
            {isMobile ? (
              <List>
                {categoryStats.map((cat, index) => {
                  const percent = totalInventoryValue > 0 ? (cat.value / totalInventoryValue) * 100 : 0;
                  return (
                    <React.Fragment key={cat.name}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.light' }}>
                            <Category fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={cat.name}
                          secondary={
                            <Box sx={{ width: '100%' }}>
                              <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{cat.count} Items</span>
                                <span>${cat.value.toLocaleString()}</span>
                              </Typography>
                              <LinearProgress variant="determinate" value={percent} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < categoryStats.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  );
                })}
              </List>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Items</TableCell>
                      <TableCell align="right">Value Share</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryStats.map((cat) => {
                      const percent = totalInventoryValue > 0 ? (cat.value / totalInventoryValue) * 100 : 0;
                      return (
                        <TableRow key={cat.name}>
                          <TableCell component="th" scope="row">
                            {cat.name}
                            <Typography variant="caption" display="block" color="textSecondary">
                              ${cat.value.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{cat.count}</TableCell>
                          <TableCell align="right" sx={{ width: '40%' }}>
                            <Box display="flex" alignItems="center">
                              <Box width="100%" mr={1}>
                                <LinearProgress variant="determinate" value={percent} />
                              </Box>
                              <Box minWidth={35}>
                                <Typography variant="caption" color="textSecondary">{`${Math.round(percent)}%`}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* --- Sales Section --- */}
      <Typography variant="h5" color="secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCart /> Sales Performance
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsCard 
            title="Total Revenue" 
            value={`$${totalRevenue.toLocaleString()}`} 
            subtitle="All Time Sales"
            color="#9c27b0"
            icon={<AttachMoney />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsCard 
            title="Total Orders" 
            value={totalOrders} 
            subtitle={`${completedOrders} Completed, ${pendingOrders} Pending`}
            color="#673ab7"
            icon={<Receipt />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsCard 
            title="Items Sold" 
            value={totalItemsSold} 
            subtitle="Units moved"
            color="#3f51b5"
            icon={<ShoppingCart />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsCard 
            title="Avg Order Value" 
            value={`$${averageOrderValue.toFixed(2)}`} 
            subtitle="Revenue per Order"
            color="#2196f3"
            icon={<TrendingUp />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};