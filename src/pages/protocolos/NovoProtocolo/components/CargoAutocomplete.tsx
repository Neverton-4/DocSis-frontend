import React from 'react';
import { Cargo } from '@/services/cargoService';

interface CargoAutocompleteProps {
  cargos: Cargo[];
  showAutocomplete: boolean;
  onCargoSelect: (cargo: Cargo) => void;
}

const CargoAutocomplete: React.FC<CargoAutocompleteProps> = ({
  cargos,
  showAutocomplete,
  onCargoSelect
}) => {
  if (!showAutocomplete || cargos.length === 0) return null;

  return (
    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
      {cargos.map((cargo) => (
        <div
          key={cargo.id}
          className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
          onClick={() => onCargoSelect(cargo)}
        >
          <div className="font-medium text-gray-900">{cargo.nome}</div>
          {cargo.secretaria && (
            <div className="text-sm text-gray-600">
              {cargo.secretaria.abrev} - {cargo.secretaria.nome}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CargoAutocomplete;