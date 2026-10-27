/**
 * @fileoverview Unit tests for js/vox.js pure functional utilities and Astropathic logic.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const voxModule = require('../../js/vox.js');

test('vox pure: isRogueSectorInterference correctly classifies parallel sector broadcasts', () => {
  assert.equal(voxModule.isRogueSectorInterference(null), false);
  assert.equal(voxModule.isRogueSectorInterference({}), false);
  assert.equal(
    voxModule.isRogueSectorInterference({ origin_hint: 'PARALLEL SECTOR BROADCAST', redacted_text: 'Warning' }),
    true
  );
  assert.equal(
    voxModule.isRogueSectorInterference({ origin_hint: 'Alpha Conduit', redacted_text: 'ORBITAL AUGUR ARRAY signal intercepted' }),
    true
  );
  assert.equal(
    voxModule.isRogueSectorInterference({ origin_hint: 'Sector 4', redacted_text: 'ROGUE SECTOR fleet movement detected' }),
    true
  );
  assert.equal(
    voxModule.isRogueSectorInterference({ origin_hint: 'Conduit Alpha', redacted_text: 'Standard patrol report' }),
    false
  );
});

test('vox pure: isVoxServerOnline validates timestamps and heartbeat status', () => {
  const now = 1700000000000;
  assert.equal(voxModule.isVoxServerOnline(null, now), false);
  assert.equal(voxModule.isVoxServerOnline({ status: 'offline' }, now), false);
  assert.equal(voxModule.isVoxServerOnline({ status: 'online', updatedAt: now - 5000 }, now), true);
  assert.equal(voxModule.isVoxServerOnline({ status: 'online', updatedAt: now - 35000 }, now), false);
});

test('vox pure: formatRedactedHtml safely injects censor bars for [REDACTED]', () => {
  const raw = 'The target is [REDACTED] located at coordinates [REDACTED].';
  const formatted = voxModule.formatRedactedHtml(raw);
  assert.ok(formatted.includes('class="censor-bar"'));
  assert.ok(!formatted.includes('[REDACTED]'));
  assert.equal(voxModule.formatRedactedHtml(''), '');
  assert.equal(voxModule.formatRedactedHtml(null), '');
});

test('vox pure: extractDynamicReplyCardMeta parses explicit headers and fallback titles', () => {
  const bannerText = '+++ INCOMING TRANSMISSION: SECTOR REPORT +++\nDetails follow.';
  const meta1 = voxModule.extractDynamicReplyCardMeta(bannerText);
  assert.ok(meta1.cardTitle);
  assert.ok(!meta1.cleanBody.includes('+++ INCOMING TRANSMISSION:'));

  const standardText = 'Casual message without custom banner.';
  const meta2 = voxModule.extractDynamicReplyCardMeta(standardText);
  assert.ok(meta2.cardTitle);
  assert.equal(meta2.cleanBody, 'Casual message without custom banner.');
});

test('vox pure: escapeHtml neutralizes hazardous characters', () => {
  const unsafe = '<script>alert("xss")&"\'</script>';
  const safe = voxModule.escapeHtml(unsafe);
  assert.ok(!safe.includes('<script>'));
  assert.ok(safe.includes('&lt;script&gt;'));
  assert.ok(safe.includes('&amp;'));
  assert.ok(safe.includes('&quot;'));
});
