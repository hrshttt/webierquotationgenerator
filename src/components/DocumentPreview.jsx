import { useRef } from 'react'
import { useLetterhead } from '../context/LetterheadContext'
import { sanitizeFilename } from '../utils/pdf'
import { Download, RefreshCw, Copy, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import html2pdf from 'html2pdf.js'

export default function DocumentPreview({
  children,
  isLoading,
  isGenerated,
  onRegenerate,
  filename = 'Document',
  emptyMessage = 'Fill in the form and click Generate to see your document here.',
}) {
  const { header, footer, error: letterheadError } = useLetterhead()
  const previewRef = useRef(null)

  const handleExportPDF = async () => {
    if (!previewRef.current) return

    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' })

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `${sanitizeFilename(filename)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }

      await html2pdf().set(opt).from(previewRef.current).save()
      toast.success('PDF exported successfully!', { id: 'pdf-export' })
    } catch (err) {
      toast.error('Failed to export PDF: ' + err.message, { id: 'pdf-export' })
    }
  }

  const handleCopyToClipboard = async () => {
    if (!previewRef.current) return
    try {
      const text = previewRef.current.innerText
      await navigator.clipboard.writeText(text)
      toast.success('Content copied to clipboard!')
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface rounded-2xl border border-white/5 p-12">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-electric/20 border-t-electric animate-spin-slow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-electric/10" />
          </div>
        </div>
        <p className="text-gray-400 mt-6 text-sm font-medium">Generating your document...</p>
        <p className="text-gray-600 mt-1 text-xs">AI is writing the content</p>
      </div>
    )
  }

  if (!isGenerated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface rounded-2xl border border-white/5 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm max-w-xs">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-300 mr-auto">Document Preview</h3>

        {letterheadError && (
          <div className="flex items-center gap-1.5 text-yellow-500 text-xs mr-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>No letterhead</span>
          </div>
        )}

        <button
          onClick={handleCopyToClipboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy
        </button>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        )}
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-electric hover:bg-electric-dark rounded-lg transition-all duration-200 shadow-sm shadow-electric/20"
        >
          <Download className="w-3.5 h-3.5" />
          Export PDF
        </button>
      </div>

      {/* Preview container */}
      <div className="flex-1 bg-gray-200 rounded-2xl p-4 sm:p-6 overflow-auto max-h-[calc(100vh-220px)]">
        <div
          ref={previewRef}
          id="document-preview"
          className="max-w-[210mm] mx-auto shadow-xl rounded-sm"
          style={{
            background: '#ffffff',
            minHeight: '297mm',
          }}
        >
          {/* Letterhead Header */}
          {header && (
            <div style={{ width: '100%', padding: '24px 40px 0 40px' }}>
              <img
                src={header}
                alt="Webier Studio Letterhead"
                style={{ width: '100%', display: 'block' }}
                crossOrigin="anonymous"
              />
            </div>
          )}

          {/* Document Content */}
          <div style={{ padding: '20px 40px 30px 40px' }}>
            {children}
          </div>

          {/* Letterhead Footer */}
          {footer && (
            <div style={{ width: '100%', padding: '0 40px 24px 40px', marginTop: 'auto' }}>
              <img
                src={footer}
                alt="Webier Studio Footer"
                style={{ width: '100%', display: 'block' }}
                crossOrigin="anonymous"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
