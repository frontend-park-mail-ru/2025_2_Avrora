export class OfferCreateFirstStage {
  constructor(state, app) {
    this.state = state;
    this.app = app;
  }

  render() {
    const root = document.createElement('div');
    root.className = 'create-ad';

    root.appendChild(this.createProgress('1 этап. Тип сделки', 20, 20));

    root.appendChild(
      this.createChoiceBlock('Вид недвижимости', [
        this.makeButton('Новостройки'),
        this.makeButton('Вторичка')
      ])
    );

    root.appendChild(
      this.createChoiceBlock('Тип объявления', [
        this.makeButton('Продажа'),
        this.makeButton('Аренда')
      ])
    );

    root.appendChild(
      this.createChoiceBlock('Тип недвижимости', [
        this.makeButton('Квартира'),
        this.makeButton('Дом'),
        this.makeButton('Гараж')
      ])
    );

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

  createChoiceBlock(titleText, children) {
    const block = document.createElement('div');
    block.className = 'create-ad__choice-block';

    const title = document.createElement('h1');
    title.className = 'create-ad__choice-title';
    title.textContent = titleText;

    const group = document.createElement('div');
    group.className = 'create-ad__choice-group';

    children.forEach((child) => group.appendChild(child));

    block.appendChild(title);
    block.appendChild(group);
    return block;
  }

  makeButton(text) {
    const btn = document.createElement('button');
    btn.className = 'create-ad__choice-button';
    btn.textContent = text;
    return btn;
  }

  createNav({ prev = false, next = false, publish = false } = {}) {
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
      const forward = document.createElement('button');
      forward.className = 'create-ad__nav-button create-ad__nav-button_next';
      forward.textContent = 'Дальше';
      forward.dataset.action = 'next';
      group.appendChild(forward);
    }

    if (publish) {
      const pub = document.createElement('button');
      pub.className = 'create-ad__nav-button create-ad__nav-button_publish';
      pub.textContent = 'Опубликовать';
      pub.dataset.action = 'publish';
      group.appendChild(pub);
    }

    nav.appendChild(group);
    return nav;
  }
}