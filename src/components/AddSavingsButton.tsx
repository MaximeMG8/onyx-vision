import { Button } from "@/components/ui/button";

interface AddSavingsButtonProps {
  amount: number;
  currency?: string;
  onClick?: () => void;
}

const AddSavingsButton = ({ amount, currency = "€", onClick }: AddSavingsButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="luxury"
      size="lg"
      className="animate-fade-up"
      style={{ animationDelay: '0.5s' }}
    >
      Add Savings (+{amount}{currency})
    </Button>
  );
};

export default AddSavingsButton;
