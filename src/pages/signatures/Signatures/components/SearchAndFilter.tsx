import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Download, Loader2 } from 'lucide-react';
import api from '@/config/api';
import { useToast } from '@/hooks/use-toast';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentYear: string;
  onYearChange: (year: string) => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  currentYear,
  onYearChange
}) => {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleYearChange = () => {
    onYearChange(selectedYear);
    setIsYearDialogOpen(false);
  };

  const handleDownloadHost = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get('/signature-host/download', { responseType: 'blob' });
      const disposition = response.headers['content-disposition'] as string | undefined;
      let filename = 'signature-host.exe';
      if (disposition) {
        const match = /filename="?([^";]+)"?/i.exec(disposition);
        if (match && match[1]) filename = match[1];
      }
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: 'Download iniciado', description: `Baixando ${filename}` });
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Não foi possível baixar o executável';
      toast({ title: 'Erro no download', description: msg, variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Pesquisar documentos pendentes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-80"
        />
      </div>
      
      <Dialog open={isYearDialogOpen} onOpenChange={setIsYearDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            {currentYear}
          </Button>
        </DialogTrigger>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleDownloadHost}
          disabled={isDownloading}
          aria-label="Baixar host de assinatura"
          title="Baixar host de assinatura"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Selecionar Ano dos Documentos</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="year" className="text-right">
                Ano:
              </label>
              <div className="col-span-3">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsYearDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleYearChange}>
              Carregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};