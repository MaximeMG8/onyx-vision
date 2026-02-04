import { useState, useEffect, useRef } from 'react';
import ColorThief from 'colorthief';

interface UseImageColorResult {
  dominantColor: string;
  isLoading: boolean;
}

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export const useImageColor = (imageUrl: string | undefined): UseImageColorResult => {
  const [dominantColor, setDominantColor] = useState<string>('0 0% 100%'); // Default white
  const [isLoading, setIsLoading] = useState(false);
  const colorThiefRef = useRef<ColorThief | null>(null);
  const imageCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!colorThiefRef.current) {
      colorThiefRef.current = new ColorThief();
    }

    if (!imageUrl) {
      setDominantColor('0 0% 100%');
      return;
    }

    // Check cache first
    if (imageCache.current.has(imageUrl)) {
      setDominantColor(imageCache.current.get(imageUrl)!);
      return;
    }

    const extractColor = async () => {
      setIsLoading(true);
      
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageUrl;
        });

        // Ensure image is loaded and has dimensions
        if (img.complete && img.naturalWidth > 0) {
          const colorThief = colorThiefRef.current!;
          const rgb = colorThief.getColor(img);
          
          if (rgb) {
            const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
            // Boost saturation slightly for more vibrant glow
            const boostedS = Math.min(s + 15, 100);
            const hslString = `${h} ${boostedS}% ${l}%`;
            
            imageCache.current.set(imageUrl, hslString);
            setDominantColor(hslString);
          }
        }
      } catch (error) {
        console.warn('Could not extract color from image:', error);
        setDominantColor('0 0% 100%'); // Fallback to white
      } finally {
        setIsLoading(false);
      }
    };

    extractColor();
  }, [imageUrl]);

  return { dominantColor, isLoading };
};

export default useImageColor;
