
document.addEventListener('DOMContentLoaded', () => {
	let w;
	const controls = document.querySelector('.controls');

	// timer
	let tm=0, ts=0, paused = true;
	// warnings
	let wt = { 'red': 0, 'blue': 0 };

	document.querySelectorAll('.fancy-animation').forEach(e => {
		e.dataset.content = e.innerText;
		registerDigits(e);
	});

	controls.appendChild(createButton('pop out', e => {
		w = window.open('', 'simplescoreboardpopup', 'popup');
		w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>simplescoreboard</title><link rel="stylesheet" href="assets/scoreboard.css"></head><body></body></html>`);
		w.document.body.innerHTML = '';

		const template = document.querySelector('.scoreboard');
		const copy = template.cloneNode(true);
		copy.classList.remove('editable');
		w.document.body.appendChild(copy);

		w.document.querySelectorAll('.fancy-animation').forEach(e => registerDigits(e) );

		w.document.addEventListener('click', e => {
			w.document.documentElement.requestFullscreen();
		});
	}));

	const top = createRow();
	const middle = createRow();
	const bottom = createRow();
	controls.append(top, middle, bottom);

	let createPlayerControls = color => {
		for (b of ['+1', '+2', '+4', '+5']) {
			top.appendChild(createScoreButton(b, color));
			middle.appendChild(createScoreButton(-b, color));
		}
		top.appendChild(createButton('warning', e => {
			wt[color] = 30;
			updateTimers();
		}, color));
		middle.appendChild(createButton('end warning', e => {
			wt[color] = 0;
			updateTimers();
		}, color));
	}
	createPlayerControls('red');
	createPlayerControls('blue');

	let size = 16;
	bottom.appendChild(createButton('-', e => {
		if (w) w.document.documentElement.style.fontSize = `${--size}px`;
	}, 'small'));
	const timerButton = createButton('start', e => {
		paused = !paused;
		e.currentTarget.innerText = paused ? 'continue' : 'stop';
		updateTimers();
	});
	bottom.appendChild(timerButton);
	bottom.appendChild(createButton('new round', e => {
		tm = 0;
		ts = 0;
		paused = true;
		timerButton.innerText = 'start';
		updateTimers();
	}));
	bottom.appendChild(createButton('new game', e => {
		tm = 0;
		ts = 0;
		wt.red = 0;
		wt.blue = 0;
		paused = true;
		timerButton.innerText = 'start';
		updateTimers();
		document.querySelectorAll('.score-label').forEach(e => e.innerText = '00');
	}));
	bottom.appendChild(createButton('+', e => {
		if (w) w.document.documentElement.style.fontSize = `${++size}px`;
	}, 'small'));

	setInterval(() => {
		if (paused) return;

		ts ++;
		if (ts > 59) {
			ts = 0;
			tm ++;
		}
		wt.red --;
		wt.blue --;
		updateTimers();
	}, 1000);
	function updateTimers() {
		// main timer
		setText('.timer', `${tm.toString().padStart(2, '0')}:${ts.toString().padStart(2, '0')}`);
		// warning timers
		setText('.warning-label.red', (wt.red > 0) ? wt.red.toString().padStart(2, '0') : '');
		setText('.warning-label.blue', (wt.blue > 0) ? wt.blue.toString().padStart(2, '0') : '');
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


	function createScoreButton(amount, color) {
		return createButton(amount, e => {
			changeScore(document.querySelector(`.scoreboard .score-label.${color}`), parseInt(amount));
			if (w) changeScore(w.document.querySelector(`.scoreboard .score-label.${color}`), parseInt(amount));
			if (parseInt(amount) > 0) wt[color] = 0;
			updateTimers();
		}, `small ${color}`);

		function changeScore(e, s) {
			const value = (parseInt(e.dataset.content) || 0) + s;
			e.dataset.content = value.toString().padStart(2, '0');
		}
	}



	function createButton(text, callback, classList = '') {
		const b = document.createElement('button');
		b.type = 'button';
		b.innerText = text;
		b.className = classList;
		b.addEventListener('click', callback);

		return b;
	}

	function createRow() {
		const r = document.createElement('div');
		r.classList.add('row');
		return r;
	}


	function setText(target, text) {
		document.querySelector(target).dataset.content = text;
		if (w) w.document.querySelector(target).dataset.content = text;
	}



	function registerDigits(elem) {
		// thanks to https://stackoverflow.com/a/41425087
		new MutationObserver(mutations => {
		  mutations.forEach(mutation => {
			if (mutation.type === 'attributes' && mutation.attributeName === 'data-content') {
				if (mutation.oldValue == elem.dataset.content) return;

				elem.innerHTML = '';
				const inner = document.createElement('div');
				inner.classList.add('inner');
				elem.appendChild(inner);

				for (i in elem.dataset.content) {
					const oldLetter = document.createElement('span');
					const newLetter = document.createElement('span');
					oldLetter.classList.add('letter-old');
					newLetter.classList.add('letter-new');
					oldLetter.innerText = mutation.oldValue[i] || elem.dataset.content[i];
					newLetter.innerText = elem.dataset.content[i];
					inner.append(oldLetter, newLetter);

					if (mutation.oldValue[i] && elem.dataset.content[i] != mutation.oldValue[i]) {
						setTimeout(() => {
							oldLetter.style.transform = `translateY(-100%)`;
							newLetter.style.transform = `translateY(0)`;
						}, (elem.dataset.content.length - i) * 60);
					}
				}
			}
		  });
		}).observe(elem, {
			attributes: true,
			attributeOldValue: true
		});
	}

});
