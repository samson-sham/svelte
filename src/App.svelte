<script>
	// import { data } from './dataStore';
	import { beforeUpdate, afterUpdate } from 'svelte';
	import Cursor from './cursor';
	export let name;

	window.debug = () => {
		return data;
	};
	/** @type {Cursor?} _cursor */
	let _cursor;
	/**
	 * Obtain current cursor
	 * @return {Cursor?} - cursor object that follows on where the cursor is currently sit on
	 */
	function getCursor() {
		// Obtain range
		const selection = window.getSelection();
		if (!selection || selection.type !== "Caret" || !selection.isCollapsed || !selection.rangeCount) return;
		// Determine if the range lies on text node
		const range = selection.getRangeAt(0);
		if (!range.startContainer || range.startContainer.nodeType !== 3) return;
		const {startContainer} = range;	// Text node
		// Get the real end offset from range (Since collapsed range: endOffset = startOffset)
		const endOffset = startContainer.length - range.startOffset;
		return new Cursor(startContainer, endOffset);
	}
	/**
	 * Obtain cursor at last position
	 * @return {Cursor?}
	 */
	function getEndCursor() {
		// find selecting div
		const selection = window.getSelection();
		if (!selection || selection.type !== "Caret" || !selection.isCollapsed) return;
		const {focusNode} = selection;	// Usually is a Text Node, not Element Node
		const focusingElement = focusNode.nodeType !== 1 ? focusNode.parentNode : focusNode;
		const div = focusingElement.closest("div[contenteditable=true]");
		/**
		 * Find best possible last node which is a text node
		 * @returns {Node} could be TextNode or other Nodes
		 */
		const findLastNode = (node) => {
			// Children could be text, could be div
			const lastChild = node.lastChild;
			if (!lastChild) return;
			if (lastChild.nodeType !== 3) return findLastNode(lastChild) || node;
			return lastChild;
		};
		const lastNode = findLastNode(div);
		if (!lastNode) return;
		return new Cursor(lastNode, 0);
	}
	// beforeUpdate(() => {
	// 	_cursor = getCursor();
	// });
	afterUpdate(() => {
		_cursor = getEndCursor();
		if (!_cursor) return;
		const selection = window.getSelection();
		selection.removeAllRanges();
		// if it is a div, return 1 for startOffset
		selection.addRange(_cursor.getRange());
	});

	// let data = '';
	let data = {
		// Uint8Array?
		_data: new Uint8Array(),
		_isNewCharCode: false,
		get hex() {
			// format for long lines?
			// Unsigned byte, so no need (byte & 0xFF) to rectify signed values
			return Array.from(this._data).map(byte => byte.toString(16).padStart(2, '0')).join(" ");
		},
		set hex(html) {
			const sanitizedHex = _unescape(html)
				// Removing spaces and non-Hex values
				.replace(/[^0-9a-fA-F\n]/g, "")
				// Removing leading zero
				.replace(new RegExp(`^0(?=[0-9a-fA-Z])`), "");
			this._data = new Uint8Array([...divideText(sanitizedHex, 2)].map(hex => parseInt(hex, 16)));
		},
		get charCode() {
			const charCode = Array.from(this._data).join(" ");
			return charCode + (this._isNewCharCode ? "&nbsp;" : "");
		},
		set charCode(html) {
			const htmlText = _unescape(html);
			// Removing spaces and non-Int values
			const sanitizedCharCode = htmlText.replace(/[^0-9 \n]/g, "");
			// If there is a trailing space, indicate a new charcode is inputting
			this._isNewCharCode = /\s$/.test(htmlText);
			// Parse and set max at 255
			const charCodes = sanitizedCharCode.split(" ").filter(x => x).map(str => {
				const code = parseInt(str, 10);
				return code > 255 ? 255 : code;
			});
			this._data = new Uint8Array(charCodes);
		},
		get utf8() {
			return String.fromCharCode.apply(null, this._data);
		},
		set utf8(html) {
			console.log("[setUTF8]", html);
			// @TODO: How much to unescape???
			const htmlText = _unescape(html);
			const textEncoder = new TextEncoder();
			this._data = textEncoder.encode(htmlText);
		},
		get utf16() {
			// Convert Uint8Array to Uint16Array
			// @WIP
			const uint16 = this._data;
			return String.fromCharCode.apply(null, new Uint16Array(this._data));
		}
	};
	// Lodash doesn't handle non-breaking space, either use he.js
	function _unescape(txt) {
		return txt.replace(/&nbsp;?/g, " ");
	}
	function* divideText(txt, span = 1) {
		if (span <= 0) return txt;
		const _txt = txt.padStart(span * Math.ceil(txt.length/span), '0');
		let index = 0;
		let subText;
		while (subText = _txt.substring(index, index+span)) {
			yield subText;
			index += span;
		}
	}
	function* divideArray(arr, span = 1) {
		if (span <= 0) return arr;
		
	}
</script>

<main>
	<h1>Binary Viewer</h1>
	<div>Hex</div>
	<div contenteditable="true" bind:innerHTML={data.hex}></div>
	<div>CharCode</div>
	<div contenteditable="true" bind:innerHTML={data.charCode}></div>
	<div>UTF-8</div>
	<div contenteditable="true" bind:innerHTML={data.utf8}></div>
	<div>UTF-16</div>
	<div contenteditable="true">{data.utf16}</div>
	<!-- <div id="text" contenteditable="true" bind:innerHTML={data}></div> -->
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
	[contenteditable] {
		padding: 0.5em;
		border: 1px solid #eee;
		border-radius: 4px;
	}
</style>