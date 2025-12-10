import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentYear: string
  selectedYear: string
  onSelectedYearChange: (value: string) => void
  onConfirm: () => void
  trigger: React.ReactNode
}

export const YearSelectorDialog: React.FC<Props> = ({ open, onOpenChange, currentYear, selectedYear, onSelectedYearChange, onConfirm, trigger }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
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
              <Select value={selectedYear} onValueChange={onSelectedYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4].map((offset) => {
                    const y = (new Date().getFullYear() + offset).toString()
                    return (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Carregar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}