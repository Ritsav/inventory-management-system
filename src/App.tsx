import React, { useState, useEffect } from 'react';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, CssBaseline, ThemeProvider, createTheme,
  IconButton} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Inventory as InventoryIcon, 
  Timeline as TimelineIcon,
  Menu as MenuIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  ShoppingCart as OrderIcon,
  LocalShipping as PurchaseIcon
} from '@mui/icons-material';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import type { InventoryItem } from './types';
import * as InventoryService from './services/storage';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { Planning } from './components/Planning';
import { Analytics } from './components/Analytics';
import { CustomerList } from './components/CustomerList';
import { OrderList } from './components/OrderList';
import { PurchaseList } from './components/PurchaseList';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Initial load
    refreshData();
  }, [location.pathname]); // Refresh data when route changes to keep sync

  const refreshData = () => {
    setItems(InventoryService.getInventory());
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Inventory Actions Wrappers
  const handleDelete = (id: string) => {
    InventoryService.deleteItem(id);
    refreshData();
  };

  const handleEdit = (item: InventoryItem) => {
    InventoryService.updateItem(item);
    refreshData();
  };

  const handleAdd = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    InventoryService.addItem(item);
    refreshData();
  };

  const handleSell = (id: string, quantity: number) => {
    InventoryService.sellItem(id, quantity);
    refreshData();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Orders', icon: <OrderIcon />, path: '/orders' },
    { text: 'Purchases', icon: <PurchaseIcon />, path: '/purchases' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    { text: 'Planning', icon: <TimelineIcon />, path: '/planning' },
  ];

  const drawerContent = (
    <div>
      <Toolbar sx={{ justifyContent: 'center' }}>
         <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
           Inventory AI
         </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        {/* App Bar for Mobile */}
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            display: { sm: 'none' }
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              InventoryMaster
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Sidebar Drawer */}
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawerContent}
          </Drawer>
          {/* Desktop Drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
        >
          <Toolbar sx={{ display: { sm: 'none' } }} /> {/* Spacer for mobile AppBar */}
          
          <Routes>
            <Route path="/" element={<Dashboard items={items} />} />
            <Route path="/inventory" element={
              <InventoryList 
                items={items} 
                onDelete={handleDelete}
                onEdit={handleEdit}
                onAdd={handleAdd}
                onSell={handleSell}
              />
            } />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/purchases" element={<PurchaseList />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/analytics" element={<Analytics items={items} />} />
            <Route path="/planning" element={<Planning items={items} />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;