export class OfferCreateSecondStage {
  constructor(state, app) {
    this.state = state;
    this.app = app;
  }

  render() {
    const root = document.createElement('div');
    root.className = 'create-ad';

    root.appendChild(this.createProgress('2 этап. Расположение', 40, 40));

    const addressBlock = document.createElement('div');
    addressBlock.className = 'create-ad__choice-block';

    const addressTitle = document.createElement('h2');
    addressTitle.className = 'create-ad__form-label';
    addressTitle.textContent = 'Адрес';

    const addressGroup = document.createElement('div');
    addressGroup.className = 'create-ad__choice-group';

    addressGroup.appendChild(this.createInput('Город'));
    addressGroup.appendChild(this.createInput('Улица'));
    addressGroup.appendChild(this.createInput('Адрес'));

    addressBlock.appendChild(addressTitle);
    addressBlock.appendChild(addressGroup);
    root.appendChild(addressBlock);

    const floorsBlock = document.createElement('div');
    floorsBlock.className = 'create-ad__choice-block';

    const floorsGroup = document.createElement('div');
    floorsGroup.className = 'create-ad__form-row';

    const floorItem = this.createFormGroup('Этаж', 'Этаж');
    const totalFloorsItem = this.createFormGroup('Этажей в доме', 'Этажей');

    floorsGroup.appendChild(floorItem);
    floorsGroup.appendChild(totalFloorsItem);
    floorsBlock.appendChild(floorsGroup);
    root.appendChild(floorsBlock);

    root.appendChild(this.createChoiceBlock('В составе жилищного комплекса', ['Да', 'Нет']));

    const complexBlock = document.createElement('div');
    complexBlock.className = 'create-ad__choice-block';

    const complexTitle = document.createElement('h2');
    complexTitle.className = 'create-ad__form-label';
    complexTitle.textContent = 'Название жилищного комплекса';

    const complexGroup = document.createElement('div');
    complexGroup.className = 'create-ad__choice-group';
    complexGroup.appendChild(this.createInput('Название ЖК'));

    complexBlock.appendChild(complexTitle);
    complexBlock.appendChild(complexGroup);
    root.appendChild(complexBlock);

    const map = document.createElement('div');
    map.className = 'create-ad__map';
    root.appendChild(map);

    root.appendChild(this.createNav({ prev: true, next: true }));

    return root;
  }

  createProgress(titleText, value, ariaNow) {
    const progress = document.createElement('div');
    progress.className = 'create-ad__progress';

    const title = document.createElement('h2');
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

  createInput(placeholder) {
    const input = document.createElement('input');
    input.className = 'create-ad__input';
    input.placeholder = placeholder;
    return input;
  }

  createFormGroup(labelText, placeholder) {
    const group = document.createElement('div');
    group.className = 'create-ad__form-group';

    const label = document.createElement('h2');
    label.className = 'create-ad__form-label';
    label.textContent = labelText;

    const input = this.createInput(placeholder);

    group.appendChild(label);
    group.appendChild(input);
    return group;
  }

  createChoiceBlock(titleText, labels) {
    const block = document.createElement('div');
    block.className = 'create-ad__choice-block';

    const title = document.createElement('h2');
    title.className = 'create-ad__form-label';
    title.textContent = titleText;

    const group = document.createElement('div');
    group.className = 'create-ad__form-label';

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