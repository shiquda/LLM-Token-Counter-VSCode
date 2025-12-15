const assert = require('assert');
const vscode = require('vscode');

const extension = require('../../src/extension');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});

suite('File Pattern Matching', () => {
	const { setEnabledFilePatterns, matchesEnabledFilePatterns } = extension._test;

	/**
	 * Create a mock editor object for testing
	 * @param {string} filePath - The file path to use
	 * @returns {object} Mock editor object
	 */
	function createMockEditor(filePath) {
		return {
			document: {
				uri: {
					fsPath: filePath
				}
			}
		};
	}

	test('Empty patterns array should match all files', () => {
		setEnabledFilePatterns([]);

		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.js')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.md')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.mdc')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.txt')), true);
	});

	test('Should match *.md pattern', () => {
		setEnabledFilePatterns(['*.md']);

		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.md')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/README.md')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.js')), false);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.mdc')), false);
	});

	test('Should match *.mdc pattern', () => {
		setEnabledFilePatterns(['*.mdc']);

		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.mdc')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/rules.mdc')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.md')), false);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.js')), false);
	});

	test('Should match multiple patterns (*.md, *.mdc)', () => {
		setEnabledFilePatterns(['*.md', '*.mdc']);

		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.md')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.mdc')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/README.md')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/rules.mdc')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.js')), false);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.txt')), false);
	});

	test('Should handle dotfiles when pattern includes dot', () => {
		setEnabledFilePatterns(['*.md']);

		// Files starting with dot should still match if extension matches
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/.hidden.md')), true);
	});

	test('Should return false for null/undefined editor', () => {
		setEnabledFilePatterns(['*.md']);

		assert.strictEqual(matchesEnabledFilePatterns(null), false);
		assert.strictEqual(matchesEnabledFilePatterns(undefined), false);
		assert.strictEqual(matchesEnabledFilePatterns({}), false);
		assert.strictEqual(matchesEnabledFilePatterns({ document: null }), false);
	});

	test('Should match patterns with path separators', () => {
		setEnabledFilePatterns(['**/*.md']);

		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.md')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/deeply/nested/path/file.md')), true);
	});

	test('Should match specific directory patterns', () => {
		setEnabledFilePatterns(['**/docs/*.md']);

		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/project/docs/readme.md')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/docs/guide.md')), true);
	});

	test('Should trim whitespace from patterns', () => {
		// This test verifies that patterns with leading/trailing whitespace are trimmed
		// If patterns aren't trimmed, " *.md " would fail to match "file.md"
		setEnabledFilePatterns([' *.md ', '  *.mdc  ']);

		// These should match because patterns should be trimmed to "*.md" and "*.mdc"
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.md')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.mdc')), true);
		assert.strictEqual(matchesEnabledFilePatterns(createMockEditor('/path/to/file.js')), false);
	});

	// Cleanup after tests
	suiteTeardown(() => {
		setEnabledFilePatterns([]);
	});
});
