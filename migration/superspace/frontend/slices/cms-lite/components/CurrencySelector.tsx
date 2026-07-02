import { useCurrency } from "../contexts/CurrencyContext";
import { DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrency, availableCurrencies, isLoading } = useCurrency();

  if (isLoading) {
    return null;
  }

  const currencySymbols: Record<string, string> = {
    USD: "$",
    SAR: "﷼",
    EUR: "€",
    IDR: "Rp",
  };

  return (
    <div className="flex items-center gap-1">
      <DollarSign className="w-4 h-4 text-foreground/60" />
      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
        <SelectTrigger className="w-[100px] h-8 text-sm border-none bg-transparent">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableCurrencies.map((currency) => (
            <SelectItem key={currency} value={currency}>
              {currencySymbols[currency] || currency} {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
