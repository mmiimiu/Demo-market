import { PlaceHolderImages } from '../placeholder-images';

export const getImageData = (id: string) => {
  const img = PlaceHolderImages.find(i => i.id === id);
  return {
    url: img?.imageUrl || `https://picsum.photos/seed/${id}/800/600`,
    hint: img?.imageHint || 'thailand property'
  };
};
