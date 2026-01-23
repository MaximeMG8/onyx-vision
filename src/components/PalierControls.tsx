import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PalierControlsProps {
  onAdd: (count: number) => void;
  onRemove: (count: number) => void;
  disabled?: boolean;
}

const PalierControls = ({ onAdd, onRemove, disabled }: PalierControlsProps) => {
  const [multipleCount, setMultipleCount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleMultipleAdd = () => {
    const count = parseInt(multipleCount);
    if (count > 0) {
      onAdd(count);
      setMultipleCount("");
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 w-full">
      {/* Remove button */}
      <Button
        onClick={() => onRemove(1)}
        variant="outline"
        size="icon"
        className="w-14 h-14 rounded-full border-border/50 bg-card/50 hover:bg-card hover:border-foreground/30 transition-all duration-300"
        aria-label="Retirer un palier"
      >
        <Minus className="w-6 h-6 text-foreground" strokeWidth={1.5} />
      </Button>

      {/* Add button */}
      <Button
        onClick={() => onAdd(1)}
        disabled={disabled}
        variant="luxury"
        size="icon"
        className="w-20 h-20 rounded-full text-2xl font-light shadow-lg shadow-luxury-gold/20"
        aria-label="Ajouter un palier"
      >
        <Plus className="w-10 h-10" strokeWidth={1.5} />
      </Button>

      {/* Multiple add dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-14 px-6 rounded-full border-luxury-gold/30 bg-card/50 hover:bg-card hover:border-luxury-gold/50 transition-all duration-300 font-extralight tracking-wider text-sm"
          >
            Ajout Multiple
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-background border-border/50 max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center font-extralight tracking-wider text-lg">
              Ajouter plusieurs paliers
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground tracking-wide">
                Nombre de paliers (× 15€)
              </label>
              <Input
                type="number"
                min="1"
                value={multipleCount}
                onChange={(e) => setMultipleCount(e.target.value)}
                placeholder="Ex: 10 paliers = 150€"
                className="bg-card border-border/50 text-center text-lg font-light"
              />
              {multipleCount && parseInt(multipleCount) > 0 && (
                <p className="text-center text-sm text-luxury-gold font-light">
                  = {parseInt(multipleCount) * 15}€
                </p>
              )}
            </div>
            <Button
              onClick={handleMultipleAdd}
              variant="luxury"
              className="w-full"
              disabled={!multipleCount || parseInt(multipleCount) <= 0}
            >
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PalierControls;
