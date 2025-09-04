import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Share as ShareIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Psychology as PsychologyIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  PlayCircle as PlayCircleIcon,
  PauseCircle as PauseCircleIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon
} from '@mui/icons-material';

const capacitaciones = [
  // CURSOS DE CANVA - Videos reales de YouTube en español
  {
    id: 1,
    title: "Canva Tutorial Completo en Español 2024",
    description: "Aprende Canva desde cero con este tutorial completo. Crea diseños profesionales para redes sociales, presentaciones y más.",
    category: "Canva",
    duration: "1h 12min",
    level: "Principiante",
    thumbnail: "https://img.youtube.com/vi/fdxnEr61Z5c/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/fdxnEr61Z5c",
    instructor: "Tutoriales en Español",
    views: 125000,
    likes: 4200,
    tags: ["canva", "diseño", "tutorial", "español"],
    progress: 0,
    status: "pending" // pending, in_progress, completed
  },
  {
    id: 2,
    title: "Canva con Inteligencia Artificial - Magic Studio",
    description: "Descubre las nuevas funciones de IA en Canva. Magic Write, Magic Media, eliminación de fondos y más herramientas avanzadas.",
    category: "Canva",
    duration: "45 min",
    level: "Intermedio",
    thumbnail: "https://img.youtube.com/vi/-idMBeCCCzs/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/-idMBeCCCzs",
    instructor: "Canva Oficial",
    views: 89000,
    likes: 3100,
    tags: ["canva", "ia", "magic studio", "avanzado"],
    progress: 0,
    status: "pending"
  },
  
  // CURSOS DE IA - Videos reales de YouTube en español
  {
    id: 3,
    title: "ChatGPT para Emprendedores - Guía Completa",
    description: "Aprende a usar ChatGPT para automatizar tu negocio. Crear contenido, responder clientes, generar ideas y más.",
    category: "Inteligencia Artificial",
    duration: "1h 25min",
    level: "Principiante",
    thumbnail: "https://img.youtube.com/vi/PHT3K7z93YQ/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/PHT3K7z93YQ",
    instructor: "IA para Negocios",
    views: 156000,
    likes: 5800,
    tags: ["chatgpt", "ia", "automatización", "negocios"],
    progress: 0,
    status: "pending"
  },
  
  // CURSOS DE MARKETING - Videos reales de YouTube en español
  {
    id: 4,
    title: "Marketing Digital para Emprendedores - Curso Completo",
    description: "Estrategias de marketing digital que funcionan. SEO, redes sociales, email marketing y análisis de datos.",
    category: "Marketing",
    duration: "1h 45min",
    level: "Intermedio",
    thumbnail: "https://img.youtube.com/vi/Dpogg1W_CJg/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/Dpogg1W_CJg",
    instructor: "Marketing Digital Pro",
    views: 234000,
    likes: 8900,
    tags: ["marketing", "digital", "estrategia", "seo"],
    progress: 0,
    status: "pending"
  },
  
  // CURSOS DE TIKTOK - Videos reales de YouTube en español
  {
    id: 5,
    title: "TikTok para Negocios - Estrategias que Funcionan",
    description: "Domina TikTok para promocionar tu negocio. Algoritmo, tendencias, hashtags y contenido que vende.",
    category: "TikTok",
    duration: "1h 15min",
    level: "Principiante",
    thumbnail: "https://img.youtube.com/vi/51bKUg0a6yQ/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/51bKUg0a6yQ",
    instructor: "TikTok Business",
    views: 312000,
    likes: 12400,
    tags: ["tiktok", "viral", "algoritmo", "tendencias"],
    progress: 0,
    status: "pending"
  },
  
  // CURSOS DE YOUTUBE STUDIO - Videos reales de YouTube en español
  {
    id: 6,
    title: "YouTube Studio - Guía Completa para Creadores",
    description: "Aprende a usar YouTube Studio para optimizar tu canal. Analytics, monetización, SEO y crecimiento.",
    category: "YouTube Studio",
    duration: "1h 32min",
    level: "Principiante",
    thumbnail: "https://img.youtube.com/vi/WYbh60FijSM/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/WYbh60FijSM",
    instructor: "YouTube Creator Academy",
    views: 267000,
    likes: 9800,
    tags: ["youtube", "studio", "analytics", "monetización"],
    progress: 0,
    status: "pending"
  },
  
  // CURSOS ADICIONALES - Videos reales de YouTube en español
  {
    id: 7,
    title: "Instagram Reels - Contenido que Vende",
    description: "Crea Reels efectivos para Instagram. Ideas, edición, música, hashtags y estrategias de engagement.",
    category: "Redes Sociales",
    duration: "1h 5min",
    level: "Intermedio",
    thumbnail: "https://img.youtube.com/vi/DoHaQP_-DKI/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/DoHaQP_-DKI",
    instructor: "Instagram Growth Pro",
    views: 289000,
    likes: 11200,
    tags: ["instagram", "reels", "contenido", "engagement"],
    progress: 0,
    status: "pending"
  },
  {
    id: 8,
    title: "Curso Completo de Emprendimiento Digital",
    description: "Aprende todo lo necesario para emprender en el mundo digital. Estrategias, herramientas y técnicas para el éxito.",
    category: "Emprendimiento",
    duration: "2h 15min",
    level: "Principiante",
    thumbnail: "https://img.youtube.com/vi/bWF7AfDoRX0/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/bWF7AfDoRX0",
    instructor: "Emprendimiento Digital",
    views: 156000,
    likes: 5800,
    tags: ["emprendimiento", "digital", "negocios", "estrategias"],
    progress: 0,
    status: "pending"
  }
];

const categoryIcons = {
  "Canva": SchoolIcon,
  "Inteligencia Artificial": PsychologyIcon,
  "Marketing": TrendingUpIcon,
  "TikTok": InstagramIcon,
  "YouTube Studio": PlayIcon,
  "Emprendimiento": BusinessIcon,
  "Herramientas": BusinessIcon,
  "Redes Sociales": InstagramIcon,
  "Ventas": TrendingUpIcon,
  "Psicología": PsychologyIcon,
  "Publicidad": FacebookIcon,
  "Desarrollo Personal": SchoolIcon
};

const levelColors = {
  "Principiante": "success",
  "Intermedio": "warning", 
  "Avanzado": "error"
};

const CapacitacionesSection = () => {
  const theme = useTheme();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [courses, setCourses] = useState(capacitaciones);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Obtener el usuario logueado
  const currentUser = localStorage.getItem("activeSession") || "guest";
  const progressKey = `capacitaciones_progress_${currentUser}`;

  // Cargar progreso guardado al inicializar
  useEffect(() => {
    const savedProgress = localStorage.getItem(progressKey);
    if (savedProgress) {
      try {
        const progressData = JSON.parse(savedProgress);
        setCourses(prevCourses => 
          prevCourses.map(course => ({
            ...course,
            progress: progressData[course.id]?.progress || 0,
            status: progressData[course.id]?.status || 'pending'
          }))
        );
      } catch (error) {
        console.error('Error al cargar progreso:', error);
      }
    }
  }, [progressKey]);

  // Función para guardar progreso en localStorage
  const saveProgress = (courseId, status, progress) => {
    try {
      const savedProgress = localStorage.getItem(progressKey);
      const progressData = savedProgress ? JSON.parse(savedProgress) : {};
      
      progressData[courseId] = { status, progress };
      localStorage.setItem(progressKey, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error al guardar progreso:', error);
    }
  };

  const categories = ['Todas', ...new Set(courses.map(cap => cap.category))];

  const filteredCapacitaciones = selectedCategory === 'Todas' 
    ? courses 
    : courses.filter(cap => cap.category === selectedCategory);

  // Calcular estadísticas de progreso
  const totalCourses = courses.length;
  const completedCourses = courses.filter(course => course.status === 'completed').length;
  const inProgressCourses = courses.filter(course => course.status === 'in_progress').length;
  const overallProgress = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;

  // Función para actualizar el progreso de un curso
  const updateCourseProgress = (courseId, newStatus, newProgress = 0) => {
    // Guardar en localStorage
    saveProgress(courseId, newStatus, newProgress);
    
    // Actualizar estado local
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId 
          ? { ...course, status: newStatus, progress: newProgress }
          : course
      )
    );

    // Mostrar mensaje de éxito
    if (newStatus === 'completed') {
      setSuccessMessage(`¡Felicidades! Has completado el curso. 🎉`);
      setShowSuccess(true);
    } else if (newStatus === 'in_progress') {
      setSuccessMessage(`¡Bien! Has comenzado el curso. 💪`);
      setShowSuccess(true);
    }
  };

  // Función para obtener el icono de estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'in_progress':
        return <PlayCircleIcon sx={{ color: 'warning.main' }} />;
      default:
        return <PauseCircleIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in_progress':
        return 'En Curso';
      default:
        return 'Pendiente';
    }
  };

  const handleVideoOpen = (video, fromButton = false) => {
    // Solo permitir abrir video desde botones para tracking
    if (!fromButton) {
      return;
    }
    
    // Si es la primera vez que se abre, marcar como en progreso
    if (video.status === 'pending') {
      updateCourseProgress(video.id, 'in_progress', 25);
    }
    
    setSelectedVideo(video);
  };

  const handleVideoClose = () => {
    setSelectedVideo(null);
  };

  const handleShare = (video) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      // Aquí podrías mostrar un snackbar de confirmación
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" component="h2" gutterBottom sx={{ 
          fontWeight: 800,
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}>
          Capacitaciones Gratuitas
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          Aprende de expertos con videos originales diseñados específicamente para emprendedoras
        </Typography>

        {/* Barra de Progreso Inspiracional */}
        <Box sx={{ 
          maxWidth: 800, 
          mx: 'auto', 
          mb: 4, 
          p: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon sx={{ fontSize: 28, color: '#FFD700' }} />
              <Typography variant="h6" fontWeight="bold">
                Tu Progreso de Aprendizaje
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" fontWeight="bold">
                {completedCourses}/{totalCourses} Completados
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                Progreso de: {currentUser}
              </Typography>
            </Box>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={overallProgress} 
            sx={{ 
              height: 12, 
              borderRadius: 6, 
              mb: 2,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                borderRadius: 6
              }
            }} 
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {overallProgress.toFixed(0)}% Completado
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {completedCourses > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {completedCourses} Estrella{completedCourses > 1 ? 's' : ''}
                  </Typography>
                </Box>
              )}
              {inProgressCourses > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PlayCircleIcon sx={{ fontSize: 16, color: '#FFA500' }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {inProgressCourses} En Curso
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Filtros por categoría */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
          {categories.map((category) => {
            const IconComponent = categoryIcons[category] || SchoolIcon;
            return (
              <Chip
                key={category}
                icon={<IconComponent />}
                label={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                color={selectedCategory === category ? 'primary' : 'default'}
                sx={{
                  mb: 1,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Grid de Videos */}
      <Grid container spacing={4}>
        {filteredCapacitaciones.map((video) => {
          const CategoryIcon = categoryIcons[video.category];
          return (
            <Grid item xs={12} md={6} lg={4} key={video.id}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}>
                {/* Thumbnail con play button */}
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={video.thumbnail}
                    alt={video.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.3)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      cursor: 'not-allowed',
                      '&:hover': {
                        opacity: 1
                      }
                    }}
                    onClick={() => {
                      // Mostrar mensaje de que debe usar el botón
                      setSuccessMessage('¡Usa el botón "Comenzar" para iniciar el curso! 📚');
                      setShowSuccess(true);
                    }}
                  >
                    <IconButton
                      sx={{
                        bgcolor: 'grey.500',
                        color: 'white',
                        width: 80,
                        height: 80,
                        '&:hover': {
                          bgcolor: 'grey.600',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <PlayIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                  </Box>
                  
                  {/* Duración */}
                  <Chip
                    label={video.duration}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.8)',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {/* Categoría, nivel y estado */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<CategoryIcon />}
                      label={video.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={video.level}
                      size="small"
                      color={levelColors[video.level]}
                      variant="filled"
                    />
                    <Chip
                      icon={getStatusIcon(video.status)}
                      label={getStatusText(video.status)}
                      size="small"
                      color={getStatusColor(video.status)}
                      variant="filled"
                    />
                  </Box>

                  {/* Título */}
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '3.6em'
                  }}>
                    {video.title}
                  </Typography>

                  {/* Descripción */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '4.5em'
                    }}
                  >
                    {video.description}
                  </Typography>

                  {/* Instructor */}
                  <Typography variant="body2" color="primary.main" fontWeight="bold" sx={{ mb: 2 }}>
                    Por: {video.instructor}
                  </Typography>

                  {/* Barra de progreso individual */}
                  {video.status === 'in_progress' && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={video.progress} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
                            borderRadius: 3
                          }
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {video.progress}% Completado
                      </Typography>
                    </Box>
                  )}

                  {/* Stats y acciones */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        👁️ {video.views.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ❤️ {video.likes}
                      </Typography>
                    </Box>
                    
                    <IconButton
                      size="small"
                      onClick={() => handleShare(video)}
                      sx={{ color: 'primary.main' }}
                    >
                      <ShareIcon />
                    </IconButton>
                  </Box>

                  {/* Botones de estado */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {video.status === 'pending' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<PlayCircleIcon />}
                        onClick={() => {
                          updateCourseProgress(video.id, 'in_progress', 25);
                          handleVideoOpen(video, true);
                        }}
                        sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                      >
                        Comenzar Curso
                      </Button>
                    )}
                    {video.status === 'in_progress' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          startIcon={<PlayCircleIcon />}
                          onClick={() => {
                            updateCourseProgress(video.id, 'in_progress', Math.min(video.progress + 25, 75));
                            handleVideoOpen(video, true);
                          }}
                          sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                        >
                          Continuar Curso
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => updateCourseProgress(video.id, 'completed', 100)}
                          sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                        >
                          Marcar Completado
                        </Button>
                      </>
                    )}
                    {video.status === 'completed' && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<PlayCircleIcon />}
                          onClick={() => handleVideoOpen(video, true)}
                          sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                        >
                          Ver de Nuevo
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          disabled
                          sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                        >
                          ¡Completado! 🎉
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>


      {/* Modal de Video */}
      <Dialog
        open={!!selectedVideo}
        onClose={handleVideoClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        {selectedVideo && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                  {selectedVideo.title}
                </Typography>
                <IconButton onClick={handleVideoClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              {/* Video */}
              <Box sx={{ mb: 3 }}>
                <iframe
                  width="100%"
                  height="400"
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: '12px' }}
                />
              </Box>

              {/* Información del video */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  icon={React.createElement(categoryIcons[selectedVideo.category])}
                  label={selectedVideo.category}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={selectedVideo.level}
                  color={levelColors[selectedVideo.level]}
                  variant="filled"
                />
                <Chip
                  label={selectedVideo.duration}
                  variant="outlined"
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedVideo.description}
              </Typography>

              <Typography variant="body2" color="primary.main" fontWeight="bold">
                Instructor: {selectedVideo.instructor}
              </Typography>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={handleVideoClose}
                color="inherit"
                sx={{ mr: 1 }}
              >
                Cerrar
              </Button>
              <Button 
                onClick={() => handleShare(selectedVideo)}
                variant="contained"
                color="primary"
                startIcon={<ShareIcon />}
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  fontWeight: 'bold'
                }}
              >
                Compartir
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar para mensajes de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{ 
            borderRadius: 2,
            fontWeight: 'bold',
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CapacitacionesSection;
