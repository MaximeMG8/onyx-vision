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
    <div className="flex items-center justify-center gap-6 w-full">
      {/* Remove button */}
      <Button
        onClick={() => onRemove(1)}
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-full border border-border/30 hover:border-foreground/20 hover:bg-transparent transition-all duration-300"
        aria-label="Retirer un palier"
      >
        <Minus className="w-5 h-5 text-muted-foreground" strokeWidth={1} />
      </Button>

      {/* Add button */}
      <Button
        onClick={() => onAdd(1)}
        disabled={disabled}
        variant="ghost"
        size="icon"
        className="w-16 h-16 rounded-full border border-foreground/30 hover:border-foreground/50 hover:bg-transparent transition-all duration-300"
        aria-label="Ajouter un palier"
      >
        <Plus className="w-8 h-8 text-foreground" strokeWidth={1} />
      </Button>

      {/* Multiple add dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="h-12 px-5 rounded-full border border-border/30 hover:border-foreground/20 hover:bg-transparent transition-all duration-300 font-extralight tracking-wider text-xs text-muted-foreground"
          >
            Multiple
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
                <p className="text-center text-sm text-foreground font-light">
                  = {parseInt(multipleCount) * 15}€
                </p>
              )}
            </div>
            <Button
              onClick={handleMultipleAdd}
              variant="outline"
              className="w-full border-foreground/30 hover:bg-foreground hover:text-background"
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
