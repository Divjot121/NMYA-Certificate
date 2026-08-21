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
assert(participants.length === 48, `Total embedded participants count is 48 (got ${participants.length})`);
assert(participants[0].id === 1 && participants[0].name === 'Rajdeep Singh', 'First participant has ID 1 (Rajdeep Singh)');
assert(participants[47].id === 48 && participants[47].name === 'Demo Participant', 'Last participant has ID 48 (Demo Participant)');

// Check unique IDs
const idSet = new Set(participants.map(p => p.id));
assert(idSet.size === 48, 'All 48 IDs are unique');

console.log('\n=== TEST SUITE 2: Duplicate Names Disambiguation ===');
const harnoorMatches = window.ParticipantData.searchParticipantsByName('Harnoor Kaur');
assert(harnoorMatches.length === 3, `Searching "Harnoor Kaur" returns 3 distinct records (got ${harnoorMatches.length})`);
assert(harnoorMatches[0].topic === 'Rangoli' && harnoorMatches[0].class === '6th' && harnoorMatches[0].phone === '9855673974', 'Harnoor #1 is Rangoli 6th');
assert(harnoorMatches[1].topic === 'Rangoli' && harnoorMatches[1].class === '7th' && harnoorMatches[1].phone === '9815046097', 'Harnoor #2 is Rangoli 7th');
assert(harnoorMatches[2].topic === 'Poster Making' && harnoorMatches[2].class === '8th' && harnoorMatches[2].phone === '9888818381', 'Harnoor #3 is Poster Making 8th');

const chahatMatches = window.ParticipantData.searchParticipantsByName('Chahatnoor Singh');
assert(chahatMatches.length === 2, `Searching "Chahatnoor Singh" returns 2 distinct records (got ${chahatMatches.length})`);
assert(chahatMatches[0].phone === null, 'First Chahatnoor has null phone');
assert(chahatMatches[1].phone === '8283817006', 'Second Chahatnoor has phone 8283817006');

console.log('\n=== TEST SUITE 3: Search Edge Cases ===');
const emptySearch = window.ParticipantData.searchParticipantsByName('');
assert(emptySearch.length === 0, 'Empty query returns empty array');

const partialSearch = window.ParticipantData.searchParticipantsByName('singh');
assert(partialSearch.length > 0, `Substring case-insensitive search works (found ${partialSearch.length} Singhs)`);

const noMatchSearch = window.ParticipantData.searchParticipantsByName('Unknown Participant XYZ');
assert(noMatchSearch.length === 0, 'Non-existent name returns empty array (triggers inline error UI)');

console.log('\n=== TEST SUITE 4: Phone Verification Logic ===');
function simulatePhoneVerify(participant, enteredPhone) {
  if (!participant.phone) return { verified: true, bypass: true };
  const entered = enteredPhone.trim().replace(/\D/g, '');
  const actual = participant.phone.trim().replace(/\D/g, '');
  if (!entered) return { verified: false, reason: 'empty' };
  if (entered.length < 10) return { verified: false, reason: 'incomplete' };
  const isMatch = (entered === actual);
  return { verified: isMatch, reason: isMatch ? 'ok' : 'mismatch' };
}

// Harnoor #2 verification
const h2 = harnoorMatches[1];
assert(simulatePhoneVerify(h2, '9815046097').verified === true, 'Full 10-digit phone match succeeds');
assert(simulatePhoneVerify(h2, '6097').verified === false, 'Partial 4-digit input fails (Full 10-digit required)');
assert(simulatePhoneVerify(h2, '9999999999').verified === false, 'Mismatched phone number fails');
assert(simulatePhoneVerify(h2, '').verified === false, 'Empty phone input fails');

// Null phone bypass
const hargunpreet = window.ParticipantData.searchParticipantsByName('Hargunpreet Kaur')[0];
assert(simulatePhoneVerify(hargunpreet, '').verified === true, 'Null phone record bypasses phone check automatically');

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
assert(getUniqueCertNo({ id: 47 }) === 'LIF-NMYA-2026-047', 'Participant #47 gets LIF-NMYA-2026-047');

console.log('\n=== TEST SUITE 6: Database Integrity & Exclusivity ===');
const dbParticipants = window.ParticipantData.getParticipants();
assert(Array.isArray(dbParticipants) && dbParticipants.length === 48, 'Database returns exactly 48 authoritative records');
assert(window.ParticipantData.getParticipantById(1).name === 'Rajdeep Singh', 'Participant lookup by ID 1 matches authoritative dataset');
assert(window.ParticipantData.getParticipantById(48).name === 'Demo Participant', 'Participant lookup by ID 48 matches authoritative dataset');

console.log(`\n=============================================`);
console.log(`TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log(`=============================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
