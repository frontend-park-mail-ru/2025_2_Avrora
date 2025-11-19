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

    constructor({ controller, dataManager, isEditing = false, editOfferId = null }: StageOptions = {}) {
        this.controller = controller;
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

            // Валидация файлов перед загрузкой
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
                validFiles.push(file);
            });

            // Показываем ошибки для невалидных файлов
            if (invalidFiles.length > 0) {
                Modal.show({
                    title: 'Некорректные файлы',
                    message: `Следующие файлы не были загружены:\n${invalidFiles.join('\n')}`,
                    type: 'error'
                });
            }

            if (validFiles.length === 0) {
                return;
            }

            // Проверяем лимит изображений
            const currentTotalImages = this.images.length + validFiles.length;
            if (currentTotalImages > 10) {
                Modal.show({
                    title: 'Превышен лимит',
                    message: `Можно загрузить не более 10 изображений. У вас уже ${this.images.length} изображений.`,
                    type: 'error'
                });
                return;
            }

            // Загружаем файлы последовательно
            const uploadResults: ImageData[] = [];
            
            for (let i = 0; i < validFiles.length; i++) {
                const file = validFiles[i];
                
                try {
                    progressContainer.textContent = `Загрузка ${i + 1} из ${validFiles.length}: ${file.name}`;
                    
                    const result = await MediaService.uploadImage(file);
                    if (result && result.filename) {
                        const imageData: ImageData = {
                            filename: result.filename,
                            url: MediaService.getImageUrl(result.filename)
                        };
                        uploadResults.push(imageData);
                        
                        // Сразу создаем превью для успешно загруженного изображения
                        this.createImagePreview(imageData, uploadedImagesContainer);
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

            // Добавляем успешно загруженные изображения в общий массив
            this.images.push(...uploadResults);
            this.saveFormData();
            this.updateImageCounter(counterContainer);

            // Показываем результат загрузки
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
            console.error('Error uploading images:', error);
            Modal.show({
                title: 'Ошибка загрузки',
                message: 'Не удалось загрузить изображения. Проверьте подключение к интернету.',
                type: 'error'
            });
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
            
            // Обновляем счетчик
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
        
        // Обновляем состояние кнопки публикации на основе количества изображений
        const publishBtn = this.root!.querySelector('[data-action="publish"]') as HTMLButtonElement;
        if (publishBtn && !this.isUploading) {
            publishBtn.disabled = this.images.length === 0;
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
            images: [...this.images] // Создаем копию массива
        };

        console.log('Saving form data with images:', formData.images);

        // Сохраняем данные используя существующие методы dataManager
        if (this.dataManager.updateStage5) {
            this.dataManager.updateStage5(formData);
        } else if (this.dataManager.updateData) {
            this.dataManager.updateData(5, formData);
        } else if (this.dataManager.setData) {
            const currentData = this.dataManager.getData();
            const updatedData = { ...currentData, ...formData };
            this.dataManager.setData(updatedData);
        } else {
            // Если методы не существуют, сохраняем напрямую
            const currentData = this.dataManager.getData();
            const updatedData = { ...currentData, ...formData };
            this.dataManager.data = updatedData;
        }

        console.log('Data after save:', this.dataManager.getData());
    }

    restoreFormData(): void {
        const currentData = this.dataManager.getData();
        console.log('Restoring data from dataManager:', currentData);

        const descInput = this.root!.querySelector('.create-ad__input_textarea[data-field="description"]') as HTMLTextAreaElement;
        if (descInput && currentData.description) {
            descInput.value = currentData.description;
        }

        // Восстанавливаем изображения
        if (currentData.images && Array.isArray(currentData.images)) {
            this.images = currentData.images.map((img: any) => ({
                filename: img.filename,
                url: img.url || MediaService.getImageUrl(img.filename)
            }));

            const uploadedImagesContainer = this.root!.querySelector('.create-ad__uploaded-images') as HTMLElement;
            if (uploadedImagesContainer) {
                uploadedImagesContainer.innerHTML = '';
                this.images.forEach(image => {
                    this.createImagePreview(image, uploadedImagesContainer);
                });
            }
        }

        console.log('Restored images count:', this.images.length);
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
            pub.disabled = this.isUploading || this.images.length === 0;
            group.appendChild(pub);
        }

        nav.appendChild(group);
        return nav;
    }
}