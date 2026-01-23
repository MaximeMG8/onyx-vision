import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PROJECT_COLORS, ProjectColor } from '@/types/project';

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, targetAmount: number, color: ProjectColor, palierValue: number) => void;
}

const CreateProjectDialog = ({ isOpen, onClose, onCreate }: CreateProjectDialogProps) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [palierValue, setPalierValue] = useState('15');
  const [selectedColor, setSelectedColor] = useState<ProjectColor>('white');

  const handleCreate = () => {
    const amount = parseFloat(targetAmount);
    const palier = parseFloat(palierValue) || 15;
    
    if (name.trim() && amount > 0) {
      onCreate(name.trim(), amount, selectedColor, palier);
      // Reset form
      setName('');
      setTargetAmount('');
      setPalierValue('15');
      setSelectedColor('white');
    }
  };

  const isValid = name.trim() && parseFloat(targetAmount) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground font-light tracking-wide">
            Nouveau Projet
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-extralight">
            Créez un nouvel objectif d'épargne
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Project Name */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground tracking-wide">
              Nom du projet
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Rolex, Appartement..."
              className="bg-card border-border/50 font-light"
            />
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground tracking-wide">
              Montant cible (€)
            </label>
            <Input
              type="number"
              min="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Ex: 10000"
              className="bg-card border-border/50 font-light"
            />
          </div>

          {/* Palier Value */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground tracking-wide">
              Valeur d'un palier (€)
            </label>
            <Input
              type="number"
              min="1"
              value={palierValue}
              onChange={(e) => setPalierValue(e.target.value)}
              placeholder="Ex: 15"
              className="bg-card border-border/50 font-light"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground tracking-wide">
              Couleur du thème
            </label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(PROJECT_COLORS) as ProjectColor[]).map((color) => {
                const colorConfig = PROJECT_COLORS[color];
                const isSelected = selectedColor === color;
                
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground/50' : ''
                    }`}
                    style={{ backgroundColor: `hsl(${colorConfig.hsl})` }}
                    title={colorConfig.label}
                  >
                    {isSelected && (
                      <div className={`w-2 h-2 rounded-full ${color === 'white' || color === 'yellow' ? 'bg-black' : 'bg-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleCreate}
            variant="outline"
            className="w-full border-foreground/30 hover:bg-foreground hover:text-background mt-4"
            disabled={!isValid}
          >
            Créer le projet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
