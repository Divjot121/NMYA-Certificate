/**
 * Literating India Foundation - Certificate Canvas Configuration
 * All dimensions, coordinates, font styles and colors calibrated for 1492x1054 template
 */

const CERT_CONFIG = {
  // Canvas dimensions (matches certificate_template.jpeg)
  CANVAS_WIDTH: 1492,
  CANVAS_HEIGHT: 1054,

  // Participant Name Section (Centered between "proudly presented to" and gold divider)
  NAME: {
    X: 746,
    Y: 468,
    FONT_FAMILY: '"Cinzel", "Playfair Display", "Times New Roman", serif',
    FONT_SIZE: 48,
    FONT_WEIGHT: '700',
    COLOR: '#0e2443', // Deep Navy
    MAX_WIDTH: 840
  },

  // Competition Paragraph Section
  PARAGRAPH: {
    X: 746,
    FONT_FAMILY: '"Plus Jakarta Sans", "Inter", "Helvetica Neue", sans-serif',
    FONT_SIZE: 18.5,
    COLOR: '#1e293b', // Rich charcoal / dark slate
    BOLD_FONT_WEIGHT: '700',
    BOLD_COLOR: '#0e2443',
    LINES: [
      {
        y: 560,
        prefix: 'For their enthusiastic participation in ',
        topicKey: true,
        suffix: ' under the'
      },
      {
        y: 588,
        text: 'Nasha Mukt Yuva for Viksit Bharat youth competitions, organised by'
      },
      {
        y: 616,
        text: 'Literating India Foundation as part of the Nasha Mukt Bharat Abhiyaan.'
      }
    ]
  },

  // Bottom Underline Fields
  FIELDS: {
    // School / Institution (Underline is X: 535 to 745 at Y: 694)
    SCHOOL: {
      X: 538,
      Y: 686,
      ALIGN: 'left',
      FONT_FAMILY: '"Plus Jakarta Sans", "Inter", "Helvetica Neue", sans-serif',
      FONT_SIZE: 17.5,
      FONT_WEIGHT: '700',
      COLOR: '#0e2443',
      MAX_WIDTH: 195,
      DEFAULT_VALUE: 'SGHPS CHOWK PRAGDASS'
    },

    // Class (Underline is X: 980 to 1185 at Y: 694)
    CLASS: {
      X: 985,
      Y: 686,
      ALIGN: 'left',
      FONT_FAMILY: '"Plus Jakarta Sans", "Inter", "Helvetica Neue", sans-serif',
      FONT_SIZE: 18,
      FONT_WEIGHT: '700',
      COLOR: '#0e2443',
      MAX_WIDTH: 180
    },

    // Certificate Number (Underline is X: 535 to 745 at Y: 746)
    CERT_NO: {
      X: 538,
      Y: 738,
      ALIGN: 'left',
      FONT_FAMILY: '"JetBrains Mono", "Courier New", monospace',
      FONT_SIZE: 17,
      FONT_WEIGHT: '600',
      COLOR: '#0e2443',
      MAX_WIDTH: 195
    },

    // Date (Underline is X: 980 to 1185 at Y: 746)
    DATE: {
      X: 985,
      Y: 738,
      ALIGN: 'left',
      FONT_FAMILY: '"Plus Jakarta Sans", "Inter", "Helvetica Neue", sans-serif',
      FONT_SIZE: 17.5,
      FONT_WEIGHT: '600',
      COLOR: '#0e2443',
      MAX_WIDTH: 180
    }
  },

  // Certificate Numbering Config
  NUMBERING: {
    PREFIX: 'LIF-NMYA',
    STORAGE_KEY: 'lif_cert_sequence_counter_v1',
    DEFAULT_START_SEQ: 1
  }
};

window.CERT_CONFIG = CERT_CONFIG;
