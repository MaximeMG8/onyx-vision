import { useState, useRef, useEffect } from "react";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Deposit } from "@/hooks/useDepositManager";

interface DepositHistoryProps {
  deposits: Deposit[];
  onRemoveDeposit: (id: string) => void;
  children: React.ReactNode;
}

const DepositHistory = ({ deposits, onRemoveDeposit, children }: DepositHistoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState(0);

  useEffect(() => {
    const savedNotes = localStorage.getItem("deposit_notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNote = (depositId: string, note: string) => {
    const updatedNotes = { ...notes, [depositId]: note };
    setNotes(updatedNotes);
    localStorage.setItem("deposit_notes", JSON.stringify(updatedNotes));
    setEditingId(null);
  };

  const startEditing = (depositId: string) => {
    setEditingId(depositId);
    setEditingNote(notes[depositId] || "");
  };

  const handleDragStart = (e: React.PointerEvent) => {
    setDragStart(e.clientY);
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    const dragDistance = e.clientY - dragStart;
    if (dragDistance > 100) {
      setIsOpen(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedDeposits = [...deposits].sort((a, b) => b.timestamp - a.timestamp);
  const canDelete = sortedDeposits.length > 0 && sortedDeposits[0].id !== 'initial';

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-background border-border/30 h-[70vh] p-0 flex flex-col">
        <div
          className="pt-3 pb-4 cursor-grab active:cursor-grabbing flex flex-col items-center sticky top-0 bg-background border-b border-border/20 z-10"
          onPointerDown={handleDragStart}
          onPointerUp={handleDragEnd}
          ref={sheetRef}
        >
          <motion.div
            className="w-12 h-1 bg-foreground/30 rounded-full"
            initial={{ opacity: 0.5 }}
            whileHover={{ opacity: 0.7 }}
            transition={{ duration: 0.2 }}
          />
          <p className="text-xs text-muted-foreground mt-2 font-extralight">
            Glissez pour fermer
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <h2 className="text-foreground font-light tracking-wide text-lg mb-4">
            Historique des dépôts
          </h2>

          <div className="space-y-2">
            {sortedDeposits.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 font-extralight">
                Aucun dépôt pour le moment
              </p>
            ) : (
              <AnimatePresence mode="popLayout">
                {sortedDeposits.map((deposit, index) => (
                  <motion.div
                    key={deposit.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="group"
                  >
                    {editingId === deposit.id ? (
                      <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-card/50 border border-border/20">
                        <Input
                          value={editingNote}
                          onChange={(e) => setEditingNote(e.target.value)}
                          placeholder="Ajouter une note..."
                          className="text-sm bg-background/50 border-border/30"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => saveNote(deposit.id, editingNote)}
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-600/10"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="h-8 w-8 text-muted-foreground hover:bg-card/50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-card/50 border border-border/20 group/item">
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-light">
                              +{deposit.amount}€
                            </span>
                            {notes[deposit.id] && (
                              <span className="text-xs text-muted-foreground/70 italic truncate">
                                {notes[deposit.id]}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-extralight">
                            {formatDate(deposit.date)} à {formatTime(deposit.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditing(deposit.id)}
                            className="h-8 w-8 text-foreground/60 hover:text-foreground hover:bg-card/50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          {index === 0 && canDelete && deposit.id !== 'initial' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onRemoveDeposit(deposit.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {canDelete && (
          <div className="border-t border-border/20 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground font-extralight">
              Seul le dernier dépôt peut être supprimé
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DepositHistory;
