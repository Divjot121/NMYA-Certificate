/**
 * Literating India Foundation - Dynamic Certificate Generator Application Logic
 * Integrates search autocomplete, phone verification, sequence management, and exports
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const autocompleteList = document.getElementById('autocomplete-list');
  const searchError = document.getElementById('search-error');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  // Selected Participant Card Elements
  const participantCard = document.getElementById('selected-participant-card');
  const cardName = document.getElementById('card-name');
  const cardTopic = document.getElementById('card-topic');
  const cardClass = document.getElementById('card-class');
  const cardCertNo = document.getElementById('card-cert-no');
  const cardPhoneInfo = document.getElementById('card-phone-info');
  const changeParticipantBtn = document.getElementById('change-participant-btn');

  // Mobile Floating Quick Bar
  const mobileFloatingBar = document.getElementById('mobile-floating-bar');
  const mobileQuickPng = document.getElementById('mobile-quick-png');
  const mobileQuickPdf = document.getElementById('mobile-quick-pdf');

  // Topic filter chips
  const topicChips = document.querySelectorAll('.topic-chip');

  // Verification Elements
  const verificationSection = document.getElementById('verification-section');
  const phoneVerifyInput = document.getElementById('phone-verify-input');
  const verifyBtn = document.getElementById('verify-btn');
  const verificationMessage = document.getElementById('verification-message');
  const nullPhoneNotice = document.getElementById('null-phone-notice');

  // Form Customization Inputs
  const schoolInput = document.getElementById('school-input');
  const dateInput = document.getElementById('date-input');
  const certNoDisplay = document.getElementById('cert-no-display');
  const certNoInput = document.getElementById('cert-no-input');
  const editCertNoBtn = document.getElementById('edit-cert-no-btn');

  // Export Buttons
  const downloadPngBtn = document.getElementById('download-png-btn');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');
  const printCertBtn = document.getElementById('print-cert-btn');

  // Canvas and Preview Controls
  const canvasElement = document.getElementById('certificate-canvas');
  const canvasWrapper = document.getElementById('canvas-wrapper');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomFitBtn = document.getElementById('zoom-fit-btn');
  const zoomLevelDisplay = document.getElementById('zoom-level');
  const emptyState = document.getElementById('preview-empty-state');
  const canvasContainer = document.getElementById('canvas-container');

  // Add Participant Modal Elements
  const openAddModalBtn = document.getElementById('open-add-modal-btn');
  const addModal = document.getElementById('add-participant-modal');
  const closeAddModalBtn = document.getElementById('close-add-modal-btn');
  const addParticipantForm = document.getElementById('add-participant-form');

  // Directory Modal Elements
  const openDirectoryBtn = document.getElementById('open-directory-btn');
  const directoryModal = document.getElementById('directory-modal');
  const closeDirectoryBtn = document.getElementById('close-directory-btn');
  const directoryTableBody = document.getElementById('directory-table-body');
  const directorySearchInput = document.getElementById('directory-search-input');
  const directoryTopicFilter = document.getElementById('directory-topic-filter');
  const directoryClassFilter = document.getElementById('directory-class-filter');
  const participantCountBadge = document.getElementById('participant-count-badge');

  // Application State
  let currentParticipant = null;
  let isVerified = false;
  let currentZoom = 0.55;
  let activeAutocompleteIndex = -1;
  let searchResults = [];
  let customCertNoOverride = null;

  // Initialize Canvas Renderer
  const renderer = new CertificateRenderer(canvasElement);

  // Initialize Default School and Issue Date
  const DEFAULT_SCHOOL = 'SGHPS CHOWK PRAGDASS';
  const DEFAULT_DATE = '28 August 2026';
  
  if (schoolInput) {
    schoolInput.value = DEFAULT_SCHOOL;
  }
  if (dateInput) {
    dateInput.value = DEFAULT_DATE;
  }

  /**
   * Serial Number Generator (Unique for each participant ID in database)
   */
  function getFormattedCertNo(participant = currentParticipant) {
    if (customCertNoOverride && customCertNoOverride.trim()) {
      return customCertNoOverride.trim();
    }
    const id = (participant && participant.id) ? participant.id : 1;
    const padded = String(id).padStart(3, '0');
    return `${CERT_CONFIG.NUMBERING.PREFIX}-2026-${padded}`;
  }

  function updateCertNoDisplay() {
    const no = getFormattedCertNo();
    certNoDisplay.textContent = no;
    if (certNoInput) {
      certNoInput.placeholder = no;
    }
  }

  updateCertNoDisplay();

  /**
   * Updates Live Certificate Rendering
   */
  async function refreshCertificate() {
    if (!currentParticipant || !isVerified) {
      emptyState.classList.remove('hidden');
      canvasContainer.classList.add('hidden');
      setExportButtonsEnabled(false);
      return;
    }

    emptyState.classList.add('hidden');
    canvasContainer.classList.remove('hidden');
    setExportButtonsEnabled(true);

    const renderPayload = {
      name: currentParticipant.name,
      topic: currentParticipant.topic,
      classVal: currentParticipant.class,
      school: schoolInput.value.trim() || DEFAULT_SCHOOL,
      certNo: getFormattedCertNo(currentParticipant),
      date: dateInput.value.trim() || DEFAULT_DATE
    };

    await renderer.render(renderPayload);
    fitToView();
  }

  function setExportButtonsEnabled(enabled) {
    downloadPngBtn.disabled = !enabled;
    downloadPdfBtn.disabled = !enabled;
    printCertBtn.disabled = !enabled;

    if (mobileFloatingBar) {
      if (enabled) {
        mobileFloatingBar.classList.remove('hidden');
      } else {
        mobileFloatingBar.classList.add('hidden');
      }
    }
  }

  /**
   * Search Autocomplete Logic
   */
  function handleSearchInput(e) {
    const query = e.target.value;
    activeAutocompleteIndex = -1;

    if (!query || !query.trim()) {
      autocompleteList.classList.add('hidden');
      autocompleteList.innerHTML = '';
      searchError.classList.add('hidden');
      clearSearchBtn.classList.add('hidden');
      searchResults = [];
      return;
    }

    clearSearchBtn.classList.remove('hidden');
    searchResults = ParticipantData.searchParticipantsByName(query);

    if (searchResults.length === 0) {
      autocompleteList.classList.add('hidden');
      autocompleteList.innerHTML = '';
      searchError.textContent = '❌ No matching participant found in dataset';
      searchError.classList.remove('hidden');
      return;
    }

    searchError.classList.add('hidden');
    renderAutocompleteDropdown(searchResults, query);
  }

  function renderAutocompleteDropdown(results, query) {
    autocompleteList.innerHTML = '';
    autocompleteList.classList.remove('hidden');

    results.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'autocomplete-item';
      li.dataset.index = index;

      // Highlight match in name
      const regex = new RegExp(`(${escapeRegex(query.trim())})`, 'gi');
      const highlightedName = item.name.replace(regex, '<mark>$1</mark>');

      const phoneDisplay = item.phone
        ? `<span class="badge phone-badge">📱 •••• ${item.phone.slice(-4)}</span>`
        : `<span class="badge no-phone-badge">No Phone</span>`;

      li.innerHTML = `
        <div class="item-header">
          <span class="item-name">${highlightedName}</span>
          ${item.isCustom ? '<span class="badge custom-badge">Custom</span>' : ''}
        </div>
        <div class="item-details">
          <span class="badge topic-badge">${escapeHtml(item.topic)}</span>
          <span class="badge class-badge">Class ${escapeHtml(item.class)}</span>
          <span class="badge cert-badge">${getFormattedCertNo(item)}</span>
          ${phoneDisplay}
        </div>
      `;

      li.addEventListener('click', () => {
        selectParticipant(item);
      });

      autocompleteList.appendChild(li);
    });
  }

  function handleSearchKeydown(e) {
    if (autocompleteList.classList.contains('hidden') || searchResults.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    const items = autocompleteList.querySelectorAll('.autocomplete-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeAutocompleteIndex = (activeAutocompleteIndex + 1) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeAutocompleteIndex = (activeAutocompleteIndex - 1 + items.length) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeAutocompleteIndex >= 0 && activeAutocompleteIndex < items.length) {
        selectParticipant(searchResults[activeAutocompleteIndex]);
      } else if (searchResults.length > 0) {
        selectParticipant(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      autocompleteList.classList.add('hidden');
    }
  }

  function updateActiveItem(items) {
    items.forEach((item, idx) => {
      if (idx === activeAutocompleteIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Participant Selection & Verification Trigger
   */
  function selectParticipant(participant) {
    currentParticipant = participant;
    customCertNoOverride = null;
    if (certNoInput) {
      certNoInput.value = '';
      certNoInput.classList.add('hidden');
    }
    if (editCertNoBtn) {
      editCertNoBtn.textContent = 'Edit';
    }

    autocompleteList.classList.add('hidden');
    searchInput.value = participant.name;
    searchError.classList.add('hidden');

    // Populate participant card
    cardName.textContent = participant.name;
    cardTopic.textContent = participant.topic;
    cardClass.textContent = `Class: ${participant.class}`;
    if (cardCertNo) {
      cardCertNo.textContent = getFormattedCertNo(participant);
    }

    if (participant.phone) {
      cardPhoneInfo.textContent = `Phone: ••••••••${participant.phone.slice(-2)} (Verification required)`;
      cardPhoneInfo.className = 'card-phone-info phone-required';
    } else {
      cardPhoneInfo.textContent = 'Phone: Not Registered (Auto-verified by Topic & Class)';
      cardPhoneInfo.className = 'card-phone-info phone-none';
    }

    participantCard.classList.remove('hidden');
    verificationSection.classList.remove('hidden');

    // Reset phone verify state
    phoneVerifyInput.value = '';
    verificationMessage.classList.add('hidden');
    verificationMessage.textContent = '';
    verificationMessage.className = 'verification-message';

    if (participant.phone) {
      nullPhoneNotice.classList.add('hidden');
      phoneVerifyInput.parentElement.classList.remove('hidden');
      isVerified = false;
      phoneVerifyInput.focus();
    } else {
      // Null phone bypass
      nullPhoneNotice.classList.remove('hidden');
      phoneVerifyInput.parentElement.classList.add('hidden');
      isVerified = true;
      showVerificationSuccess('✓ Verified via record topic & class (No phone needed)');
    }

    updateCertNoDisplay();
    refreshCertificate();
  }

  /**
   * Phone Confirmation Validation
   */
  function verifyPhoneNumber() {
    if (!currentParticipant) return;

    if (!currentParticipant.phone) {
      isVerified = true;
      showVerificationSuccess('✓ Verified');
      refreshCertificate();
      return;
    }

    const entered = phoneVerifyInput.value.trim().replace(/\D/g, '');
    const actual = currentParticipant.phone.trim().replace(/\D/g, '');

    if (!entered) {
      showVerificationError('⚠️ Please enter the registered phone number to confirm identity.');
      isVerified = false;
      refreshCertificate();
      return;
    }

    // Match either full 10-digit number or last 4 digits
    const isMatch = entered === actual || (entered.length >= 4 && actual.endsWith(entered));

    if (isMatch) {
      isVerified = true;
      showVerificationSuccess('✓ Phone Number Verified! Ready to Generate.');
      refreshCertificate();
    } else {
      isVerified = false;
      showVerificationError(`❌ Phone number mismatch! Did not match the record for "${currentParticipant.name}" (${currentParticipant.topic}, ${currentParticipant.class}).`);
      refreshCertificate();
    }
  }

  function showVerificationSuccess(msg) {
    verificationMessage.textContent = msg;
    verificationMessage.className = 'verification-message success';
    verificationMessage.classList.remove('hidden');
  }

  function showVerificationError(msg) {
    verificationMessage.textContent = msg;
    verificationMessage.className = 'verification-message error';
    verificationMessage.classList.remove('hidden');
  }

  // Clear / Change Selection
  function resetSelection() {
    currentParticipant = null;
    customCertNoOverride = null;
    isVerified = false;
    participantCard.classList.add('hidden');
    verificationSection.classList.add('hidden');
    searchInput.value = '';
    if (certNoInput) {
      certNoInput.value = '';
      certNoInput.classList.add('hidden');
    }
    if (editCertNoBtn) {
      editCertNoBtn.textContent = 'Edit';
    }
    searchInput.focus();
    updateCertNoDisplay();
    refreshCertificate();
  }

  /**
   * Canvas Zoom & Pan Controls
   */
  function setZoom(scale) {
    currentZoom = Math.max(0.2, Math.min(1.5, scale));
    canvasElement.style.transform = `scale(${currentZoom})`;
    zoomLevelDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
  }

  function fitToView() {
    if (!canvasWrapper) return;
    const padding = window.innerWidth < 600 ? 16 : 40;
    const containerWidth = canvasWrapper.clientWidth - padding;
    if (containerWidth > 0) {
      const targetScale = Math.min(1.0, containerWidth / CERT_CONFIG.CANVAS_WIDTH);
      setZoom(targetScale);
    }
  }

  /**
   * Export Handlers
   */
  async function downloadPNG() {
    if (!currentParticipant || !isVerified) return;
    const safeName = currentParticipant.name.replace(/[^a-zA-Z0-9]/g, '_');
    const safeTopic = currentParticipant.topic.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `LIF_Certificate_${safeName}_${safeTopic}_${currentParticipant.class}.png`;

    const dataUrl = renderer.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`✅ PNG Certificate (${getFormattedCertNo()}) downloaded for ${currentParticipant.name}!`);
  }

  async function downloadPDF() {
    if (!currentParticipant || !isVerified) return;
    const safeName = currentParticipant.name.replace(/[^a-zA-Z0-9]/g, '_');
    const safeTopic = currentParticipant.topic.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `LIF_Certificate_${safeName}_${safeTopic}_${currentParticipant.class}.pdf`;

    try {
      downloadPdfBtn.disabled = true;
      downloadPdfBtn.textContent = 'Generating PDF...';
      await CertificatePdfExporter.exportPdf(canvasElement, filename);
      showToast(`✅ PDF Certificate (${getFormattedCertNo()}) downloaded for ${currentParticipant.name}!`);
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('❌ PDF export failed. Please try PNG download.');
    } finally {
      downloadPdfBtn.disabled = false;
      downloadPdfBtn.innerHTML = '<span class="icon">📄</span> Download PDF';
    }
  }

  function printCertificate() {
    if (!currentParticipant || !isVerified) return;
    const dataUrl = renderer.toDataURL('image/png', 1.0);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print certificate.');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Certificate - ${currentParticipant.name}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
            img { width: 100vw; height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  /**
   * Directory / Browse All Modal
   */
  function populateDirectoryTable() {
    const list = ParticipantData.getParticipants();
    participantCountBadge.textContent = `${list.length} Records`;

    const topicFilter = directoryTopicFilter.value;
    const classFilter = directoryClassFilter.value;
    const searchFilter = directorySearchInput.value.trim().toLowerCase();

    const filtered = list.filter(p => {
      if (topicFilter && p.topic !== topicFilter) return false;
      if (classFilter && p.class !== classFilter) return false;
      if (searchFilter && !p.name.toLowerCase().includes(searchFilter) && !(p.phone && p.phone.includes(searchFilter))) return false;
      return true;
    });

    directoryTableBody.innerHTML = '';
    if (filtered.length === 0) {
      directoryTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No participants match the selected filter.</td></tr>`;
      return;
    }

    filtered.forEach(p => {
      const certNo = getFormattedCertNo(p);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>#${p.id}</strong></td>
        <td><code style="font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; color: var(--color-navy-800);">${certNo}</code></td>
        <td><strong>${escapeHtml(p.name)}</strong> ${p.isCustom ? '<span class="badge custom-badge">Custom</span>' : ''}</td>
        <td><span class="badge topic-badge">${escapeHtml(p.topic)}</span></td>
        <td><span class="badge class-badge">${escapeHtml(p.class)}</span></td>
        <td>${p.phone ? `•••• ${p.phone.slice(-4)}` : '<em class="text-muted">None</em>'}</td>
        <td>
          <button class="btn btn-sm btn-primary select-dir-btn" data-id="${p.id}">Select</button>
        </td>
      `;
      directoryTableBody.appendChild(tr);
    });

    directoryTableBody.querySelectorAll('.select-dir-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        const record = ParticipantData.getParticipantById(id);
        if (record) {
          selectParticipant(record);
          directoryModal.classList.add('hidden');
        }
      });
    });
  }

  /**
   * Add Participant Form
   */
  function handleAddParticipantSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('new-name').value.trim();
    const topic = document.getElementById('new-topic').value.trim();
    const classVal = document.getElementById('new-class').value.trim();
    const phone = document.getElementById('new-phone').value.trim() || null;

    if (!name || !topic || !classVal) {
      alert('Please fill in Name, Topic, and Class.');
      return;
    }

    const newRecord = ParticipantData.addCustomParticipant({
      name,
      topic,
      class: classVal,
      phone
    });

    addModal.classList.add('hidden');
    addParticipantForm.reset();
    showToast(`✅ Added participant "${newRecord.name}" successfully!`);

    // Auto select newly created participant
    selectParticipant(newRecord);
  }

  /**
   * Toast notification helper
   */
  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  /**
   * Escape HTML utility
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Event Listeners for Search & Verification
  searchInput.addEventListener('input', handleSearchInput);
  searchInput.addEventListener('keydown', handleSearchKeydown);
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    handleSearchInput({ target: { value: '' } });
    searchInput.focus();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box-wrapper')) {
      autocompleteList.classList.add('hidden');
    }
  });

  changeParticipantBtn.addEventListener('click', resetSelection);

  verifyBtn.addEventListener('click', verifyPhoneNumber);
  phoneVerifyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyPhoneNumber();
    }
  });
  phoneVerifyInput.addEventListener('input', (e) => {
    const val = e.target.value.trim().replace(/\D/g, '');
    if (currentParticipant && currentParticipant.phone) {
      const actual = currentParticipant.phone.trim().replace(/\D/g, '');
      if (val === actual || (val.length === 4 && actual.endsWith(val))) {
        verifyPhoneNumber();
      }
    }
  });

  // Inputs real-time listener
  schoolInput.addEventListener('input', refreshCertificate);
  dateInput.addEventListener('input', refreshCertificate);
  certNoInput.addEventListener('input', () => {
    customCertNoOverride = certNoInput.value;
    updateCertNoDisplay();
    refreshCertificate();
  });

  editCertNoBtn.addEventListener('click', () => {
    if (certNoInput.classList.contains('hidden')) {
      certNoInput.classList.remove('hidden');
      certNoInput.value = getFormattedCertNo(currentParticipant);
      certNoInput.focus();
      editCertNoBtn.textContent = 'Save';
    } else {
      customCertNoOverride = certNoInput.value.trim() || null;
      certNoInput.classList.add('hidden');
      editCertNoBtn.textContent = 'Edit';
      updateCertNoDisplay();
      refreshCertificate();
    }
  });

  // Export Buttons
  downloadPngBtn.addEventListener('click', downloadPNG);
  downloadPdfBtn.addEventListener('click', downloadPDF);
  printCertBtn.addEventListener('click', printCertificate);

  // Zoom controls
  zoomInBtn.addEventListener('click', () => setZoom(currentZoom + 0.1));
  zoomOutBtn.addEventListener('click', () => setZoom(currentZoom - 0.1));
  zoomFitBtn.addEventListener('click', fitToView);

  // Modal Controls
  openAddModalBtn.addEventListener('click', () => addModal.classList.remove('hidden'));
  closeAddModalBtn.addEventListener('click', () => addModal.classList.add('hidden'));
  addParticipantForm.addEventListener('submit', handleAddParticipantSubmit);

  openDirectoryBtn.addEventListener('click', () => {
    populateDirectoryTable();
    directoryModal.classList.remove('hidden');
  });
  closeDirectoryBtn.addEventListener('click', () => directoryModal.classList.add('hidden'));
  directorySearchInput.addEventListener('input', populateDirectoryTable);
  directoryTopicFilter.addEventListener('change', populateDirectoryTable);
  directoryClassFilter.addEventListener('change', populateDirectoryTable);

  // Mobile Floating Quick Action Buttons
  if (mobileQuickPng) {
    mobileQuickPng.addEventListener('click', downloadPNG);
  }
  if (mobileQuickPdf) {
    mobileQuickPdf.addEventListener('click', downloadPDF);
  }

  // Topic Category Filter Chips
  if (topicChips && topicChips.length > 0) {
    topicChips.forEach(chip => {
      chip.addEventListener('click', () => {
        topicChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const topic = chip.dataset.topic;

        // Populate and open directory modal with this filter
        if (directoryTopicFilter) {
          directoryTopicFilter.value = topic;
        }
        populateDirectoryTable();
        if (topic) {
          directoryModal.classList.remove('hidden');
        }
      });
    });
  }

  // Responsive resize and orientation handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitToView, 100);
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(fitToView, 200);
  });

  // Initial setup
  fitToView();
});
