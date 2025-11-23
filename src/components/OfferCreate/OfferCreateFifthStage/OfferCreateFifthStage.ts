// OfferCreateFifthStage.ts
import { MediaService } from '../../../utils/MediaService.ts';
import { Modal } from '../../../components/OfferCreate/Modal/Modal.ts';

interface StageOptions {
    controller: any;
    dataManager: any;
    isEditing?: boolean;
    editOfferId?: string | null;
}

interface ImageData {
    filename: string;
    url: string;
}

export class OfferCreateFifthStage {
    controller: any;
    dataManager: any;
    isEditing: boolean;
    editOfferId: string | null;
    root: HTMLElement | null;
    images: ImageData[];
    isUploading: boolean;
    private errorContainer: HTMLElement | null;

    constructor({ controller, dataManager, isEditing = false, editOfferId = null }: StageOptions = {}) {
        this.controller = controller;
        this.dataManager = dataManager;
        this.isEditing = isEditing;
        this.editOfferId = editOfferId;
        this.root = null;
        this.images = [];
        this.isUploading = false;
        this.errorContainer = null;
    }

    render(): HTMLElement {
        this.root = document.createElement('div');
        this.root.className = 'create-ad';

        this.root.appendChild(this.createProgress('5 этап. Фотографии и описание', 100, 100));

        this.errorContainer = document.createElement('div');
        this.errorContainer.className = 'create-ad__error-container';
        this.errorContainer.style.display = 'none';
        this.root.appendChild(this.errorContainer);

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

        const imageCounter = document.createElement('div');
        imageCounter.className = 'create-ad__image-counter';
        imageCounter.textContent = `Загружено изображений: ${this.images.length}/10`;

        const uploadInfo = document.createElement('div');
        uploadInfo.className = 'create-ad__upload-info';
        uploadInfo.textContent = 'Максимум 10 изображений, каждое до 10MB';

        selectBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (e: Event) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
            if (files.length === 0) return;

            await this.handleFileUpload(files, uploadedImages, uploadProgress, imageCounter);
            fileInput.value = '';
        });

        uploadContainer.appendChild(uploadedImages);
        uploadContainer.appendChild(selectBtn);
        uploadContainer.appendChild(uploadProgress);
        uploadContainer.appendChild(imageCounter);
        uploadContainer.appendChild(uploadInfo);
        fileBlock.appendChild(uploadContainer);
        fileBlock.appendChild(fileInput);
        this.root.appendChild(fileBlock);

        this.root.appendChild(this.createNav({ prev: true, publish: true }));

        this.restoreFormData();
        this.updateImageCounter(imageCounter);

        return this.root;
    }

    async handleFileUpload(files: File[], uploadedImagesContainer: HTMLElement, progressContainer: HTMLElement, counterContainer: HTMLElement): Promise<void> {
        if (this.isUploading) {
            Modal.show({
                title: 'Внимание',
                message: 'Дождитесь завершения текущей загрузки',
                type: 'warning'
            });
            return;
        }

        this.isUploading = true;
        this.updateUploadState(true);

        try {
            progressContainer.style.display = 'block';
            progressContainer.textContent = 'Подготовка к загрузке...';

            const validFiles: File[] = [];
            const invalidFiles: string[] = [];

            files.forEach(file => {
                if (!file.type.startsWith('image/')) {
                    invalidFiles.push(`"${file.name}" - не изображение`);
                    return;
                }

                if (file.size > 10 * 1024 * 1024) {
                    invalidFiles.push(`"${file.name}" - слишком большой (максимум 10MB)`);
                    return;
                }

                const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
                const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
                if (!validExtensions.includes(fileExtension || '')) {
                    invalidFiles.push(`"${file.name}" - недопустимое расширение (разрешены: JPG, JPEG, PNG, GIF, WebP)`);
                    return;
                }

                validFiles.push(file);
            });

            if (invalidFiles.length > 0) {
                this.showError(`Некорректные файлы:\n${invalidFiles.join('\n')}`);
            }

            if (validFiles.length === 0) {
                return;
            }

            const currentTotalImages = this.images.length + validFiles.length;
            if (currentTotalImages > 10) {
                this.showError(`Можно загрузить не более 10 изображений. У вас уже ${this.images.length} изображений.`);
                return;
            }

            const uploadResults: ImageData[] = [];

            for (let i = 0; i < validFiles.length; i++) {
                const file = validFiles[i];

                try {
                    progressContainer.textContent = `Загрузка ${i + 1} из ${validFiles.length}: ${file.name}`;

                    MediaService.validateImage(file);

                    const result = await MediaService.uploadImage(file);
                    if (result && result.filename) {
                        const imageData: ImageData = {
                            filename: result.filename,
                            url: MediaService.getImageUrl(result.filename)
                        };
                        uploadResults.push(imageData);

                        this.createImagePreview(imageData, uploadedImagesContainer);
                    }
                } catch (error) {
                    this.showError(`Не удалось загрузить файл "${file.name}": ${(error as Error).message}`);
                }
            }

            this.images.push(...uploadResults);
            this.saveFormData();
            this.updateImageCounter(counterContainer);
            this.clearError();

            if (uploadResults.length > 0) {
                const successMessage = uploadResults.length === validFiles.length
                    ? `Успешно загружено ${uploadResults.length} изображений`
                    : `Успешно загружено ${uploadResults.length} из ${validFiles.length} изображений`;

                Modal.show({
                    title: 'Загрузка завершена',
                    message: successMessage,
                    type: 'success'
                });
            }

        } catch (error) {
            this.showError(`Не удалось загрузить изображения: ${(error as Error).message}`);
        } finally {
            this.isUploading = false;
            this.updateUploadState(false);
            progressContainer.style.display = 'none';
        }
    }

    createImagePreview(imageData: ImageData, container: HTMLElement): void {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'create-ad__uploaded-image';

        const img = document.createElement('img');
        img.src = imageData.url;
        img.alt = 'Загруженное изображение';
        img.loading = 'lazy';

        img.onerror = () => {
            img.src = '../../images/default_offer.jpg';
        };

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'create-ad__remove-image';
        removeBtn.textContent = '×';
        removeBtn.title = 'Удалить изображение';
        removeBtn.addEventListener('click', () => {
            if (this.isUploading) {
                Modal.show({
                    title: 'Внимание',
                    message: 'Дождитесь завершения загрузки перед удалением изображений',
                    type: 'warning'
                });
                return;
            }

            imgWrap.remove();
            this.images = this.images.filter(img => img.filename !== imageData.filename);
            this.saveFormData();
            this.clearError();

            const counter = this.root!.querySelector('.create-ad__image-counter') as HTMLElement;
            if (counter) {
                this.updateImageCounter(counter);
            }
        });

        imgWrap.appendChild(img);
        imgWrap.appendChild(removeBtn);
        container.appendChild(imgWrap);
    }

    updateUploadState(isUploading: boolean): void {
        const selectBtn = this.root!.querySelector('.create-ad__file-select-button') as HTMLButtonElement;
        const publishBtn = this.root!.querySelector('[data-action="publish"]') as HTMLButtonElement;

        if (selectBtn) {
            selectBtn.disabled = isUploading;
            selectBtn.textContent = isUploading ? 'Загрузка...' : 'Выбрать файлы';
        }

        if (publishBtn) {
            publishBtn.disabled = isUploading;
        }
    }

    updateImageCounter(counterContainer: HTMLElement): void {
        counterContainer.textContent = `Загружено изображений: ${this.images.length}/10`;
    }

    createProgress(titleText: string, value: number, ariaNow: number): HTMLElement {
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

    saveFormData(): void {
        const formData: any = {
            description: (this.root!.querySelector('.create-ad__input_textarea[data-field="description"]') as HTMLTextAreaElement)?.value || '',
            images: [...this.images]
        };

        // ВАЖНО: убираем блокировку сохранения при невалидных данных
        // Данные должны сохраняться всегда, а валидация происходить при навигации
        this.dataManager.updateStage5(formData);
    }

    validateFormData(): { isValid: boolean; message?: string } {
        const currentData = this.dataManager.getData();

        // Проверка изображений
        if (!currentData.images || !Array.isArray(currentData.images)) {
            return { isValid: false, message: 'Ошибка данных изображений' };
        }

        const validImages = currentData.images.filter((img: any) =>
            img &&
            typeof img === 'object' &&
            img.filename &&
            typeof img.filename === 'string' &&
            img.filename.trim() !== ''
        );

        if (validImages.length === 0) {
            return { isValid: false, message: 'Необходимо загрузить минимум одну фотографию' };
        }

        if (validImages.length > 10) {
            return { isValid: false, message: 'Можно загрузить не более 10 фотографий' };
        }

        // Проверка описания
        if (!currentData.description || currentData.description.trim() === '') {
            return { isValid: false, message: 'Введите описание объявления' };
        }

        if (currentData.description.length < 10) {
            return { isValid: false, message: 'Описание должно содержать минимум 10 символов' };
        }

        if (currentData.description.length > 2000) {
            return { isValid: false, message: 'Описание не должно превышать 2000 символов' };
        }

        return { isValid: true };
    }

    restoreFormData(): void {
        const currentData = this.dataManager.getData();

        const descInput = this.root!.querySelector('.create-ad__input_textarea[data-field="description"]') as HTMLTextAreaElement;
        if (descInput && currentData.description) {
            descInput.value = currentData.description;
        }

        if (currentData.images && Array.isArray(currentData.images)) {
            this.images = currentData.images.map((img: any) => {
                const normalizedImg = {
                    filename: img.filename || img.url?.split('/').pop() || '',
                    url: img.url || MediaService.getImageUrl(img.filename)
                };

                if (!normalizedImg.filename) {
                    return null;
                }

                return normalizedImg;
            }).filter((img: ImageData | null): img is ImageData => img !== null);

            const uploadedImagesContainer = this.root!.querySelector('.create-ad__uploaded-images') as HTMLElement;
            if (uploadedImagesContainer) {
                uploadedImagesContainer.innerHTML = '';
                this.images.forEach(image => {
                    this.createImagePreview(image, uploadedImagesContainer);
                });
            }
        }
    }

    showError(message: string): void {
        if (!this.errorContainer) return;

        this.errorContainer.innerHTML = '';
        this.errorContainer.style.display = 'block';

        const errorElement = document.createElement('div');
        errorElement.className = 'create-ad__error-message';
        errorElement.textContent = message;

        this.errorContainer.appendChild(errorElement);

        this.errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    clearError(): void {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
            this.errorContainer.innerHTML = '';
        }
    }

    createNav({ prev = false, publish = false }: { prev?: boolean; publish?: boolean } = {}): HTMLElement {
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