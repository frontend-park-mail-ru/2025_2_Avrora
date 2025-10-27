export class OfferCreateFourthStage {
  constructor(state, app) {
    this.state = state;
    this.app = app;
  }

  render() {
    const root = document.createElement('div');
    root.className = 'create-ad';

    root.appendChild(this.createProgress('4 этап. Цена', 80, 80));

    const block = document.createElement('div');
    block.className = 'create-ad__choice-block';

    const group = document.createElement('div');
    group.className = 'create-ad__form-row';

    const leftColumn = document.createElement('div');
    leftColumn.className = 'create-ad__form-column';

    leftColumn.appendChild(this.createFormGroup('Цена, руб', 'Цена'));
    leftColumn.appendChild(this.createFormGroup('Залог, руб', 'Залог'));
    leftColumn.appendChild(this.createFormGroup('Комиссия, руб', 'Комиссия'));

    const rightColumn = document.createElement('div');
    rightColumn.className = 'create-ad__form-column';

    rightColumn.appendChild(this.createFormGroup('Предоплата', 'Предоплата'));
    rightColumn.appendChild(this.createFormGroup('Срок аренды', 'Срок аренды'));

    group.appendChild(leftColumn);
    group.appendChild(rightColumn);
    block.appendChild(group);
    root.appendChild(block);

    root.appendChild(this.createNav({ prev: true, next: true }));

    return root;
  }

  createProgress(titleText, value, ariaNow) {
    const progress = document.createElement('div');
    progress.className = 'create-ad__progress';

    const title = document.createElement('h1');
    title.className = 'create-ad__progress-title';
    title.textContent = titleText;

    const barWrap = document.createElement('div');
    barWrap.className = 'create-ad__progress-bar';
    barWrap.setAttribute('role', 'progressbar');
    barWrap.setAttribute('aria-label', 'Готово');
    barWrap.setAttribute('aria-valuemin', '0');
    barWrap.setAttribute('aria-valuemax', '100');
    barWrap.setAttribute('aria-valuenow', String(ariaNow));
    barWrap.style.setProperty('--value', String(value));

    const bar = document.createElement('div');
    bar.className = 'create-ad__progress-bar-inner';
    barWrap.appendChild(bar);

    progress.appendChild(title);
    progress.appendChild(barWrap);
    return progress;
  }

  createFormGroup(labelText, placeholder) {
    const group = document.createElement('div');
    group.className = 'create-ad__form-group';

    const label = document.createElement('h1');
    label.className = 'create-ad__form-label';
    label.textContent = labelText;

    const input = document.createElement('input');
    input.className = 'create-ad__input';
    input.placeholder = placeholder;

    group.appendChild(label);
    group.appendChild(input);
    return group;
  }

  createNav({ prev = false, next = false } = {}) {
    const nav = document.createElement('div');
    nav.className = 'create-ad__nav';

    const group = document.createElement('div');
    group.className = 'create-ad__nav-group';

    if (prev) {
      const back = document.createElement('button');
      back.className = 'create-ad__nav-button create-ad__nav-button_prev';
      back.textContent = 'Назад';
      back.dataset.action = 'prev';
      group.appendChild(back);
    }

    if (next) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'create-ad__nav-button create-ad__nav-button_next';
      nextBtn.textContent = 'Дальше';
      nextBtn.dataset.action = 'next';
      group.appendChild(nextBtn);
    }

    nav.appendChild(group);
    return nav;
  }
}