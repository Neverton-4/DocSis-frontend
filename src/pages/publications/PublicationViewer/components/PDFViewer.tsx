import React from 'react'
import { PDFViewer as SharedPDFViewer } from '@/components/shared/PDFViewer'

type Props = {
  pdfUrl: string
  loading: boolean
  error: string | null
}

export const PDFViewer: React.FC<Props> = ({ pdfUrl, loading, error }) => {
  return <SharedPDFViewer pdfUrl={pdfUrl} loading={loading} error={error} />
}