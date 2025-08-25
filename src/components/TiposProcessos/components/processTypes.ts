// constants/processTypes.ts
export const PROCESS_TYPES = [
    { value: 'licenca', label: 'Licenças' },
    { value: 'declaracao', label: 'Declarações' },
    { value: 'gratificacao', label: 'Gratificações' },
    { value: 'outro', label: 'Outros' }
  ] as const;
  
  export const SECTION_TITLES = {
    licenca: 'Licenças',
    declaracao: 'Declarações',
    gratificacao: 'Gratificações',
    outro: 'Outros'
  } as const;
  
  export type ProcessType = 'licenca' | 'gratificacao' | 'declaracao' | 'outro';