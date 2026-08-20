/**
 * Literating India Foundation - Certificate Canvas Renderer
 * Handles HTML5 Canvas composition and export
 */

class CertificateRenderer {
  constructor(canvasElement, templateSrc = 'certificate_template.jpeg') {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.templateSrc = templateSrc;
    this.templateImage = null;
    this.isLoaded = false;
    this.loadPromise = this.init();
  }

  /**
   * Preloads template image
   */
  async init() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.templateImage = img;
        this.canvas.width = CERT_CONFIG.CANVAS_WIDTH;
        this.canvas.height = CERT_CONFIG.CANVAS_HEIGHT;
        this.isLoaded = true;
        resolve(this);
      };
      img.onerror = (err) => {
        console.error('Failed to load certificate template image:', err);
        reject(err);
      };
      img.src = this.templateSrc;
    });
  }

  /**
   * Waits for custom web fonts to load before rendering text
   */
  async ensureFontsLoaded() {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading check skipped/failed:', e);
      }
    }
  }

  /**
   * Renders the complete certificate onto the canvas
   * @param {Object} data { name, topic, classVal, school, certNo, date }
   */
  async render(data) {
    if (!this.isLoaded) {
      await this.loadPromise;
    }
    await this.ensureFontsLoaded();

    const ctx = this.ctx;
    const { CANVAS_WIDTH, CANVAS_HEIGHT, NAME, PARAGRAPH, FIELDS } = CERT_CONFIG;

    // 1. Draw base pristine certificate template
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(this.templateImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Draw Participant Name (Centered, Serif Display, Deep Navy)
    if (data.name) {
      const nameText = data.name.trim().toUpperCase();
      let fontSize = NAME.FONT_SIZE;
      ctx.font = `${NAME.FONT_WEIGHT} ${fontSize}px ${NAME.FONT_FAMILY}`;
      ctx.fillStyle = NAME.COLOR;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Dynamically downscale font if name is exceptionally long
      let textWidth = ctx.measureText(nameText).width;
      while (textWidth > NAME.MAX_WIDTH && fontSize > 22) {
        fontSize -= 1;
        ctx.font = `${NAME.FONT_WEIGHT} ${fontSize}px ${NAME.FONT_FAMILY}`;
        textWidth = ctx.measureText(nameText).width;
      }

      ctx.fillText(nameText, NAME.X, NAME.Y);
    }

    // 3. Draw the 3-line paragraph with bold topic
    const topicText = data.topic ? data.topic.trim() : 'Competition';
    const lines = PARAGRAPH.LINES;

    // Line 1: Centered combo of (prefix + bold topic + suffix)
    const line1 = lines[0];
    const prefix = line1.prefix;
    const suffix = line1.suffix;

    const normalFont = `400 ${PARAGRAPH.FONT_SIZE}px ${PARAGRAPH.FONT_FAMILY}`;
    const boldFont = `${PARAGRAPH.BOLD_FONT_WEIGHT} ${PARAGRAPH.FONT_SIZE}px ${PARAGRAPH.FONT_FAMILY}`;

    // Measure total width of line 1 components
    ctx.font = normalFont;
    const prefixWidth = ctx.measureText(prefix).width;
    const suffixWidth = ctx.measureText(suffix).width;

    ctx.font = boldFont;
    const topicWidth = ctx.measureText(topicText).width;

    const totalLine1Width = prefixWidth + topicWidth + suffixWidth;
    let startX = PARAGRAPH.X - (totalLine1Width / 2);

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // Draw prefix
    ctx.font = normalFont;
    ctx.fillStyle = PARAGRAPH.COLOR;
    ctx.fillText(prefix, startX, line1.y);
    startX += prefixWidth;

    // Draw bold topic
    ctx.font = boldFont;
    ctx.fillStyle = PARAGRAPH.BOLD_COLOR;
    ctx.fillText(topicText, startX, line1.y);
    startX += topicWidth;

    // Draw suffix
    ctx.font = normalFont;
    ctx.fillStyle = PARAGRAPH.COLOR;
    ctx.fillText(suffix, startX, line1.y);

    // Line 2: "Nasha Mukt Yuva for Viksit Bharat youth competitions, organised by"
    ctx.textAlign = 'center';
    ctx.font = normalFont;
    ctx.fillStyle = PARAGRAPH.COLOR;
    ctx.fillText(lines[1].text, PARAGRAPH.X, lines[1].y);

    // Line 3: "Literating India Foundation as part of the Nasha Mukt Bharat Abhiyaan."
    ctx.fillText(lines[2].text, PARAGRAPH.X, lines[2].y);

    // 4. Draw School / Institution
    if (data.school) {
      const schCfg = FIELDS.SCHOOL;
      ctx.textAlign = schCfg.ALIGN;
      ctx.textBaseline = 'alphabetic';
      let schSize = schCfg.FONT_SIZE;
      ctx.font = `${schCfg.FONT_WEIGHT} ${schSize}px ${schCfg.FONT_FAMILY}`;
      ctx.fillStyle = schCfg.COLOR;
      
      let schText = data.school.trim();
      let schWidth = ctx.measureText(schText).width;
      while (schWidth > schCfg.MAX_WIDTH && schSize > 11) {
        schSize -= 1;
        ctx.font = `${schCfg.FONT_WEIGHT} ${schSize}px ${schCfg.FONT_FAMILY}`;
        schWidth = ctx.measureText(schText).width;
      }
      ctx.fillText(schText, schCfg.X, schCfg.Y);
    }

    // 5. Draw Class
    if (data.classVal) {
      const clsCfg = FIELDS.CLASS;
      ctx.textAlign = clsCfg.ALIGN;
      ctx.textBaseline = 'alphabetic';
      ctx.font = `${clsCfg.FONT_WEIGHT} ${clsCfg.FONT_SIZE}px ${clsCfg.FONT_FAMILY}`;
      ctx.fillStyle = clsCfg.COLOR;
      ctx.fillText(data.classVal.trim(), clsCfg.X, clsCfg.Y);
    }

    // 6. Draw Certificate No.
    if (data.certNo) {
      const certCfg = FIELDS.CERT_NO;
      ctx.textAlign = certCfg.ALIGN;
      ctx.textBaseline = 'alphabetic';
      ctx.font = `${certCfg.FONT_WEIGHT} ${certCfg.FONT_SIZE}px ${certCfg.FONT_FAMILY}`;
      ctx.fillStyle = certCfg.COLOR;
      ctx.fillText(data.certNo.trim(), certCfg.X, certCfg.Y);
    }

    // 7. Draw Date
    if (data.date) {
      const dtCfg = FIELDS.DATE;
      ctx.textAlign = dtCfg.ALIGN;
      ctx.textBaseline = 'alphabetic';
      ctx.font = `${dtCfg.FONT_WEIGHT} ${dtCfg.FONT_SIZE}px ${dtCfg.FONT_FAMILY}`;
      ctx.fillStyle = dtCfg.COLOR;
      ctx.fillText(data.date.trim(), dtCfg.X, dtCfg.Y);
    }
  }

  /**
   * Generates a high-resolution PNG Data URL
   * @returns {string}
   */
  toDataURL(type = 'image/png', quality = 1.0) {
    return this.canvas.toDataURL(type, quality);
  }

  /**
   * Exports canvas as Blob
   * @returns {Promise<Blob>}
   */
  toBlob(type = 'image/png', quality = 1.0) {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => resolve(blob), type, quality);
    });
  }
}

window.CertificateRenderer = CertificateRenderer;
