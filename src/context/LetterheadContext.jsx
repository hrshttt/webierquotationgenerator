import { createContext, useContext, useState, useEffect } from 'react'

const LetterheadContext = createContext(null)

export function LetterheadProvider({ children }) {
  const [header, setHeader] = useState(null)
  const [footer, setFooter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadLetterhead()
  }, [])

  const loadLetterhead = async () => {
    try {
      setLoading(true)
      setError(null)

      // Strategy: Check for PNG/JPG images first (simplest), then fall back to PDF extraction
      const headerLoaded = await tryLoadImage('/assets/letterhead-header.png')
        || await tryLoadImage('/assets/letterhead-header.jpg')
        || await tryLoadImage('/assets/letterhead.png')  // single full letterhead image as header
        || await tryLoadImage('/assets/letterhead.jpg')

      if (headerLoaded) {
        setHeader(headerLoaded)
      }

      const footerLoaded = await tryLoadImage('/assets/letterhead-footer.png')
        || await tryLoadImage('/assets/letterhead-footer.jpg')

      if (footerLoaded) {
        setFooter(footerLoaded)
      }

      // If no images found, try PDF extraction as fallback
      if (!headerLoaded) {
        const pdfResult = await tryLoadPDF()
        if (!pdfResult) {
          setError('No letterhead found. See instructions below.')
        }
      }

    } catch (err) {
      console.warn('Letterhead loading failed:', err.message)
      setError('Failed to load letterhead images.')
    } finally {
      setLoading(false)
    }
  }

  // Try to load an image from a URL, return its src if it exists
  const tryLoadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(url)
      img.onerror = () => resolve(null)
      img.src = url
    })
  }

  // Fallback: extract from PDF using pdf.js
  const tryLoadPDF = async () => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default

      const loadingTask = pdfjsLib.getDocument('/assets/letterhead.pdf')
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(1)

      const scale = 2
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise

      // Extract header (top ~120px at 2x = 240px)
      const headerHeight = 240
      const headerCanvas = document.createElement('canvas')
      headerCanvas.width = canvas.width
      headerCanvas.height = headerHeight
      headerCanvas.getContext('2d').drawImage(canvas, 0, 0, canvas.width, headerHeight, 0, 0, canvas.width, headerHeight)
      setHeader(headerCanvas.toDataURL('image/png'))

      // Extract footer (bottom ~60px at 2x = 120px)
      const footerHeight = 120
      const footerCanvas = document.createElement('canvas')
      footerCanvas.width = canvas.width
      footerCanvas.height = footerHeight
      footerCanvas.getContext('2d').drawImage(canvas, 0, canvas.height - footerHeight, canvas.width, footerHeight, 0, 0, canvas.width, footerHeight)
      setFooter(footerCanvas.toDataURL('image/png'))

      return true
    } catch {
      return false
    }
  }

  return (
    <LetterheadContext.Provider value={{ header, footer, loading, error, reload: loadLetterhead }}>
      {children}
    </LetterheadContext.Provider>
  )
}

export const useLetterhead = () => useContext(LetterheadContext)
