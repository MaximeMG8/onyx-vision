import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Star, Trash2, Plus } from 'lucide-react';
import { ProjectImage } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Neon red color for active states
const NEON_RED = '0 100% 50%';

interface SortableImageProps {
  image: ProjectImage;
  onSetFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableImage = ({
  image,
  onSetFavorite,
  onDelete
}: SortableImageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: image.id
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1
  };

  // Handle button clicks without triggering drag
  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    callback();
  };

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      className={`relative aspect-square rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging 
          ? 'scale-105 shadow-2xl' 
          : 'hover:scale-[1.02]'
      }`}
      {...attributes}
      {...listeners}
      layout
    >
      {/* Image */}
      <img src={image.url} alt="Gallery image" className="w-full h-full object-cover" />
      
      {/* Dragging overlay with neon red border */}
      {isDragging && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            border: `2px solid hsl(${NEON_RED})`,
            boxShadow: `0 0 20px hsl(${NEON_RED}), 0 0 40px hsl(${NEON_RED} / 0.5), inset 0 0 20px hsl(${NEON_RED} / 0.1)`,
          }}
        />
      )}

      {/* Star/Favorite button - Top Left */}
      <button 
        onClick={(e) => handleButtonClick(e, () => onSetFavorite(image.id))} 
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2 left-2 p-1 transition-all hover:scale-110 z-10" 
        aria-label={image.isFavorite ? 'Image principale' : 'Définir comme principale'}
      >
        <Star 
          className="w-5 h-5 transition-all" 
          strokeWidth={1.5}
          style={image.isFavorite ? {
            fill: 'hsl(0 0% 100%)',
            color: 'hsl(0 0% 100%)',
            filter: `drop-shadow(0 0 6px hsl(${NEON_RED})) drop-shadow(0 0 12px hsl(${NEON_RED}))`,
          } : {
            fill: 'transparent',
            color: 'hsl(0 0% 100% / 0.6)',
          }}
        />
      </button>

      {/* Delete button - Top Right */}
      <button 
        onClick={(e) => handleButtonClick(e, () => onDelete(image.id))} 
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 p-1 transition-all hover:scale-110 z-10" 
        aria-label="Supprimer l'image"
      >
        <Trash2 
          className="w-4 h-4 text-destructive/70 hover:text-destructive transition-colors" 
          strokeWidth={1.25} 
        />
      </button>

      {/* Favorite badge */}
      {image.isFavorite && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm">
          <span className="text-[10px] uppercase tracking-wider text-foreground font-medium">
            Principale
          </span>
        </div>
      )}
    </motion.div>
  );
};
interface GalleryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  images: ProjectImage[];
  onImagesChange: (images: ProjectImage[]) => void;
  maxImages?: number;
}
const GalleryManager = ({
  isOpen,
  onClose,
  images,
  onImagesChange,
  maxImages = 10
}: GalleryManagerProps) => {
  const {
    toast
  } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  // Long press to drag (500ms delay)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      }
    }), 
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.id === active.id);
      const newIndex = images.findIndex(img => img.id === over.id);
      const newImages = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
        ...img,
        order: index
      }));
      onImagesChange(newImages);
    }
  };
  const handleSetFavorite = (id: string) => {
    const newImages = images.map(img => ({
      ...img,
      isFavorite: img.id === id
    }));
    onImagesChange(newImages);
    toast({
      title: 'Image principale définie',
      description: 'Cette image sera affichée comme couverture du projet',
      duration: 2000
    });
  };
  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    const imageToDelete = images.find(img => img.id === deleteConfirmId);
    const newImages = images.filter(img => img.id !== deleteConfirmId).map((img, index) => ({
      ...img,
      order: index
    }));

    // If we deleted the favorite, make the first remaining image the favorite
    if (imageToDelete?.isFavorite && newImages.length > 0) {
      newImages[0].isFavorite = true;
    }
    onImagesChange(newImages);
    setDeleteConfirmId(null);
    toast({
      title: 'Image supprimée',
      description: 'L\'image a été retirée de votre galerie',
      duration: 2000
    });
  };
  const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Galerie pleine',
        description: `Maximum ${maxImages} images autorisées`,
        variant: 'destructive',
        duration: 3000
      });
      return;
    }
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const newImage: ProjectImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          url: e.target?.result as string,
          order: images.length,
          isFavorite: images.length === 0,
          // First image is favorite by default
          uploadedAt: Date.now()
        };
        onImagesChange([...images, newImage]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  return <>
      <AnimatePresence>
        {isOpen && <motion.div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md" initial={{
        opacity: 0,
        y: '100%'
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }}>
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 className="tracking-wide uppercase text-foreground text-base text-justify font-thin">
                Gestionnaire de Galerie
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {images.length}/{maxImages}
                </span>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-card transition-colors" aria-label="Fermer la galerie">
                  <X className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                </button>
              </div>
            </header>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map(image => <SortableImage key={image.id} image={image} onSetFavorite={handleSetFavorite} onDelete={id => setDeleteConfirmId(id)} />)}

                    {/* Add button */}
                    {images.length < maxImages && <motion.button onClick={triggerFileInput} className="aspect-square rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 hover:border-foreground/50 hover:bg-card/50 transition-all" whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }}>
                        <Plus className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          Ajouter
                        </span>
                      </motion.button>}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Empty state */}
              {images.length === 0 && <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground text-sm mb-4">
                    Aucune image. Ajoutez votre première image pour commencer.
                  </p>
                  <button onClick={triggerFileInput} className="px-6 py-3 rounded-full bg-foreground text-background font-medium text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors">
                    Ajouter une Image
                  </button>
                </div>}
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleAddImages} className="hidden" />

            {/* Footer instructions */}
            <footer className="p-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center font-extralight">
                Glisser pour réorganiser • Étoile pour définir comme principale • Supprimer pour retirer
              </p>
            </footer>
          </motion.div>}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'image</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer cette image de votre galerie ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
};
export default GalleryManager;