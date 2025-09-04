import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Alert,
  Fab,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  PhotoCamera as CameraIcon,
  Share as ShareIcon,
  Analytics as AnalyticsIcon,
  Campaign as CampaignIcon,
  Store as StoreIcon,
  QrCode as QrCodeIcon,
  WhatsApp as WhatsAppIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Add as AddIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const EmprendedorasDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalVentas: 0,
    productosActivos: 0,
    clientesRegistrados: 0,
    ingresosMes: 0,
    conversiones: 0,
    alcance: 0
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'venta', message: 'Nueva venta: Sartén 24cm', time: '2 min', amount: '$15,000' },
    { id: 2, type: 'cliente', message: 'Cliente registrado: María González', time: '5 min', amount: null },
    { id: 3, type: 'placa', message: 'Placa generada: Combo Cocina', time: '10 min', amount: null },
    { id: 4, type: 'share', message: 'Compartido en Instagram', time: '15 min', amount: null },
  ]);

  const [topProducts, setTopProducts] = useState([
    { name: 'Sartén 24cm', sales: 45, revenue: '$675,000', growth: '+12%' },
    { name: 'Cacerola 28cm', sales: 32, revenue: '$480,000', growth: '+8%' },
    { name: 'Combo Cocina', sales: 28, revenue: '$420,000', growth: '+15%' },
  ]);

  const [socialStats, setSocialStats] = useState({
    instagram: { followers: 1250, engagement: 4.2, posts: 45 },
    facebook: { followers: 890, engagement: 3.8, posts: 32 },
    whatsapp: { contacts: 156, messages: 89, conversions: 12 }
  });

  // Simular datos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalVentas: prev.totalVentas + Math.floor(Math.random() * 3),
        ingresosMes: prev.ingresosMes + Math.floor(Math.random() * 50000),
      }));
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={trend} 
              size="small" 
              color={trend.includes('+') ? 'success' : 'error'}
              variant="outlined"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const QuickAction = ({ title, icon, color, onClick, badge }) => (
    <Card 
      sx={{ 
        cursor: 'pointer', 
        transition: 'all 0.3s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Badge badgeContent={badge} color="error">
          <Avatar sx={{ bgcolor: color, width: 48, height: 48, mx: 'auto', mb: 2 }}>
            {icon}
          </Avatar>
        </Badge>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderDashboard = () => (
    <Box>
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Ventas Hoy"
            value={stats.totalVentas}
            icon={<TrendingUpIcon />}
            color="#4CAF50"
            trend="+23%"
            subtitle="vs ayer"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Productos"
            value={stats.productosActivos}
            icon={<InventoryIcon />}
            color="#2196F3"
            trend="+5"
            subtitle="activos"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Clientes"
            value={stats.clientesRegistrados}
            icon={<PeopleIcon />}
            color="#FF9800"
            trend="+12"
            subtitle="este mes"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Ingresos"
            value={`$${stats.ingresosMes.toLocaleString()}`}
            icon={<MoneyIcon />}
            color="#9C27B0"
            trend="+18%"
            subtitle="este mes"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Conversiones"
            value={`${stats.conversiones}%`}
            icon={<AnalyticsIcon />}
            color="#F44336"
            trend="+3%"
            subtitle="tasa"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Alcance"
            value={stats.alcance}
            icon={<VisibilityIcon />}
            color="#00BCD4"
            trend="+45%"
            subtitle="social"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Acciones Rápidas
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <QuickAction
            title="Crear Placa"
            icon={<CameraIcon />}
            color="#4CAF50"
            onClick={() => setActiveTab(1)}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <QuickAction
            title="Generar QR"
            icon={<QrCodeIcon />}
            color="#2196F3"
            onClick={() => setActiveTab(2)}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <QuickAction
            title="Compartir"
            icon={<ShareIcon />}
            color="#FF9800"
            onClick={() => setActiveTab(3)}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <QuickAction
            title="Analytics"
            icon={<AnalyticsIcon />}
            color="#9C27B0"
            onClick={() => setActiveTab(4)}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <QuickAction
            title="Campañas"
            icon={<CampaignIcon />}
            color="#F44336"
            onClick={() => setActiveTab(5)}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <QuickAction
            title="Tienda"
            icon={<StoreIcon />}
            color="#00BCD4"
            onClick={() => setActiveTab(6)}
          />
        </Grid>
      </Grid>

      {/* Recent Activity & Top Products */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Actividad Reciente
              </Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: activity.type === 'venta' ? '#4CAF50' : 
                                  activity.type === 'cliente' ? '#2196F3' :
                                  activity.type === 'placa' ? '#FF9800' : '#9C27B0'
                        }}>
                          {activity.type === 'venta' ? <MoneyIcon /> :
                           activity.type === 'cliente' ? <PeopleIcon /> :
                           activity.type === 'placa' ? <CameraIcon /> : <ShareIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.message}
                        secondary={activity.time}
                      />
                      {activity.amount && (
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                          {activity.amount}
                        </Typography>
                      )}
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Productos Top
              </Typography>
              {topProducts.map((product, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {product.name}
                    </Typography>
                    <Chip label={product.growth} size="small" color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      {product.sales} ventas
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {product.revenue}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(product.sales / 50) * 100} 
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSocialMedia = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Redes Sociales
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(socialStats).map(([platform, data]) => (
          <Grid item xs={12} md={4} key={platform}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: platform === 'instagram' ? '#E4405F' : 
                            platform === 'facebook' ? '#1877F2' : '#25D366',
                    mr: 2 
                  }}>
                    {platform === 'instagram' ? <InstagramIcon /> :
                     platform === 'facebook' ? <FacebookIcon /> : <WhatsAppIcon />}
                  </Avatar>
                  <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                    {platform}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {data.followers || data.contacts}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {platform === 'whatsapp' ? 'Contactos' : 'Seguidores'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Engagement</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {data.engagement}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {platform === 'whatsapp' ? 'Mensajes' : 'Posts'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {data.posts || data.messages}
                  </Typography>
                </Box>
                {platform === 'whatsapp' && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Conversiones</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {data.conversions}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Dashboard" icon={<DashboardIcon />} />
          <Tab label="Placas IA" icon={<CameraIcon />} />
          <Tab label="QR Codes" icon={<QrCodeIcon />} />
          <Tab label="Compartir" icon={<ShareIcon />} />
          <Tab label="Analytics" icon={<AnalyticsIcon />} />
          <Tab label="Campañas" icon={<CampaignIcon />} />
          <Tab label="Mi Tienda" icon={<StoreIcon />} />
        </Tabs>
      </Box>

      {activeTab === 0 && renderDashboard()}
      {activeTab === 1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6">🎨 Generador de Placas con IA</Typography>
          <Typography>
            Crea placas profesionales con inteligencia artificial. 
            Combina productos, genera títulos automáticos y diseños perfectos.
          </Typography>
        </Alert>
      )}
      {activeTab === 2 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="h6">📱 Generador de Códigos QR</Typography>
          <Typography>
            Genera códigos QR para tus productos, catálogos y promociones.
            Conecta directamente con WhatsApp y redes sociales.
          </Typography>
        </Alert>
      )}
      {activeTab === 3 && renderSocialMedia()}
      {activeTab === 4 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6">📊 Analytics Avanzado</Typography>
          <Typography>
            Analiza el rendimiento de tus ventas, productos más populares 
            y comportamiento de clientes en tiempo real.
          </Typography>
        </Alert>
      )}
      {activeTab === 5 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">🚀 Campañas de Marketing</Typography>
          <Typography>
            Crea y gestiona campañas promocionales, ofertas especiales 
            y estrategias de marketing automatizadas.
          </Typography>
        </Alert>
      )}
      {activeTab === 6 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6">🏪 Mi Tienda Virtual</Typography>
          <Typography>
            Gestiona tu catálogo completo, precios, stock y 
            configura tu tienda online profesional.
          </Typography>
        </Alert>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          bgcolor: '#4CAF50',
          '&:hover': { bgcolor: '#45a049' }
        }}
        onClick={() => setActiveTab(1)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default EmprendedorasDashboard;
