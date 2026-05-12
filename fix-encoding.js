/**
 * Fix UTF-8 → CP1252 → UTF-8 mojibake corruption in desktop.js
 * 
 * The file was corrupted when UTF-8 bytes were misinterpreted as CP1252
 * and then re-encoded as UTF-8, producing garbled text.
 * 
 * This script reverses that process by:
 * 1. Finding sequences of characters that look like mojibake
 * 2. Converting each character back to its CP1252 byte value
 * 3. Re-interpreting those bytes as UTF-8
 */

const fs = require('fs');

// CP1252 special mappings for bytes 0x80-0x9F (these differ from Latin-1)
const CP1252_TO_UNICODE = {
  0x80: 0x20AC, // €
  0x82: 0x201A, // ‚
  0x83: 0x0192, // ƒ
  0x84: 0x201E, // „
  0x85: 0x2026, // …
  0x86: 0x2020, // †
  0x87: 0x2021, // ‡
  0x88: 0x02C6, // ˆ
  0x89: 0x2030, // ‰
  0x8A: 0x0160, // Š
  0x8B: 0x2039, // ‹
  0x8C: 0x0152, // Œ
  0x8E: 0x017D, // Ž
  0x91: 0x2018, // '
  0x92: 0x2019, // '
  0x93: 0x201C, // "
  0x94: 0x201D, // "
  0x95: 0x2022, // •
  0x96: 0x2013, // –
  0x97: 0x2014, // —
  0x98: 0x02DC, // ˜
  0x99: 0x2122, // ™
  0x9A: 0x0161, // š
  0x9B: 0x203A, // ›
  0x9C: 0x0153, // œ
  0x9E: 0x017E, // ž
  0x9F: 0x0178, // Ÿ
};

// Build reverse map: Unicode codepoint → CP1252 byte
const UNICODE_TO_CP1252 = {};
for (const [byte, unicode] of Object.entries(CP1252_TO_UNICODE)) {
  UNICODE_TO_CP1252[unicode] = parseInt(byte);
}

// Special case: ğ (U+011F) was probably ð (U+00F0) corrupted by Turkish locale
const SPECIAL_FIXES = {
  0x011F: 0xF0,  // ğ → ð → byte 0xF0
};

/**
 * Try to convert a Unicode codepoint back to its CP1252 byte value
 * Returns the byte value or -1 if not mappable
 */
function unicodeToCp1252Byte(cp) {
  // Special fixes (Turkish locale corruption)
  if (SPECIAL_FIXES[cp] !== undefined) return SPECIAL_FIXES[cp];
  // Direct mapping for 0x00-0x7F (ASCII) and 0xA0-0xFF (Latin-1 supplement)
  if (cp <= 0xFF) return cp;
  // CP1252 special range
  if (UNICODE_TO_CP1252[cp] !== undefined) return UNICODE_TO_CP1252[cp];
  // Undefined bytes in CP1252 (0x81, 0x8D, 0x8F, 0x90) map to same codepoint
  if (cp === 0x81 || cp === 0x8D || cp === 0x8F || cp === 0x90) return cp;
  return -1;
}

/**
 * Check if a character is likely part of mojibake
 * (Characters commonly produced by UTF-8→CP1252 misinterpretation)
 */
function isMojibakeChar(cp) {
  // Common mojibake lead characters from UTF-8 2-byte sequences (0xC0-0xDF → U+00C0-U+00DF)
  if (cp >= 0xC0 && cp <= 0xDF) return true;
  // Common mojibake continuation chars (0x80-0xBF → various CP1252 mapped chars)
  if (UNICODE_TO_CP1252[cp] !== undefined) return true;
  // Control chars that come from bytes 0x80-0x9F in passthrough
  if (cp >= 0x80 && cp <= 0x9F) return true;
  // Characters in 0xA0-0xFF range (Latin-1 supplement, common in mojibake)
  if (cp >= 0xA0 && cp <= 0xFF) return true;
  // Turkish ğ special case
  if (cp === 0x011F) return true;
  // Ÿ from CP1252 0x9F
  if (cp === 0x0178) return true;
  // ƒ from CP1252 0x83
  if (cp === 0x0192) return true;
  // Š š from CP1252
  if (cp === 0x0160 || cp === 0x0161) return true;
  // Œ œ from CP1252
  if (cp === 0x0152 || cp === 0x0153) return true;
  // Ž ž from CP1252
  if (cp === 0x017D || cp === 0x017E) return true;
  // ˆ ˜ from CP1252
  if (cp === 0x02C6 || cp === 0x02DC) return true;
  // Various typographic chars from CP1252
  if (cp === 0x2013 || cp === 0x2014 || cp === 0x2018 || cp === 0x2019 ||
      cp === 0x201A || cp === 0x201C || cp === 0x201D || cp === 0x201E ||
      cp === 0x2020 || cp === 0x2021 || cp === 0x2022 || cp === 0x2026 ||
      cp === 0x2030 || cp === 0x2039 || cp === 0x203A || cp === 0x2122 ||
      cp === 0x20AC) return true;
  return false;
}

/**
 * Attempt to fix a sequence of characters that might be mojibake.
 * Returns the fixed string, or null if it doesn't look like valid mojibake.
 */
function tryFixMojibake(chars) {
  const bytes = [];
  for (const ch of chars) {
    const cp = ch.codePointAt(0);
    const byte = unicodeToCp1252Byte(cp);
    if (byte < 0) return null; // Can't map back
    bytes.push(byte);
  }
  
  // Try to decode as UTF-8
  try {
    const buf = Buffer.from(bytes);
    const decoded = buf.toString('utf8');
    // Verify it decoded cleanly (no replacement characters)
    if (decoded.includes('\uFFFD')) return null;
    // Verify the result is "simpler" (fewer bytes or valid high codepoints)
    if (decoded === chars.join('')) return null; // No change
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Process the entire file content and fix mojibake sequences
 */
function fixFile(content) {
  const chars = [...content]; // Split into codepoints (handles surrogate pairs)
  let result = '';
  let i = 0;
  let fixCount = 0;
  
  while (i < chars.length) {
    const cp = chars[i].codePointAt(0);
    
    // If this looks like it could be a mojibake sequence start
    if (isMojibakeChar(cp) && cp > 0x7F) {
      // Try to collect a sequence of mojibake characters
      let end = i + 1;
      while (end < chars.length && end - i < 20) {
        const nextCp = chars[end].codePointAt(0);
        if (nextCp <= 0x7F) break; // ASCII breaks the sequence
        if (!isMojibakeChar(nextCp)) break;
        end++;
      }
      
      // Try to fix the sequence (try progressively shorter sequences)
      let fixed = false;
      for (let tryEnd = end; tryEnd > i; tryEnd--) {
        const seq = chars.slice(i, tryEnd);
        const fixedStr = tryFixMojibake(seq);
        if (fixedStr && fixedStr !== seq.join('')) {
          result += fixedStr;
          i = tryEnd;
          fixed = true;
          fixCount++;
          break;
        }
      }
      
      if (!fixed) {
        result += chars[i];
        i++;
      }
    } else {
      result += chars[i];
      i++;
    }
  }
  
  console.log(`Fixed ${fixCount} mojibake sequences`);
  return result;
}

// Main
const filePath = process.argv[2] || 'desktop.js';
console.log(`Reading ${filePath}...`);
const content = fs.readFileSync(filePath, 'utf8');
console.log(`File size: ${content.length} chars`);

const fixed = fixFile(content);

// Verify some known corrections
const checks = [
  { search: '🐰 RabbitMQ Alert —', label: 'RabbitMQ emoji+dash' },
  { search: '📧', label: 'Email emoji' },
  { search: '📌', label: 'Pin emoji' },
  { search: 'Geçersiz', label: 'Turkish text' },
];

console.log('\nVerification:');
for (const check of checks) {
  const found = fixed.includes(check.search);
  console.log(`  ${found ? '✓' : '✗'} ${check.label}: "${check.search}" ${found ? 'found' : 'NOT found'}`);
}

// Write fixed file
const outPath = filePath;
fs.writeFileSync(outPath, fixed, 'utf8');
console.log(`\nFixed file written to: ${outPath}`);
