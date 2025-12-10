import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PortariaForm } from '@/components/PortariaForm'

vi.mock('@/hooks/useOptimizedTiposPortaria', () => ({
  useOptimizedTiposPortaria: () => ({
    tiposPortaria: [{ id: 1, nome: 'Administrativa' }],
    subtiposPortaria: [],
    loading: false,
    loadingSubtipos: false,
    error: null,
    errorSubtipos: null,
    refetch: vi.fn(),
    fetchSubtiposByTipo: vi.fn(),
  }),
}))

vi.mock('@/services/documentoPortariaService', () => ({
  documentoService: {
    createWithDocument: vi.fn(async () => ({ id: 1 })),
  },
}))

describe('PortariaForm', () => {
  it('valida preâmbulo obrigatório', async () => {
    render(<PortariaForm />)

    fireEvent.click(screen.getByText('Criar Portaria'))

    expect(await screen.findByText('Digite o preâmbulo da portaria')).toBeInTheDocument()
  })
})