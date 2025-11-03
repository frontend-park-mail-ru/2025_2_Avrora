import { MediaService } from '../../../utils/MediaService.js';
import { Modal } from '../../../components/OfferCreate/Modal/Modal.js';

export class OfferCreateFifthStage {
    constructor({ state, app, dataManager, isEditing = false, editOfferId = null } = {}) {
        this.state = state;
        this.app = app;
        this.dataManager = dataManager;
        this.isEditing = isEditing;
        this.editOfferId = editOfferId;
        this.root = null;
        this.images = [];
        this.isUploading = false;
    }

    render() {
        this.root = document.createElement('div');
        this.root.className = 'create-ad';

        this.root.appendChild(this.createProgress('5 этап. Фотографии и описание', 100, 100));

        const descBlock = document.createElement('div');
        descBlock.className = 'create-ad__choice-block';

        const descTitle = document.createElement('h1');
        descTitle.className = 'create-ad__form-label';
        descTitle.textContent = 'Описание';

        const descInput = document.createElement('textarea');
        descInput.className = 'create-ad__input create-ad__input_textarea';
        descInput.placeholder = 'Опишите ваше объявление подробно...';
        descInput.rows = 6;
        descInput.dataset.field = 'description';

        descInput.addEventListener('input', () => {
            this.saveFormData();
        });

        descBlock.appendChild(descTitle);
        descBlock.appendChild(descInput);
        this.root.appendChild(descBlock);

        const fileBlock = document.createElement('div');
        fileBlock.className = 'create-ad__file-upload';

        const uploadTitle = document.createElement('h1');
        uploadTitle.className = 'create-ad__form-label';
        uploadTitle.textContent = 'Фотографии';
        fileBlock.appendChild(uploadTitle);

        const uploadContainer = document.createElement('div');
        uploadContainer.className = 'create-ad__file-upload-container';

        const uploadedImages = document.createElement('div');
        uploadedImages.className = 'create-ad__uploaded-images';

        const selectBtn = document.createElement('button');
        selectBtn.type = 'button';
        selectBtn.className = 'create-ad__file-select-button';
        selectBtn.textContent = 'Выбрать файлы';
        selectBtn.disabled = this.isUploading;

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        const uploadProgress = document.createElement('div');
        uploadProgress.className = 'create-ad__upload-progress';
        uploadProgress.style.display = 'none';

        selectBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            await this.handleFileUpload(files, uploadedImages, uploadProgress);
            fileInput.value = '';
        });

        uploadContainer.appendChild(uploadedImages);
        uploadContainer.appendChild(selectBtn);
        uploadContainer.appendChild(uploadProgress);
        fileBlock.appendChild(uploadContainer);
        fileBlock.appendChild(fileInput);
        this.root.appendChild(fileBlock);

        this.root.appendChild(this.createNav({ prev: true, publish: true }));

        this.restoreFormData();

        return this.root;
    }

    // OfferCreateFifthStage.js
    async handleFileUpload(files, uploadedImagesContainer, progressContainer) {
        this.isUploading = true;
        this.updateUploadState(true);

        try {
            progressContainer.style.display = 'block';
            progressContainer.textContent = 'Загрузка изображений...';

            // Валидируем файлы
            const validFiles = files.filter(file => {
                try {
                    MediaService.validateImage(file);
                    return true;
                } catch (error) {
                    console.warn('File validation failed:', error.message);
                    Modal.show({
                        title: 'Ошибка валидации',
                        message: `Файл "${file.name}": ${error.message}`,
                        type: 'error'
                    });
                    return false;
                }
            });

            if (validFiles.length === 0) {
                Modal.show({
                    title: 'Внимание',
                    message: 'Нет валидных файлов для загрузки',
                    type: 'info'
                });
                return;
            }

            // Загружаем файлы
            const uploadResults = await MediaService.uploadMultipleImages(validFiles);

            // Обрабатываем результаты
            uploadResults.forEach(result => {
                if (result && result.filename) {
                    this.images.push({
                        filename: result.filename,
                        url: MediaService.getImageUrl(result.filename)
                    });
                    this.createImagePreview({
                        filename: result.filename,
                        url: MediaService.getImageUrl(result.filename)
                    }, uploadedImagesContainer);
                }
            });

            this.saveFormData();

            if (uploadResults.length > 0) {
                Modal.show({
                    title: 'Успех',
                    message: `Успешно загружено ${uploadResults.length} изображений`,
                    type: 'success'
                });
            }

        } catch (error) {
            console.error('Error uploading images:', error);
            Modal.show({
                title: 'Ошибка загрузки',
                message: error.message || 'Не удалось загрузить изображения. Проверьте подключение к интернету.',
                type: 'error'
            });
        } finally {
            this.isUploading = false;
            this.updateUploadState(false);
            progressContainer.style.display = 'none';
        }
    }

    // OfferCreateFifthStage.js
    createImagePreview(imageData, container) {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'create-ad__uploaded-image';

        const img = document.createElement('img');
        // Используем URL из imageData или генерируем его
        img.src = imageData.url || MediaService.getImageUrl(imageData.filename);
        img.alt = `Загруженное изображение ${imageData.filename}`;
        img.loading = 'lazy';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'create-ad__remove-image';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
            imgWrap.remove();
            this.images = this.images.filter(img => img.filename !== imageData.filename);
            this.saveFormData();
        });

        imgWrap.appendChild(img);
        imgWrap.appendChild(removeBtn);
        container.appendChild(imgWrap);
    }

    updateUploadState(isUploading) {
        const selectBtn = this.root.querySelector('.create-ad__file-select-button');
        if (selectBtn) {
            selectBtn.disabled = isUploading;
            selectBtn.textContent = isUploading ? 'Загрузка...' : 'Выбрать файлы';
        }
    }

    createProgress(titleText, value, ariaNow) {
        const progress = document.createElement('div');
        progress.className = 'create-ad__progress';

        const title = document.createElement('h1');
        title.className = 'create-ad__progress-title';
        title.textContent = this.isEditing ? titleText.replace('создания', 'редактирования') : titleText;

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

    saveFormData() {
        const formData = {
            description: this.root.querySelector('.create-ad__input_textarea[data-field="description"]')?.value || '',
            images: this.images.map(img => ({
                filename: img.filename,
                url: img.url
            }))
        };

        console.log('Saving stage 5 data:', formData);
        this.dataManager.updateStage5(formData);
    }

    restoreFormData() {
        const currentData = this.dataManager.getData();
        console.log('Restoring stage 5 data:', currentData);

        const descInput = this.root.querySelector('.create-ad__input_textarea[data-field="description"]');
        if (descInput && currentData.description) {
            descInput.value = currentData.description;
        }

        if (currentData.images && currentData.images.length > 0) {
            this.images = currentData.images;
            const uploadedImagesContainer = this.root.querySelector('.create-ad__uploaded-images');
            if (uploadedImagesContainer) {
                uploadedImagesContainer.innerHTML = '';
                currentData.images.forEach(image => {
                    this.createImagePreview(image, uploadedImagesContainer);
                });
            }
        }
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
            pub.textContent = this.isEditing ? 'Сохранить изменения' : 'Опубликовать';
            pub.dataset.action = 'publish';
            pub.disabled = this.isUploading;
            group.appendChild(pub);
        }

        nav.appendChild(group);
        return nav;
    }
}