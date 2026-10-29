export const getImageUrl = (imageName) => {
  // Если изображение уже является полным URL, возвращаем его
  if (imageName.startsWith('http')) {
    return imageName;
  }

  // Локальные изображения в папке public/images
  return `/images/${imageName}`;
};
