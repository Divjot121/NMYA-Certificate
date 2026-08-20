/**
 * Literating India Foundation - PDF Exporter
 * Generates single-page PDF with exact aspect ratio and high fidelity
 */

class CertificatePdfExporter {
  /**
   * Generates and downloads a single-page PDF from the certificate canvas
   * @param {HTMLCanvasElement} canvas
   * @param {string} filename
   */
  static async exportPdf(canvas, filename = 'LIF_Certificate.pdf') {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('jsPDF library not loaded');
    }

    const { jsPDF } = window.jspdf;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Standard A4 landscape is 297mm x 210mm
    const pdfWidth = 297;
    const pdfHeight = (canvasHeight / canvasWidth) * pdfWidth; // ~209.8mm

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(filename);
  }
}

window.CertificatePdfExporter = CertificatePdfExporter;
