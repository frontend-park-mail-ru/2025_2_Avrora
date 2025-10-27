export class OfferCreateFifthStage {
  constructor(state, app) {
    this.state = state;
    this.app = app;
    this.images = [];
  }

  render() {
    const root = document.createElement('div');
    root.className = 'create-ad';

    root.appendChild(this.createProgress('5 этап. Фотографии и описание', 100, 100));

    const descBlock = document.createElement('div');
    descBlock.className = 'create-ad__choice-block';

    const descTitle = document.createElement('h1');
    descTitle.className = 'create-ad__form-label';
    descTitle.textContent = 'Описание';

    const descInput = document.createElement('textarea');
    descInput.className = 'create-ad__input create-ad__input_textarea';
    descInput.placeholder = 'Описание';
    descInput.rows = 4;

    descBlock.appendChild(descTitle);
    descBlock.appendChild(descInput);
    root.appendChild(descBlock);

    const fileBlock = document.createElement('div');
    fileBlock.className = 'create-ad__file-upload';

    const uploadContainer = document.createElement('div');
    uploadContainer.className = 'create-ad__file-upload-container';

    const uploadedImages = document.createElement('div');
    uploadedImages.className = 'create-ad__uploaded-images';

    const selectBtn = document.createElement('button');
    selectBtn.className = 'create-ad__file-select-button';
    selectBtn.textContent = 'Выбрать файлы';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    selectBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const imgWrap = document.createElement('div');
          imgWrap.className = 'create-ad__uploaded-image';

          const img = document.createElement('img');
          img.src = ev.target.result;
          img.alt = file.name;

          const removeBtn = document.createElement('button');
          removeBtn.className = 'create-ad__remove-image';
          removeBtn.textContent = '×';
          removeBtn.addEventListener('click', () => {
            imgWrap.remove();
            this.images = this.images.filter(img => img.name !== file.name);
          });

          imgWrap.appendChild(img);
          imgWrap.appendChild(removeBtn);
          uploadedImages.appendChild(imgWrap);
          this.images.push({ name: file.name, url: ev.target.result });
        };
        reader.readAsDataURL(file);
      });
    });

    uploadContainer.appendChild(uploadedImages);
    uploadContainer.appendChild(selectBtn);
    fileBlock.appendChild(uploadContainer);
    fileBlock.appendChild(fileInput);
    root.appendChild(fileBlock);

    root.appendChild(this.createNav({ prev: true, publish: true }));

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

  createNav({ prev = false, publish = false } = {}) {
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