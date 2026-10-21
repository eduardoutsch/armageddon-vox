const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const VOX_AUDIO_PATH = path.join(ROOT_DIR, 'js/vox-audio.js');

test('js/vox-audio.js exists and implements the 40K Vox-Caster ambient playlist and SFX synth', () => {
  assert.ok(fs.existsSync(VOX_AUDIO_PATH), 'js/vox-audio.js must exist');
  const code = fs.readFileSync(VOX_AUDIO_PATH, 'utf8');

  // Verify core constants and identifiers
  assert.ok(code.includes('PL1PnO3JojeSmA_jPzjhuiKycUQ8BHHjek'), 'Must configure the official YouTube playlist ID');
  assert.ok(code.includes('soa_vox_music_enabled_v1'), 'Must configure localStorage key for music state persistence');

  // Verify Web Audio button clank synthesizer
  assert.ok(code.includes('playTerminalClank'), 'Must define playTerminalClank SFX function');
  assert.ok(code.includes('AudioContext') || code.includes('webkitAudioContext'), 'Must instantiate Web AudioContext');

  // Verify YouTube IFrame API integration
  assert.ok(code.includes('https://www.youtube.com/iframe_api'), 'Must dynamically load YouTube Iframe API');
  assert.ok(code.includes('voxMusicToggle'), 'Must create voxMusicToggle top-nav button');
  assert.ok(code.includes('voxMusicSkip'), 'Must create voxMusicSkip button');
});
