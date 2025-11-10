import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  VideoLibrary as VideoIcon,
  Image as ImageIcon,
  Gif as GifIcon,
  OpenInNew as OpenIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Navbar from './Navbar';
import { useAuth } from '../AuthContext';
import searchAPI from '../services/searchAPI';

const BusquedaIA = () => {
  const { logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Función para realizar búsqueda con IA
  const performSearch = async (term) => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar el servicio de búsqueda real
      const results = await searchAPI.searchEssenMaterial(term, {
        maxResults: 20,
        includeImages: true,
        includeVideos: true
      });
      
      setSearchResults(results);
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError(err.message || 'Error al realizar la búsqueda. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = () => {
    if (searchTerm.trim()) {
      performSearch(searchTerm.trim());
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <PdfIcon color="error" />;
      case 'video':
        return <VideoIcon color="primary" />;
      case 'image':
        return <ImageIcon color="success" />;
      case 'gif':
        return <GifIcon color="secondary" />;
      default:
        return <OpenIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'error';
      case 'video':
        return 'primary';
      case 'image':
        return 'success';
      case 'gif':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleMediaClick = (media) => {
    setSelectedMedia(media);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMedia(null);
  };

  const handleDownload = (url, title) => {
    try {
      // Crear un enlace temporal para descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = title || 'material-essen';
      link.target = '_blank';
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Mostrar mensaje de éxito
      setError(null);
    } catch (err) {
      console.error('Error al descargar:', err);
      // Fallback: abrir en nueva pestaña
      window.open(url, '_blank');
    }
  };

  const renderMediaCard = (media) => (
    <Grid item xs={12} sm={6} md={4} key={media.id}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        onClick={() => handleMediaClick(media)}
      >
        <CardMedia
          component="img"
          height="200"
          image={media.thumbnail}
          alt={media.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {getTypeIcon(media.type)}
            <Chip 
              label={media.type.toUpperCase()} 
              size="small" 
              color={getTypeColor(media.type)}
              variant="outlined"
            />
          </Box>
          
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
            {media.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
            {media.description}
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {media.source}
            </Typography>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(media.url, media.title);
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {media.duration && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Duración: {media.duration}
            </Typography>
          )}
          
          {media.views && (
            <Typography variant="caption" color="text.secondary">
              {media.views} visualizaciones
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  const renderMediaDialog = () => {
    if (!selectedMedia) return null;

    return (
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{selectedMedia.title}</Typography>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {selectedMedia.type === 'video' && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <video 
                controls 
                style={{ width: '100%', maxHeight: '400px', borderRadius: '8px' }}
                poster={selectedMedia.thumbnail}
                preload="metadata"
              >
                <source src={selectedMedia.url} type="video/mp4" />
                <source src={selectedMedia.url} type="video/webm" />
                Tu navegador no soporta el elemento video.
              </video>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Si el video no se reproduce, haz clic en "Abrir en nueva pestaña"
              </Typography>
            </Box>
          )}
          
          {selectedMedia.type === 'image' && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <img 
                src={selectedMedia.url} 
                alt={selectedMedia.title}
                style={{ 
                  width: '100%', 
                  maxHeight: '500px', 
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
                onError={(e) => {
                  e.target.src = selectedMedia.thumbnail || 'https://via.placeholder.com/400x300/ccc/666?text=Imagen+no+disponible';
                }}
              />
            </Box>
          )}
          
          {selectedMedia.type === 'gif' && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <img 
                src={selectedMedia.url} 
                alt={selectedMedia.title}
                style={{ 
                  width: '100%', 
                  maxHeight: '400px', 
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  e.target.src = selectedMedia.thumbnail || 'https://via.placeholder.com/400x300/ccc/666?text=GIF+no+disponible';
                }}
              />
            </Box>
          )}
          
          {selectedMedia.type === 'pdf' && (
            <Box sx={{ textAlign: 'center', mb: 2, p: 3, border: '2px dashed #ccc', borderRadius: 2 }}>
              <PdfIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Documento PDF
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedMedia.pages} páginas • {selectedMedia.size}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<OpenIcon />}
                  onClick={() => window.open(selectedMedia.url, '_blank')}
                >
                  Abrir PDF
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(selectedMedia.url, selectedMedia.title)}
                >
                  Descargar
                </Button>
              </Box>
            </Box>
          )}
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {selectedMedia.description}
          </Typography>
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip 
              label={selectedMedia.type.toUpperCase()} 
              color={getTypeColor(selectedMedia.type)}
              variant="outlined"
            />
            <Chip 
              label={selectedMedia.source} 
              variant="outlined"
            />
            {selectedMedia.duration && (
              <Chip 
                label={`Duración: ${selectedMedia.duration}`} 
                variant="outlined"
              />
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
          <Button 
            variant="outlined" 
            startIcon={<OpenIcon />}
            onClick={() => window.open(selectedMedia.url, '_blank')}
          >
            Abrir en nueva pestaña
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => handleDownload(selectedMedia.url, selectedMedia.title)}
          >
            Descargar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <Navbar
        title={
          <Typography variant="h6" component="p">
            🔍 Búsqueda IA - Material Essen
          </Typography>
        }
        onLogout={logout}
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Buscador Inteligente Essen
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Encuentra videos, PDFs, imágenes y más material de productos Essen usando inteligencia artificial
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ej: Sartén Express, Cacerola, Wok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={!searchTerm.trim() || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {searchResults.length > 0 && !loading && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Resultados para "{searchTerm}" ({searchResults.length} encontrados)
            </Typography>
            
            <Grid container spacing={3}>
              {searchResults.map(renderMediaCard)}
            </Grid>
          </>
        )}

        {searchResults.length === 0 && !loading && searchTerm && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron resultados para "{searchTerm}"
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Intenta con otros términos de búsqueda
            </Typography>
          </Box>
        )}

        {!searchTerm && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              💡 Sugerencias de búsqueda
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
              {['Sartén Express', 'Cacerola 24cm', 'Wok Essen', 'Plancha Grill', 'Olla Express'].map((suggestion) => (
                <Chip
                  key={suggestion}
                  label={suggestion}
                  onClick={() => setSearchTerm(suggestion)}
                  variant="outlined"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Container>

      {renderMediaDialog()}
    </>
  );
};

export default BusquedaIA;
