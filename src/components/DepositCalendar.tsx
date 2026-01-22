import { Check } from "lucide-react";

interface DepositCalendarProps {
  depositDays: string[];
}

const DepositCalendar = ({ depositDays }: DepositCalendarProps) => {
  // Get the last 14 days
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'narrow' }),
        dayNumber: date.getDate(),
        isToday: i === 0,
      });
    }
    
    return days;
  };

  const days = getDaysArray();
  const depositSet = new Set(depositDays);

  return (
    <div className="w-full px-2">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 text-center font-extralight">
        Mes 14 derniers jours
      </p>
      <div className="flex justify-center gap-1.5 flex-wrap">
        {days.map((day) => {
          const hasDeposit = depositSet.has(day.date);
          
          return (
            <div
              key={day.date}
              className={`
                flex flex-col items-center justify-center
                w-8 h-10 rounded-md
                transition-all duration-300
                ${day.isToday ? 'ring-1 ring-foreground/30' : ''}
                ${hasDeposit ? 'bg-foreground/10' : 'bg-card/30'}
              `}
            >
              <span className="text-[9px] text-muted-foreground font-extralight uppercase">
                {day.dayName}
              </span>
              <div className="relative flex items-center justify-center w-5 h-5">
                {hasDeposit ? (
                  <Check className="w-3.5 h-3.5 text-foreground" strokeWidth={2.5} />
                ) : (
                  <span className="text-xs text-muted-foreground/50 font-extralight">
                    {day.dayNumber}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DepositCalendar;
