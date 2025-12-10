import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
vi.mock('@/contexts/AuthContext', () => {
  return {
    useAuth: () => ({ user: { role: 'admin' }, isAuthenticated: true, loading: false })
  }
})
import { PermissionService } from '@/lib/PermissionService'

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
)

describe('ProtectedRoute', () => {
  beforeEach(() => {
    PermissionService.setPermissions([])
  })

  it('bloqueia acesso sem permissao de tela', () => {
    PermissionService.setPermissions([])
    const { container } = render(
      <Wrapper>
        <ProtectedRoute telaId={1}><div>Conteudo</div></ProtectedRoute>
      </Wrapper>
    )
    expect(container.innerHTML).not.toContain('Conteudo')
  })

  it('permite acesso com acesso_tela na tela', () => {
    PermissionService.setPermissions([{ tela: 1, permissao: 'acesso_tela', ativo: true }])
    const { container } = render(
      <Wrapper>
        <ProtectedRoute telaId={1}><div>OK</div></ProtectedRoute>
      </Wrapper>
    )
    expect(container.innerHTML).toContain('OK')
  })
})