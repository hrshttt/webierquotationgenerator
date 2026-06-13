import { useRef } from 'react'
import { useLetterhead } from '../context/LetterheadContext'
import { sanitizeFilename } from '../utils/pdf'
import { Download, RefreshCw, Copy, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DocumentPreview({
  children,
  isLoading,
  isGenerated,
  onRegenerate,
  filename = 'Document',
  emptyMessage = 'Fill in the form and click Generate to see your document here.',
  hideLetterhead = false,
}) {
  const { header, footer, error: letterheadError } = useLetterhead()
  const previewRef = useRef(null)

  const handleExportPDF = () => {
    if (!previewRef.current) return;

    // Grab the exact HTML the browser is rendering
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${sanitizeFilename(filename)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Segoe UI', sans-serif; background: #ffffff; }
  @media print {
    @page { margin: 0; size: auto; }
    body { margin: 0; }
  }
</style>
</head>
<body>
${previewRef.current.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(filename)}.html`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('HTML file downloaded! Open it in your browser and print to PDF.', { id: 'pdf-export' });
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
      {/* Print-only styles: hide everything except #document-preview */}
      <style>{`
        @media print {
          /* Hide EVERYTHING on the page */
          body * {
            visibility: hidden !important;
          }
          /* Then show ONLY the document preview and its children */
          #document-preview,
          #document-preview * {
            visibility: visible !important;
          }
          /* Position it at the top-left of the page */
          #document-preview {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          /* Remove all page margins */
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

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
            minHeight: '296mm',
          }}
        >
          {/* Letterhead Header */}
          {!hideLetterhead && (
            <div style={{ backgroundColor: '#3533CD', color: '#ffffff', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.128em' }}>
                webier<span style={{ color: '#F5C518' }}>.</span>
              </div>
              <div style={{ borderLeft: '2px solid #F5C518', paddingLeft: '16px', fontSize: '11px', lineHeight: 1.6, color: '#ffffff', opacity: 0.9, textAlign: 'left' }}>
                <div>webierstudio.com</div>
                <div>contact@webierstudio.com</div>
                <div>+91 9257565709</div>
              </div>
            </div>
          )}

          {/* Document Content */}
          <div style={{ padding: '20px 40px 30px 40px' }}>
            {children}
          </div>

          {/* Letterhead Footer */}
          {!hideLetterhead && footer && (
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
