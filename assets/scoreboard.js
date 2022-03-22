
const createElement = (tagName, content, className = '') => {
	const elem = document.createElement(tagName);
	elem.innerText = content;
	elem.className = className;
	return elem;
};


const scoreboard = {
	windows: [
		window
	],
	zoom: 16,


	animate: (elem, content) => {
		const oldContent = elem.dataset.content || elem.innerText || '00';
		elem.dataset.content = content;

		elem.innerHTML = '';
		const inner = createElement('div', '', 'inner');
		elem.appendChild(inner);

		Array.from(content).forEach((letter, i) => {
			const oldLetter = createElement('span', oldContent[i] || ' ', 'letter-old');
			const newLetter = createElement('span', letter, 'letter-new');
			inner.append(oldLetter, newLetter);

			if (oldContent[i] && letter != oldContent[i]) {
				setTimeout(() => {
					oldLetter.style.transform = `translateY(-100%)`;
					newLetter.style.transform = `translateY(0)`;
				}, (elem.dataset.content.length - i) * 60);
			}
		});

	},
	animateAll: (selector, content) => {
		scoreboard.windows.forEach(w => scoreboard.animate(w.document.querySelector(selector), content));
	},


	click: {
		popout: () => {
			const w = window.open('', 'simplescoreboardpopup', 'popup');
			w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>simplescoreboard</title><link rel="stylesheet" href="assets/scoreboard.css"></head><body></body></html>`);
			w.document.body.innerHTML = '';

			const template = document.querySelector('.scoreboard');
			const copy = template.cloneNode(true);
			copy.classList.remove('editable');
			w.document.body.appendChild(copy);

			w.document.addEventListener('click', e => {
				w.document.documentElement.requestFullscreen();
			});

			if (!scoreboard.windows.includes(w)) scoreboard.windows.push(w);
		},

		timer: caller => {
			if (scoreboard.timer.interval) {
				scoreboard.history.add('pause');
				scoreboard.timer.stop();
				caller.innerText = 'continue';
			} else {
				scoreboard.timer.start();
				caller.innerText = 'pause';
			}
		},

		round: () => {
			scoreboard.timer.reset();
			document.querySelector('.timer-button').innerHTML = 'start';
			scoreboard.history.add('new round');
		},

		duel: () => {
			scoreboard.timer.reset();
			document.querySelector('.timer-button').innerHTML = 'start';
			scoreboard.players.all.forEach(p => {
				p.increaseScore(-p.score);
				p.setWarning(0);
			});

			scoreboard.history.clear();
		},

		zoom: delta => scoreboard.windows.slice(-1).pop().document.documentElement.style.fontSize = `${scoreboard.zoom += delta}px`
	},


	players: {
		red: () => scoreboard.players.all.filter(p => p.color == 'red')[0],
		blue: () => scoreboard.players.all.filter(p => p.color == 'blue')[0],

		all: [],
		new: (color) => ({
			color: color,
			warning: 0,
			score: 0,

			increaseScore: function (s) {
				this.score += s;
				scoreboard.animateAll('.score-label.' + this.color, this.score.toString().padStart(2, '0'));
				if (s > 0) this.setWarning(0);
			},

			setWarning: function (w) {
				this.warning = Math.max(w, 0);
				scoreboard.animateAll('.warning-label.' + this.color, this.warning > 0 ? this.warning.toString().padStart(2, '0') : '  ');
			}
		})
	},


	timer: {
		minutes: 0,
		seconds: 0,
		time: () => `${scoreboard.timer.minutes.toString().padStart(2, '0')}:${scoreboard.timer.seconds.toString().padStart(2, '0')}`,
		interval: null,

		tick: () => {
			scoreboard.timer.seconds ++;
			if (scoreboard.timer.seconds > 59) {
				scoreboard.timer.minutes ++;
				scoreboard.timer.seconds = 0;
			}
			scoreboard.animateAll('.timer', scoreboard.timer.time());

			scoreboard.players.all.filter(p => p.warning > 0).forEach(p => p.setWarning(p.warning - 1));
		},

		start: () => {
			if (!scoreboard.timer.interval) scoreboard.timer.interval = setInterval(scoreboard.timer.tick, 1000);
		},

		stop: () => {
			clearInterval(scoreboard.timer.interval);
			scoreboard.timer.interval = null;
		},

		reset: () => {
			scoreboard.timer.stop();
			scoreboard.timer.minutes = scoreboard.timer.seconds = 0;
			scoreboard.animateAll('.timer', scoreboard.timer.time());
		}
	},

	history: {
		add: (text, className = '') => scoreboard.windows.forEach(w => {
			const h = w.document.querySelector('.history')
			h.append(createElement('div', text, 'entry ' + className));
			h.scrollTo({left: h.scrollWidth, behavior: 'smooth'});
		}),
		clear: (text, className = '') => scoreboard.windows.forEach(w => w.document.querySelector('.history').innerHTML = '')
	}
};

scoreboard.players.all.push(scoreboard.players.new('red'));
scoreboard.players.all.push(scoreboard.players.new('blue'));


document.addEventListener('click', e => {
	if (e.target.nodeName != 'BUTTON') return;
	if (!e.target.classList.contains('red') && !e.target.classList.contains('blue')) return;
	scoreboard.history.add(e.target.innerText, e.target.classList.contains('red') ? 'red' : e.target.classList.contains('blue') ? 'blue' : '');
});

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('input.name-label').forEach(label => label.addEventListener('change', e => {
		if (scoreboard.windows.length > 1) scoreboard.windows.slice(1).forEach(w => {
			w.document.getElementsByClassName(label.className)[0].value = label.value;
			e.preventDefault();
		});

	}));

});
