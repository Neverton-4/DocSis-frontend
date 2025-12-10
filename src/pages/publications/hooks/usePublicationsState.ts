import { useEffect, useState, useMemo } from 'react'
import { documentoService as portariaService } from '@/services/documentoPortariaService'
import { decretoService } from '@/services/documentoDecretoService'
import { diariaService, Diaria } from '@/services/diariaService'
import type { Documento as Doc } from '@/types'

export type PublishedDocument = {
  id: number
  number: string
  type: 'portarias' | 'decretos' | 'diarias'
  server: string
  title: string
  date: string | null
  publishDate: string | null
}

export const usePublicationsState = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'portarias' | 'decretos' | 'diarias'>('portarias')
  const initialYear = String(new Date().getFullYear())
  const [currentYear, setCurrentYear] = useState(initialYear)
  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [portarias, setPortarias] = useState<PublishedDocument[]>([])
  const [decretos, setDecretos] = useState<PublishedDocument[]>([])
  const [diarias, setDiarias] = useState<PublishedDocument[]>([])

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const ano = parseInt(currentYear)
        const [p, d, di] = await Promise.all([
          portariaService.getByStatus('publicado', ano).catch(() => [] as Doc[]),
          decretoService.getByStatus('publicado', ano).catch(() => [] as Doc[]),
          diariaService.getByStatus('publicado', ano).catch(() => [] as Diaria[]),
        ])

        const mapDoc = (type: 'portarias' | 'decretos', doc: any): PublishedDocument => ({
          id: Number(doc.id),
          number: `${doc.numero}/${doc.ano}`,
          type,
          server: doc.servidor_nome || doc.servidor?.nome_completo || '',
          title: doc.descricao || doc.titulo || doc.tipo_nome || '',
          date: (doc.data_portaria || doc.data_documento) ?? null,
          publishDate: doc.atualizado_em || doc.data_documento || null,
        })

        const mapDiaria = (doc: Diaria): PublishedDocument => ({
          id: Number(doc.id),
          number: `${doc.numero}/${doc.ano}`,
          type: 'diarias',
          server: doc.servidor?.nome_completo || '',
          title: doc.titulo || 'Diária',
          date: doc.data_diaria || null,
          publishDate: doc.updated_at || doc.data_diaria || null,
        })

        if (!cancelled) {
          setPortarias(Array.isArray(p) ? p.map((x) => mapDoc('portarias', x)) : [])
          setDecretos(Array.isArray(d) ? d.map((x) => mapDoc('decretos', x)) : [])
          setDiarias(Array.isArray(di) ? di.map(mapDiaria) : [])
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Erro ao carregar publicações')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()

    const interval = setInterval(fetchData, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [currentYear])

  useEffect(() => {
    setPage(1)
  }, [activeTab, searchTerm, currentYear])

  const allByTab = useMemo(() => {
    if (activeTab === 'portarias') return portarias
    if (activeTab === 'decretos') return decretos
    return diarias
  }, [activeTab, portarias, decretos, diarias])

  const filteredDocuments = allByTab.filter((doc) => {
    const matchesType = doc.type === activeTab
    const docYearFromNumber = doc.number.includes('/') ? doc.number.split('/')[1] : null
    const docYearFromPublish = doc.publishDate ? new Date(doc.publishDate).getFullYear().toString() : null
    const matchesYear = (docYearFromNumber || docYearFromPublish) === currentYear
    const matchesSearch =
      !searchTerm ||
      doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.server.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesType && matchesYear && matchesSearch
  })

  const total = filteredDocuments.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const paginatedDocuments = filteredDocuments.slice((page - 1) * perPage, page * perPage)

  const handleYearChange = () => {
    setCurrentYear(selectedYear)
    setIsDialogOpen(false)
  }

  return {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    currentYear,
    selectedYear,
    setSelectedYear,
    isDialogOpen,
    setIsDialogOpen,
    filteredDocuments: paginatedDocuments,
    loading,
    error,
    page,
    perPage,
    total,
    totalPages,
    setPage,
    setPerPage,
    handleYearChange
  }
}