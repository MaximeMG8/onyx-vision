import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Camera, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PROJECT_COLORS, ProjectColor, Project } from '@/types/project';
import { cn } from '@/lib/utils';
interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSave: (projectId: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
}
const EditProjectDialog = ({
  isOpen,
  onClose,
  project,
  onSave
}: EditProjectDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(project.name);
  const [targetAmount, setTargetAmount] = useState(project.targetAmount.toString());
  const [palierValue, setPalierValue] = useState(project.palierValue.toString());
  const [selectedColor, setSelectedColor] = useState<ProjectColor>(project.color);
  const [deadline, setDeadline] = useState<Date | undefined>(project.deadline ? new Date(project.deadline) : undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(project.imageUrl);

  // Reset form when project changes
  useEffect(() => {
    setName(project.name);
    setTargetAmount(project.targetAmount.toString());
    setPalierValue(project.palierValue.toString());
    setSelectedColor(project.color);
    setDeadline(project.deadline ? new Date(project.deadline) : undefined);
    setImagePreview(project.imageUrl);
  }, [project]);
  const handleSave = () => {
    const amount = parseFloat(targetAmount);
    const palier = parseFloat(palierValue) || 15;
    if (name.trim() && amount > 0) {
      onSave(project.id, {
        name: name.trim(),
        targetAmount: amount,
        palierValue: palier,
        color: selectedColor,
        deadline: deadline?.toISOString().split('T')[0],
        imageUrl: imagePreview
      });
      onClose();
    }
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const isValid = name.trim() && parseFloat(targetAmount) > 0;
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-white/10 max-w-sm p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-white/5">
          <DialogTitle className="text-white font-extralight tracking-[0.2em] uppercase text-sm text-center">
            Modifier le Projet
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          {/* Project Image */}
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => fileInputRef.current?.click()} className="relative w-20 h-20 rounded-full border border-white/20 overflow-hidden group transition-all hover:border-white/40">
              {imagePreview ? <img src={imagePreview} alt="Project" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" /> : <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white/40" strokeWidth={1} />
                </div>}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
            </button>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              Appuyez pour changer l'image
            </span>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <label className="text-[10px] text-white/50 uppercase tracking-[0.15em]">
              Nom du Projet
            </label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Rolex, Appartement..." className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-3 text-white font-extralight text-lg focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20" />
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <label className="text-[10px] text-white/50 uppercase tracking-[0.15em]">
              Montant fINAL (€)
            </label>
            <Input type="number" min="1" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="Ex : 250000" className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-3 text-white font-extralight text-lg focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20" />
          </div>

          {/* Milestone Value */}
          <div className="space-y-2">
            <label className="text-[10px] text-white/50 uppercase tracking-[0.15em]">
              Valeur du Palier (€)
            </label>
            <Input type="number" min="1" value={palierValue} onChange={e => setPalierValue(e.target.value)} placeholder="Ex : 15" className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-3 text-white font-extralight text-lg focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20" />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="text-[10px] text-white/50 uppercase tracking-[0.15em]">
              Date Limite
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className={cn("w-full justify-start text-left font-extralight bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-3 h-auto hover:bg-transparent hover:border-white/50", !deadline && "text-white/20")}>
                  <CalendarIcon className="mr-3 h-4 w-4 text-white/40" strokeWidth={1.5} />
                  {deadline ? format(deadline, "PPP") : "Définir une date limite"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black border border-white/20" align="start">
                <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus disabled={date => date < new Date()} className="p-3 pointer-events-auto bg-black text-white" />
                {deadline && <div className="p-3 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setDeadline(undefined)} className="w-full text-white/60 hover:text-white hover:bg-white/5 font-extralight text-xs">
                      Supprimer la date limite
                    </Button>
                  </div>}
              </PopoverContent>
            </Popover>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="text-[10px] text-white/50 uppercase tracking-[0.15em]">
              Thème & Couleur       
            </label>
            <div className="flex gap-3 justify-center">
              {(Object.keys(PROJECT_COLORS) as ProjectColor[]).map(color => {
              const colorConfig = PROJECT_COLORS[color];
              const isSelected = selectedColor === color;
              return <button key={color} onClick={() => setSelectedColor(color)} className={cn("w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center", isSelected && "ring-1 ring-offset-2 ring-offset-black ring-white/50")} style={{
                backgroundColor: `hsl(${colorConfig.hsl})`
              }} title={colorConfig.label}>
                    {isSelected && <div className={cn("w-1.5 h-1.5 rounded-full", color === 'white' || color === 'yellow' ? 'bg-black' : 'bg-white')} />}
                  </button>;
            })}
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full bg-transparent border border-white/30 text-white hover:bg-white hover:text-black font-extralight tracking-wider uppercase text-xs py-6 transition-all duration-300" disabled={!isValid}>
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default EditProjectDialog;