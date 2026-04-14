const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
const extension = require('../../src/extension');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('UTF-8 boundary map includes multi-byte character boundaries', () => {
		const map = extension.__internal.buildUtf8BoundaryMap('A❌B');
		assert.strictEqual(map.get(0), 0);
		assert.strictEqual(map.get(1), 1);
		assert.strictEqual(map.get(4), 2);
		assert.strictEqual(map.get(5), 3);
	});

	test('resolveUtf16Offset snaps to nearest valid boundary', () => {
		const source = 'A❌B';
		const map = extension.__internal.buildUtf8BoundaryMap(source);

		const totalBytes = Buffer.byteLength(source, 'utf8');

		assert.strictEqual(extension.__internal.resolveUtf16Offset(map, 2, totalBytes, 'backward'), 1);
		assert.strictEqual(extension.__internal.resolveUtf16Offset(map, 2, totalBytes, 'forward'), 2);
	});

	test('normalization offset map preserves full-width character spans', () => {
		const map = extension.__internal.buildNormalizationOffsetMap('ＡB');
		assert.strictEqual(map.normalizedText, 'AB');
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 0, 'backward'), 0);
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 1, 'forward'), 1);
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 2, 'forward'), 2);
	});

	test('normalization offset map expands combined characters back to original span', () => {
		const map = extension.__internal.buildNormalizationOffsetMap('e\u0301');
		assert.strictEqual(map.normalizedText, 'é');
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 0, 'backward'), 0);
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 1, 'forward'), 2);
	});

	test('normalization offset map snaps interior expanded offsets to one original grapheme', () => {
		const map = extension.__internal.buildNormalizationOffsetMap('ﬃ');
		assert.strictEqual(map.normalizedText, 'ffi');
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 1, 'backward'), 0);
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 1, 'forward'), 1);
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 2, 'backward'), 0);
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 2, 'forward'), 1);
	});

	test('normalization offset map preserves full-width parentheses spans', () => {
		const map = extension.__internal.buildNormalizationOffsetMap('（）');
		assert.strictEqual(map.normalizedText, '()');
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 0, 'backward'), 0);
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 1, 'backward'), 1);
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 1, 'forward'), 1);
		assert.strictEqual(extension.__internal.resolveOriginalOffsetFromNormalized(map, 2, 'forward'), 2);
	});

	test('normalization offset map returns null when NFKC merges across grapheme boundaries', () => {
		assert.strictEqual(extension.__internal.buildNormalizationOffsetMap('\uFFB5\uFFCC'), null);
	});
});
