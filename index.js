const { fromEvent, from, BehaviorSubject, of } = rxjs;
const { switchMap, pairwise, filter, map } = rxjs.operators;

const button = document.querySelector('#button');
const input = document.querySelector('#input');
const responseContainer = document.querySelector('#response-container');
const cancelPrevRequestContainer = document.querySelector(
	'#cancel-prev-request-container'
);

// первое задание , очистка поля input
const clicks = fromEvent(button, 'click');
clicks.subscribe(() => {
	input.value = '';
	responseContainer.innerHTML = '';
	cancelPrevRequestContainer.innerHTML = '';
});

// второе задание. подписка на изменение поля input с вводом последнего изменения в контейнер с id "cancel-prev-request-container".

const changeInput = fromEvent(input, 'input');

function resolveCancelRequest() {
	changeInput
		.pipe(switchMap(() => from(getApiResponse(input.value))))
		.subscribe(value => {
			console.log(value);
			cancelPrevRequestContainer.innerHTML = value;
		});
}
resolveCancelRequest();

// третье задание

function resolveRaceCondition() {
	// начальное значение
	const inputSubject = new BehaviorSubject(input.value.length);

	inputSubject
		.pipe(
			//  предыдущее и текущее значения в виде массива
			pairwise(),

			//фильтр по длинне
			filter(([a, b]) => a < b),

			// запрашиваем api с текущем значением и отменой предыдущего
			switchMap(() => from(getApiResponse(input.value)))
		)
		// подписываемся на  изменение value
		.subscribe(value => {
			responseContainer.innerHTML = value;
		});

	changeInput.pipe(map(() => input.value.length)).subscribe(value => {
		inputSubject.next(value);
	});
}
resolveRaceCondition();
