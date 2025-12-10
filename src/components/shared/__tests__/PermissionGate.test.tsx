import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PermissionGate from '@/components/shared/PermissionGate'

vi.mock('@/lib/PermissionService', () => {
  return {
    PermissionService: {
      has: vi.fn(() => false),
    },
  }
})

const { PermissionService } = await import('@/lib/PermissionService')

describe('PermissionGate', () => {
  beforeEach(() => {
    (PermissionService.has as any).mockReset()
  })

  afterEach(() => {
    (PermissionService.has as any).mockReset()
  })

  it('renderiza children quando permitido (modo hide)', () => {
    (PermissionService.has as any).mockReturnValue(true)
    render(
      <PermissionGate codigo="novo_protocolo" telaId={1}>
        <button>OK</button>
      </PermissionGate>
    )
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('não renderiza quando não permitido (modo hide)', () => {
    (PermissionService.has as any).mockReturnValue(false)
    const { queryByText } = render(
      <PermissionGate codigo="novo_protocolo" telaId={1}>
        <button>OK</button>
      </PermissionGate>
    )
    expect(queryByText('OK')).toBeNull()
  })

  it('desabilita elemento quando não permitido (modo disable)', () => {
    (PermissionService.has as any).mockReturnValue(false)
    render(
      <PermissionGate codigo="novo_cadastro" telaId={1} mode="disable">
        <button>CADASTRAR</button>
      </PermissionGate>
    )
    const btn = screen.getByText('CADASTRAR')
    expect(btn).toBeDisabled()
  })
})