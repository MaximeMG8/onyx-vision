import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface AddSavingsButtonProps {
  amount: number;
  currency?: string;
  onClick?: () => void;
  disabled?: boolean;
  completedText?: string;
}

const AddSavingsButton = ({ 
  amount, 
  currency = "€", 
  onClick,
  disabled = false,
  completedText = "Objectif atteint !"
}: AddSavingsButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant={disabled ? "secondary" : "luxury"}
      size="lg"
      disabled={disabled}
      className={`
        animate-fade-up w-full transition-all duration-500
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
      `}
      style={{ animationDelay: '0.5s' }}
    >
      {disabled ? (
        <span className="flex items-center gap-2">
          <Check className="w-4 h-4" />
          {completedText}
        </span>
      ) : (
        `Ajouter (+${amount}${currency})`
      )}
    </Button>
  );
};

export default AddSavingsButton;
