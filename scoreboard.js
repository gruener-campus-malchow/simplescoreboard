
document.addEventListener('DOMContentLoaded', () => {
	let w;
	const controls = document.querySelector('.controls');

	controls.appendChild(createButton('pop out', e => {
		w = window.open('', 'simplescoreboardpopup', 'popup');
		w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>simplescoreboard</title><link rel="stylesheet" href="scoreboard.css"></head><body></body></html>`);
		w.document.body.innerHTML = '';

		const template = document.querySelector('.scoreboard');
		const copy = template.cloneNode(true);
		copy.classList.remove('editable');
		w.document.body.appendChild(copy);

		w.document.addEventListener('click', e => {
			w.document.documentElement.requestFullscreen();
		});
	}));

	const r = createRow();
	for (b of [1,2,4,5]) {

	}


	initNameLabel('.scoreboard .name-label.red');
	initNameLabel('.scoreboard .name-label.blue');
	function initNameLabel(selector) {
		const label = document.querySelector(selector);
		label.addEventListener('change', e => {
			if (!w) return;

			w.document.querySelector(selector).value = label.value;
			e.preventDefault();
		});
	}


	function createButton(text, callback, classList = '') {
		const b = document.createElement('button');
		b.type = 'button';
		b.innerText = text;
		b.class = classList;
		b.addEventListener('click', callback);

		return b;
	}

	function createRow() {
		const r = document.createElement('div');
		r.classList.add('row');
		return r;
	}
});

function click(type, value) {console.log(type, value);
	if (type == 'score red') {
		changeScore(document.querySelector('.scoreboard .score-label.red'), value);
		if (w) changeScore(w.document.querySelector('.scoreboard .score-label.red'), value);
	}

	function changeScore(e, s) {
		const value = parseInt(e.innerText) + s;
		e.innerText = value.toString().padStart(2, '0');
	}
}
