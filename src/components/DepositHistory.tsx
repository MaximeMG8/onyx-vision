import { Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Deposit } from "@/hooks/useDepositManager";

interface DepositHistoryProps {
  deposits: Deposit[];
  onRemoveDeposit: (id: string) => void;
  children: React.ReactNode;
}

const DepositHistory = ({ deposits, onRemoveDeposit, children }: DepositHistoryProps) => {
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
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-background border-border/30 h-[60vh]">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-foreground font-light tracking-wide">
            Historique des dépôts
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-2 overflow-y-auto max-h-[calc(60vh-100px)] pr-2">
          {sortedDeposits.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-extralight">
              Aucun dépôt pour le moment
            </p>
          ) : (
            sortedDeposits.map((deposit, index) => (
              <div
                key={deposit.id}
                className="flex items-center justify-between py-3 px-4 rounded-lg bg-card/50 border border-border/20"
              >
                <div className="flex flex-col">
                  <span className="text-foreground font-light">
                    +{deposit.amount}€
                  </span>
                  <span className="text-xs text-muted-foreground font-extralight">
                    {formatDate(deposit.date)} à {formatTime(deposit.timestamp)}
                  </span>
                </div>
                
                {index === 0 && canDelete && deposit.id !== 'initial' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveDeposit(deposit.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
        
        {canDelete && (
          <p className="text-xs text-muted-foreground text-center mt-4 font-extralight">
            Seul le dernier dépôt peut être supprimé
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DepositHistory;
