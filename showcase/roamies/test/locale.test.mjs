import assert from 'node:assert/strict';
import { createLocale, detectLocale, SUPPORTED_LOCALES, translate } from '../locale.mjs';

assert.deepEqual(SUPPORTED_LOCALES, ['en', 'it']);
assert.equal(detectLocale({ stored: 'it-IT', preferred: 'en-US' }), 'it');
assert.equal(detectLocale({ stored: 'fr-FR', preferred: 'it-IT' }), 'it');
assert.equal(detectLocale({ stored: 'fr-FR', preferred: 'fr-FR' }), 'en');
assert.equal(translate('Settings', 'it'), 'Impostazioni');
assert.equal(translate('Unknown product string', 'it'), 'Unknown product string', 'unknown strings keep their fallback');
assert.equal(createLocale('it-IT').date(new Date('2026-11-13T12:00:00Z'), { day: 'numeric', month: 'long' }), '13 novembre');
assert.equal(createLocale('en').t('Settings'), 'Settings');
console.log('locale tests: passed');
