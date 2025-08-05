import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { STORE_CONFIG } from '../config/store';

// Importa imágenes separadas para desktop y mobile (fallback)
import img1 from '../images/banner1.png';
import img2 from '../images/banner2.png';
import img3 from '../images/banner3.png';
import img4 from '../images/banner4.png';
import img5 from '../images/banner5.png';
import img6 from '../images/banner4.2.png';
import img7 from '../images/banner1.2.png';

const defaultMobileImages = [img1, img2, img3, img4, img5];
const defaultDesktopImages = [img7, img3, img6, img5];

// Hook personalizado para detectar el tamaño de pantalla
const useScreenSize = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile };
};

interface CarouselProps {
  showCarousel?: boolean;
}

export function Carousel({ showCarousel = true }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const { isMobile } = useScreenSize();
  
  // Usar banner dinámico de Firebase o fallback a imágenes locales
  const getDynamicImages = () => {
    if (STORE_CONFIG.bannerUrl) {
      // Si hay banner de Firebase, usar solo ese
      return [STORE_CONFIG.bannerUrl];
    }
    // Si no hay banner, usar imágenes por defecto
    return isMobile ? defaultMobileImages : defaultDesktopImages;
  };
  
  const activeImages = getDynamicImages();

  useEffect(() => {
    // Reinicia el índice al cambiar entre vistas
    setCurrentIndex(0);
  }, [activeImages]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeImages.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [activeImages.length, isPlaying]);

  const prev = () => setCurrentIndex((prev) => 
    (prev - 1 + activeImages.length) % activeImages.length
  );
  
  const next = () => setCurrentIndex((prev) => 
    (prev + 1) % activeImages.length
  );

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (!showCarousel) return null;

  return (
    <div className="relative h-[350px] md:h-[500px] w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-large group">
      {/* Container de imágenes */}
      <div className="relative w-full h-full">
        {activeImages.map((img, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-all duration-700 ease-in-out ${
              index === currentIndex 
                ? 'translate-x-0 opacity-100 scale-100' 
                : index < currentIndex 
                  ? '-translate-x-full opacity-0 scale-105'
                  : 'translate-x-full opacity-0 scale-105'
            }`}
          >
            <img
              src={img}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            
            {/* Overlay gradient para mejor legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-red-600 p-3 rounded-full shadow-medium hover:shadow-large transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Imagen anterior"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-red-600 p-3 rounded-full shadow-medium hover:shadow-large transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Siguiente imagen"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Indicadores de posición */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {activeImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 hover:scale-125 ${
              index === currentIndex
                ? 'bg-white shadow-lg scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>

      {/* Control play/pause */}
      <button
        onClick={togglePlayPause}
        className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-black/50 transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label={isPlaying ? 'Pausar slideshow' : 'Reproducir slideshow'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      {/* Indicador de progreso */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
          style={{ 
            width: `${((currentIndex + 1) / activeImages.length) * 100}%` 
          }}
        />
      </div>

      {/* Contador de imágenes */}
      <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {currentIndex + 1} / {activeImages.length}
      </div>
    </div>
  );
}