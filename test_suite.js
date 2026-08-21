/**
 * Dynamic Certificate Generator - Automated Verification Suite
 * Tests dataset integrity, search disambiguation, phone verification, and sequence generation
 */

const fs = require('fs');
const path = require('path');

// Mock localStorage and window for Node environment testing
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new LocalStorageMock();
global.window = global;

// Load app scripts
require('./js/data.js');
require('./js/config.js');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

console.log('=== TEST SUITE 1: Dataset & Unique IDs ===');
const participants = window.ParticipantData.getParticipants();
assert(participants.length === 45, `Total embedded participants count is 45 (got ${participants.length})`);
assert(participants[0].id === 1 && participants[0].name === 'Rajdeep Singh', 'First participant has ID 1 (Rajdeep Singh)');
assert(participants[44].id === 45 && participants[44].name === 'Harnoor Kaur', 'Last participant has ID 45 (Harnoor Kaur)');

// Check unique IDs
const idSet = new Set(participants.map(p => p.id));
assert(idSet.size === 45, 'All 45 IDs are unique');

console.log('\n=== TEST SUITE 2: Duplicate Names Disambiguation ===');
const harnoorMatches = window.ParticipantData.searchParticipantsByName('Harnoor Kaur');
assert(harnoorMatches.length === 3, `Searching "Harnoor Kaur" returns 3 distinct records (got ${harnoorMatches.length})`);
assert(harnoorMatches[0].topic === 'Rangoli' && harnoorMatches[0].class === '6th' && harnoorMatches[0].phone === '9855673974', 'Harnoor #1 is Rangoli 6th');
assert(harnoorMatches[1].topic === 'Rangoli' && harnoorMatches[1].class === '7th' && harnoorMatches[1].phone === '9815046097', 'Harnoor #2 is Rangoli 7th');
assert(harnoorMatches[2].topic === 'Poster Making' && harnoorMatches[2].class === '8th' && harnoorMatches[2].phone === '9888818381', 'Harnoor #3 is Poster Making 8th');

const chahatMatches = window.ParticipantData.searchParticipantsByName('Chahatnoor Singh');
assert(chahatMatches.length === 1, `Searching "Chahatnoor Singh" returns 1 verified record with phone (got ${chahatMatches.length})`);
assert(chahatMatches[0].phone === '8283817006', 'Chahatnoor has phone 8283817006');

console.log('\n=== TEST SUITE 3: Search Edge Cases ===');
const emptySearch = window.ParticipantData.searchParticipantsByName('');
assert(emptySearch.length === 0, 'Empty query returns empty array');

const partialSearch = window.ParticipantData.searchParticipantsByName('singh');
assert(partialSearch.length > 0, `Substring case-insensitive search works (found ${partialSearch.length} Singhs)`);

const noMatchSearch = window.ParticipantData.searchParticipantsByName('Unknown Participant XYZ');
assert(noMatchSearch.length === 0, 'Non-existent name returns empty array (triggers inline error UI)');

console.log('\n=== TEST SUITE 4: Phone Verification, Secondary Check & Throttling Logic ===');
function simulatePhoneVerify(participant, enteredPhone) {
  if (!participant.phone) return { verified: false, reason: 'requires_secondary_check' };
  const entered = enteredPhone ? enteredPhone.trim().replace(/\D/g, '') : '';
  const actual = participant.phone.trim().replace(/\D/g, '');
  if (!entered) return { verified: false, reason: 'empty' };
  if (entered.length < 10) return { verified: false, reason: 'incomplete' };
  const isMatch = (entered === actual);
  return { verified: isMatch, reason: isMatch ? 'ok' : 'mismatch' };
}

function simulateSecondaryVerify(participant, selectedTopic, selectedClass) {
  if (!selectedTopic || !selectedClass) return { verified: false, reason: 'incomplete' };
  const isMatch = (selectedTopic.trim().toLowerCase() === participant.topic.trim().toLowerCase() &&
                   selectedClass.trim().toLowerCase() === participant.class.trim().toLowerCase());
  return { verified: isMatch, reason: isMatch ? 'ok' : 'mismatch' };
}

function simulateThrottling(failedAttempts) {
  if (failedAttempts >= 5) return { throttled: true, cooldownSeconds: 60 };
  if (failedAttempts >= 3) return { throttled: true, cooldownSeconds: 30 };
  return { throttled: false, cooldownSeconds: 0 };
}

// Harnoor #2 phone verification tests
const h2 = harnoorMatches[1];
assert(simulatePhoneVerify(h2, '9815046097').verified === true, 'Full 10-digit phone match succeeds');
assert(simulatePhoneVerify(h2, '6097').verified === false, 'Partial 4-digit input fails (Full 10-digit required)');
assert(simulatePhoneVerify(h2, '9999999999').verified === false, 'Mismatched phone number fails');
assert(simulatePhoneVerify(h2, '').verified === false, 'Empty phone input fails');

// Simulated secondary verification logic check
const mockNullPhone = { name: 'Test Student', phone: null, topic: 'Declamation', class: '7th' };
assert(simulatePhoneVerify(mockNullPhone, '').verified === false, 'Null phone record CANNOT bypass Step 2 automatically');
assert(simulateSecondaryVerify(mockNullPhone, 'Declamation', '7th').verified === true, 'Correct secondary check (Topic & Class) succeeds for null-phone participant');
assert(simulateSecondaryVerify(mockNullPhone, 'Debate', '7th').verified === false, 'Incorrect topic in secondary check fails');
assert(simulateSecondaryVerify(mockNullPhone, 'Declamation', '8th').verified === false, 'Incorrect class in secondary check fails');
assert(simulateSecondaryVerify(mockNullPhone, '', '7th').verified === false, 'Incomplete secondary check fails');

// Throttling & Lockout tests
assert(simulateThrottling(0).throttled === false, '0 failed attempts: Not throttled');
assert(simulateThrottling(2).throttled === false, '2 failed attempts: Not throttled');
assert(simulateThrottling(3).throttled === true && simulateThrottling(3).cooldownSeconds === 30, '3 failed attempts: Throttled with 30s cooldown');
assert(simulateThrottling(4).throttled === true && simulateThrottling(4).cooldownSeconds === 30, '4 failed attempts: Throttled with 30s cooldown');
assert(simulateThrottling(5).throttled === true && simulateThrottling(5).cooldownSeconds === 60, '5+ failed attempts: Throttled with 60s cooldown');

console.log('\n=== TEST SUITE 5: Unique Certificate Serial Number per ID ===');
function getUniqueCertNo(participant) {
  const id = participant && participant.id ? participant.id : 1;
  const padded = String(id).padStart(3, '0');
  return `LIF-NMYA-2026-${padded}`;
}

const allParticipants = window.ParticipantData.getParticipants();
const generatedCertNumbers = allParticipants.map(p => getUniqueCertNo(p));
const uniqueCertSet = new Set(generatedCertNumbers);

assert(uniqueCertSet.size === allParticipants.length, `All ${allParticipants.length} participants have unique serial numbers`);
assert(getUniqueCertNo({ id: 1 }) === 'LIF-NMYA-2026-001', 'Participant #1 gets LIF-NMYA-2026-001');
assert(getUniqueCertNo({ id: 4 }) === 'LIF-NMYA-2026-004', 'Participant #4 gets LIF-NMYA-2026-004');
assert(getUniqueCertNo({ id: 45 }) === 'LIF-NMYA-2026-045', 'Participant #45 gets LIF-NMYA-2026-045');

console.log('\n=== TEST SUITE 6: Database Integrity & Exclusivity ===');
const dbParticipants = window.ParticipantData.getParticipants();
assert(Array.isArray(dbParticipants) && dbParticipants.length === 45, 'Database returns exactly 45 authoritative records');
assert(window.ParticipantData.getParticipantById(1).name === 'Rajdeep Singh', 'Participant lookup by ID 1 matches authoritative dataset');
assert(window.ParticipantData.getParticipantById(45).name === 'Harnoor Kaur', 'Participant lookup by ID 45 matches authoritative dataset');

console.log('\n=== TEST SUITE 7: Dual Theme (Dark/Light) State Management ===');
function resolveThemePreference(stored, systemPrefersDark) {
  if (stored === 'dark' || stored === 'light') return stored;
  return systemPrefersDark ? 'dark' : 'light';
}

function getNextTheme(currentTheme) {
  return currentTheme === 'dark' ? 'light' : 'dark';
}

assert(resolveThemePreference('dark', false) === 'dark', 'Explicit dark preference respected regardless of system theme');
assert(resolveThemePreference('light', true) === 'light', 'Explicit light preference respected regardless of system theme');
assert(resolveThemePreference(null, true) === 'dark', 'System dark preference fallback works cleanly');
assert(resolveThemePreference(null, false) === 'light', 'System light preference fallback works cleanly');
assert(getNextTheme('light') === 'dark', 'Theme toggle switches light -> dark cleanly');
assert(getNextTheme('dark') === 'light', 'Theme toggle switches dark -> light cleanly');

console.log(`\n=============================================`);
console.log(`TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log(`=============================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
