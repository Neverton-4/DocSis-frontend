import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface YearSelectorProps {
  currentYear: number;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  isYearDialogOpen: boolean;
  setIsYearDialogOpen: (open: boolean) => void;
  onYearChange: () => void;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  currentYear,
  selectedYear,
  setSelectedYear,
  isYearDialogOpen,
  setIsYearDialogOpen,
  onYearChange
}) => {
  return (
    <Dialog open={isYearDialogOpen} onOpenChange={setIsYearDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {currentYear}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Ano</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="year-select">Ano</Label>
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsYearDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={onYearChange}>
            Carregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};