import { Deposit } from "@/hooks/useDepositManager";
import DepositHistory from "./DepositHistory";

interface DailyHistoryProps {
  deposits: Deposit[];
  palierValue: number;
  allDeposits: Deposit[];
  onRemoveDeposit: (id: string) => void;
}

const DailyHistory = ({ deposits, palierValue, allDeposits, onRemoveDeposit }: DailyHistoryProps) => {
  // Group deposits by date
  const depositsByDate = deposits.reduce((acc, deposit) => {
    const date = deposit.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(deposit);
    return acc;
  }, {} as Record<string, Deposit[]>);

  // Get last 7 days sorted by date (most recent first)
  const sortedDates = Object.keys(depositsByDate)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 7);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return "Aujourd'hui";
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return "Hier";
    } else {
      return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' });
    }
  };

  const getPaliersForDate = (dateStr: string) => {
    const dayDeposits = depositsByDate[dateStr] || [];
    const totalAmount = dayDeposits.reduce((sum, d) => sum + d.amount, 0);
    return Math.round(totalAmount / palierValue);
  };

  if (sortedDates.length === 0) {
    return (
      <div className="w-full space-y-2">
        <DepositHistory deposits={allDeposits} onRemoveDeposit={onRemoveDeposit}>
          <button className="w-full py-2 cursor-pointer hover:opacity-80 transition-opacity">
            <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-extralight text-center">
              Historique
            </h3>
          </button>
        </DepositHistory>
        <div className="text-center text-muted-foreground text-xs font-extralight tracking-wide">
          Aucun historique
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <DepositHistory deposits={allDeposits} onRemoveDeposit={onRemoveDeposit}>
        <button className="w-full py-2 cursor-pointer hover:opacity-80 transition-opacity">
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-extralight text-center">
            Historique
          </h3>
        </button>
      </DepositHistory>
      <div className="space-y-1">
        {sortedDates.map((date) => {
          const paliers = getPaliersForDate(date);
          return (
            <div 
              key={date}
              className="flex items-center justify-between py-2 px-4 rounded-lg bg-card/30 border border-border/20"
            >
              <span className="text-sm font-extralight text-foreground/80">
                {formatDate(date)}
              </span>
              <span className="text-sm font-extralight text-foreground/90">
                +{paliers} palier{paliers > 1 ? 's' : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyHistory;
