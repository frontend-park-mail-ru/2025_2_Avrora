import { MediaService } from '../../../utils/MediaService.ts';
import { Modal } from '../../../components/OfferCreate/Modal/Modal.ts';

interface StageOptions {
    state: any;
    app: any;
    dataManager: any;
    isEditing?: boolean;
    editOfferId?: string | null;
}

interface ImageData {
    filename: string;
    url: string;
    url: string;
}

export class OfferCreateFifthStage {
    state: any;
    app: any;
    dataManager: any;
    isEditing: boolean;
    editOfferId: string | null;
    root: HTMLElement | null;
    images: ImageData[];
    isUploading: boolean;

    constructor({ state, app, dataManager, isEditing = false, editOfferId = null }: StageOptions = {}) {
        this.state = state;
        this.app = app;
        this.dataManager = dataManager;
        this.isEditing = isEditing;
        this.editOfferId = editOfferId;
        this.root = null;
        this.images = [];
        this.isUploading = false;
    }

    render(): HTMLElement {
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

        fileInput.addEventListener('change', async (e: Event) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
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

    async handleFileUpload(files: File[], uploadedImagesContainer: HTMLElement, progressContainer: HTMLElement): Promise<void> {
        this.isUploading = true;
        this.updateUploadState(true);

        try {
            progressContainer.style.display = 'block';
            progressContainer.textContent = 'Загрузка изображений...';

            const validFiles = files.filter(file => {
                try {
                    MediaService.validateImage(file);
                    return true;
                } catch (error) {
                    console.warn('File validation failed:', (error as Error).message);
                    Modal.show({
                        title: 'Ошибка валидации',
                        message: `Файл "${file.name}": ${(error as Error).message}`,
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

            const currentTotalImages = this.images.length + validFiles.length;
            if (currentTotalImages > 10) {
                Modal.show({
                    title: 'Превышен лимит',
                    message: `Можно загрузить не более 10 изображений. У вас уже ${this.images.length} изображений.`,
                    type: 'error'
                });
                return;
            }

            const uploadResults: any[] = [];
            for (const file of validFiles) {
                try {
                    const result = await MediaService.uploadImage(file);
                    if (result) {
                        uploadResults.push(result);
                        progressContainer.textContent = `Загружено ${uploadResults.length} из ${validFiles.length}`;
                    }
                } catch (error) {
                    console.error(`Failed to upload ${file.name}:`, error);
                    Modal.show({
                        title: 'Ошибка загрузки',
                        message: `Не удалось загрузить файл "${file.name}"`,
                        type: 'error'
                    });
                }
            }

            uploadResults.forEach(result => {
                if (result && result.filename) {
                    const imageData: ImageData = {
                        filename: result.filename,
                        url: MediaService.getImageUrl(result.filename)
                    };
                    this.images.push(imageData);
                    this.createImagePreview(imageData, uploadedImagesContainer);
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
                message: (error as Error).message || 'Не удалось загрузить изображения. Проверьте подключение к интернету.',
                type: 'error'
            });
        } finally {
            this.isUploading = false;
            this.updateUploadState(false);
            progressContainer.style.display = 'none';
        }
    }

    validateImages(): { isValid: boolean; message?: string } {
        if (this.images.length === 0) {
            return {
                isValid: false,
                message: 'Необходимо загрузить минимум одну фотографию'
            };
        }

        if (this.images.length > 10) {
            return {
                isValid: false,
                message: 'Можно загрузить не более 10 фотографий'
            };
        }

        return { isValid: true };
    }

    createImagePreview(imageData: ImageData, container: HTMLElement): void {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'create-ad__uploaded-image';

        const img = document.createElement('img');
        img.src = MediaService.getImageUrl(imageData.filename);
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

    updateUploadState(isUploading: boolean): void {
        const selectBtn = this.root!.querySelector('.create-ad__file-select-button') as HTMLButtonElement;
        if (selectBtn) {
            selectBtn.disabled = isUploading;
            selectBtn.textContent = isUploading ? 'Загрузка...' : 'Выбрать файлы';
        }
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
            images: this.images.map(img => ({
                filename: img.filename,
                url: MediaService.getImageUrl(img.filename)
            }))
        };

        this.dataManager.updateStage5(formData);
    }

    restoreFormData(): void {
        const currentData = this.dataManager.getData();

        const descInput = this.root!.querySelector('.create-ad__input_textarea[data-field="description"]') as HTMLTextAreaElement;
        if (descInput && currentData.description) {
            descInput.value = currentData.description;
        }

        if (currentData.images && currentData.images.length > 0) {
            this.images = currentData.images.map((img: ImageData) => ({
                filename: img.filename,
                url: MediaService.getImageUrl(img.filename)
            }));

            const uploadedImagesContainer = this.root!.querySelector('.create-ad__uploaded-images') as HTMLElement;
            if (uploadedImagesContainer) {
                uploadedImagesContainer.innerHTML = '';
                this.images.forEach(image => {
                    this.createImagePreview(image, uploadedImagesContainer);
                });
            }
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