import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import PermissionGate from '@/components/shared/PermissionGate'
import { PermissionService } from '@/lib/PermissionService'

describe('Permissões E2E simples', () => {
  beforeEach(() => {
    PermissionService.setPermissions([])
  })

  it('esconde elemento quando não permitido', () => {
    const { container } = render(
      <PermissionGate codigo="acesso_tela" telaId={1}>
        <button>Botao</button>
      </PermissionGate>
    )
    expect(container.innerHTML).toBe('')
  })

  it('mostra elemento quando permitido', () => {
    PermissionService.setPermissions([{ tela: 1, permissao: 'acesso_tela', ativo: true }])
    const { container } = render(
      <PermissionGate codigo="acesso_tela" telaId={1}>
        <button>Botao</button>
      </PermissionGate>
    )
    expect(container.innerHTML).toContain('Botao')
  })
})