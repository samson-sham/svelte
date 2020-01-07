<script>
	// import { data } from './dataStore';
	import { beforeUpdate, afterUpdate } from 'svelte';
	export let name;

	afterUpdate(() => {
		const div = document.querySelector("#text");
		const range = document.createRange();
		// Children could be text, could be div
		const lastChild = div.childNodes[div.childNodes.length-1];
		console.log(div.childNodes, lastChild);
		// return;
		if (!lastChild) return;
		range.setStart(lastChild, lastChild.innerText ? 1 : lastChild.length);	// if it is a div, return 1 for startOffset
		range.collapse(true);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	});
	let data = {
		// Uint8Array?
		_data: [],
		get hex() {
			return this._data.join(" ");
		},
		set hex(newHex) {
			const SPAN = 2;
			const sanitizedHex = newHex.replace(/[^0-9a-fA-F]/g, "").replace(new RegExp(`^0{${SPAN-1}}`), "");
			console.log("[sanitizedHex]", sanitizedHex);
			this._data = [...divideText(sanitizedHex, SPAN)];
		},
		get charCode() {
			
		},
		set charCode(s) {

		}
	};
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
	
</script>

<main>
	<h1>Binary Viewer</h1>
	<div id="text" contenteditable="true" bind:innerHTML={data.hex}></div>
	<!-- <div id="text" contenteditable="true" bind:innerHTML={data.data}></div> -->
	<!-- <div contenteditable="true" bind:innerHTML={data}></div> -->
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