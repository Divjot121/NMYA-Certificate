/**
 * Literating India Foundation - Robust PDF Exporter
 * Generates single-page landscape PDF with exact A4 aspect ratio and high fidelity
 */

class CertificatePdfExporter {
  /**
   * Helper to ensure jsPDF is available or loaded dynamically
   */
  static async getJsPDFConstructor() {
    if (window.jspdf && window.jspdf.jsPDF) {
      return window.jspdf.jsPDF;
    }
    if (window.jsPDF) {
      return window.jsPDF;
    }

    // Dynamic loader fallback
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        if (window.jspdf && window.jspdf.jsPDF) {
          resolve(window.jspdf.jsPDF);
        } else if (window.jsPDF) {
          resolve(window.jsPDF);
        } else {
          reject(new Error('jsPDF loaded but constructor not found'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load jsPDF library'));
      document.head.appendChild(script);
    });
  }

  /**
   * Generates and downloads a single-page landscape PDF from the certificate canvas
   * @param {HTMLCanvasElement} canvas
   * @param {string} filename
   */
  static async exportPdf(canvas, filename = 'LIF_Certificate.pdf') {
    if (!canvas) {
      throw new Error('Canvas element not provided');
    }

    const jsPDFClass = await this.getJsPDFConstructor();

    // Export canvas at high resolution JPEG (0.96 quality for crisp text and fast encoding)
    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    // Standard A4 Landscape Dimensions in mm
    const a4Width = 297;
    const a4Height = 210;

    const pdf = new jsPDFClass({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Add image stretching precisely across A4 landscape page
    pdf.addImage(imgData, 'JPEG', 0, 0, a4Width, a4Height);

    // Trigger download with cross-browser and mobile compatibility
    try {
      pdf.save(filename);
    } catch (e) {
      // Fallback for mobile WebViews
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 2000);
    }

    return true;
  }
}

window.CertificatePdfExporter = CertificatePdfExporter;
