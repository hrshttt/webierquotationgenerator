import html2pdf from 'html2pdf.js'

export async function exportToPDF(elementId, filename, header, footer) {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Document element not found')
  }

  // Create a clone to modify for PDF export
  const clone = element.cloneNode(true)

  // Style the clone for PDF
  clone.style.padding = '0'
  clone.style.margin = '0'

  const opt = {
    margin: [0, 0, 0, 0],
    filename: filename,
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

  await html2pdf().set(opt).from(element).save()
}

export function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_')
}
