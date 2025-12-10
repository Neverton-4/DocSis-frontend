import { useState, useEffect } from 'react'

export const usePublicationViewer = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState('')

  useEffect(() => {
    setLoading(true)
    try {
      setPdfUrl('')
      setLoading(false)
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar publicação')
      setLoading(false)
    }
  }, [])

  const onView = () => {}
  const onDownload = () => {}

  return { loading, error, pdfUrl, onView, onDownload }
}