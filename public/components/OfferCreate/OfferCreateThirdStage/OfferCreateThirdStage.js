export class OfferCreateThirdStage {
  constructor(state, app) {
    this.state = state;
    this.app = app;
  }

  render() {
    const root = document.createElement('div');
    root.className = 'create-ad';

    root.appendChild(this.createProgress('3 этап. Параметры', 60, 60));

    root.appendChild(
      this.createChoiceBlock('Количество комнат', [
        'Студия', '1', '2', '3', '4+'
      ])
    );

    root.appendChild(this.createInputBlock('Общая площадь', 'Общая площадь'));
    root.appendChild(this.createInputBlock('Жилая площадь', 'Жилая площадь'));
    root.appendChild(this.createInputBlock('Площадь кухни', 'Площадь кухни'));

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

  createChoiceBlock(titleText, labels) {
    const block = document.createElement('div');
    block.className = 'create-ad__choice-block';

    const title = document.createElement('h1');
    title.className = 'create-ad__form-label';
    title.textContent = titleText;

    const group = document.createElement('div');
    group.className = 'create-ad__choice-group';

    labels.forEach((label) => {
      const button = document.createElement('button');
      button.className = 'create-ad__choice-button';
      button.textContent = label;
      group.appendChild(button);
    });

    block.appendChild(title);
    block.appendChild(group);
    return block;
  }

  createInputBlock(titleText, placeholder) {
    const block = document.createElement('div');
    block.className = 'create-ad__choice-block';

    const title = document.createElement('h1');
    title.className = 'create-ad__form-label';
    title.textContent = titleText;

    const group = document.createElement('div');
    group.className = 'create-ad__choice-group';

    const input = document.createElement('input');
    input.className = 'create-ad__input';
    input.placeholder = placeholder;

    group.appendChild(input);
    block.appendChild(title);
    block.appendChild(group);
    return block;
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