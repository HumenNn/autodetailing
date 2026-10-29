// Fallback изображения на случай если основные не загружаются
export const getImageUrl = (imageName) => {
  // Сначала пробуем локальные изображения
  const localPath = `/images/${imageName}`;
  
  // Fallback на онлайн изображения если локальные не работают
  // Убрали work1.jpg - work6.jpg из fallback, чтобы использовать локальные
  const fallbackImages = {
    'hero.jpg': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'polishing.jpg': 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'ceramic.jpg': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'cleaning.jpg': 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'master1.jpg': 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'master2.jpg': 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'master3.jpg': 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    // Убрали work1.jpg, work2.jpg, work3.jpg, work4.jpg, work5.jpg, work6.jpg
    // Теперь они будут использовать локальные файлы из /images/
  };
  
  return fallbackImages[imageName] || localPath;
};
