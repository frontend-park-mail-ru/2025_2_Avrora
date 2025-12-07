import { ProfileService } from '../../../utils/ProfileService.ts';
import { MediaService } from '../../../utils/MediaService.ts';

interface OfferData {
    id: string;
    offer_type: string;
    property_type: string;
    rooms: number;
    price: number;
    address: string;
    images: string[];
    image_url: string;
    status: string;
    description: string;
    area: number;
}

export class Summary {
    private controller: any;
    private myOffers: OfferData[];
    private favoriteOffers: OfferData[];
    private contentElement: HTMLElement | null;
    private isRendering: boolean;

    constructor(controller: any) {
        this.controller = controller;
        this.myOffers = [];
        this.favoriteOffers = [];
        this.contentElement = null;
        this.isRendering = false;
    }

    async render(): Promise<HTMLElement> {
        if (this.isRendering) {
            return this.contentElement || document.createElement("div");
        }
        
        this.isRendering = true;

        if (this.contentElement) {
            this.contentElement.innerHTML = '';
        } else {
            this.contentElement = document.createElement("div");
            this.contentElement.className = "profile__content";
        }

        try {
            await this.loadData();
            
            const quickAdBlock = this.createQuickAdBlock();
            const myAdsBlock = await this.createMyAdsBlock();
            const favoritesBlock = this.createFavoritesBlock();

            this.contentElement.appendChild(quickAdBlock);
            this.contentElement.appendChild(myAdsBlock);
            this.contentElement.appendChild(favoritesBlock);
            
        } catch (error) {
            this.contentElement.innerHTML = `
                <div class="profile__error">
                    <p>Не удалось загрузить данные сводки</p>
                    <button class="profile__retry-button">Попробовать снова</button>
                </div>
            `;
            
            const retryBtn = this.contentElement.querySelector('.profile__retry-button');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => this.render());
            }
        }
        
        this.isRendering = false;
        return this.contentElement;
    }

    async updateData(): Promise<void> {
        if (!this.contentElement || this.isRendering) {
            return;
        }

        this.isRendering = true;
        
        try {
            await this.loadData();

            this.contentElement.innerHTML = '';

            const quickAdBlock = this.createQuickAdBlock();
            const myAdsBlock = await this.createMyAdsBlock();
            const favoritesBlock = this.createFavoritesBlock();

            this.contentElement.appendChild(quickAdBlock);
            this.contentElement.appendChild(myAdsBlock);
            this.contentElement.appendChild(favoritesBlock);
            
        } catch (error) {

        } finally {
            this.isRendering = false;
        }
    }

    private async loadData(): Promise<void> {
        try {
            this.myOffers = await ProfileService.getMyOffers();
        } catch (error) {
            this.myOffers = [];
        }

        this.favoriteOffers = [];
    }

    private createQuickAdBlock(): HTMLElement {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";
        title.textContent = "Добавление объявления в 1 клик";

        const text = document.createElement("span");
        text.className = "profile__text";
        text.textContent = "Воспользуйтесь функцией «Добавление в один клик», чтобы быстро и без лишних хлопот разместить своё объявление";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "profile__action-button";
        button.textContent = "Добавить объявление";

        button.addEventListener("click", () => {
            if (this.controller.user) {
                if (this.controller.isProfileComplete()) {
                    this.controller.navigate("/create-ad");
                } else {
                    this.controller.showProfileCompletionModal();
                }
            } else {
                this.controller.navigate("/login");
            }
        });

        block.appendChild(title);
        block.appendChild(text);
        block.appendChild(button);

        return block;
    }

    private async createMyAdsBlock(): Promise<HTMLElement> {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";
        title.textContent = `Мои объявления (${this.myOffers.length})`;

        block.appendChild(title);

        if (this.myOffers.length === 0) {
            const ad = this.createAd(
                MediaService.getAvatarUrl("default_offer.jpg"),
                "У вас пока нет объявлений",
                "Создайте первое объявление, чтобы оно появилось здесь"
            );
            block.appendChild(ad);
        } else {
            const recentOffers = this.myOffers.slice(0, 3);
            for (const offer of recentOffers) {
                try {
                    const ad = this.createOfferAd(offer);
                    block.appendChild(ad);
                } catch (error) {
                }
            }
        }

        const link = document.createElement("button");
        link.type = "button";
        link.className = "profile__link";
        link.textContent = "Все мои объявления";

        link.addEventListener("click", () => {
            this.controller.navigate("/profile/myoffers");
        });

        block.appendChild(link);

        return block;
    }

    private createFavoritesBlock(): HTMLElement {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";
        title.textContent = `Избранное (${this.favoriteOffers.length})`;

        const favorite = this.createAd(
            MediaService.getAvatarUrl("default_offer.jpg"),
            "В избранном пока пусто",
            "Добавляйте объявления в избранное, чтобы они появились здесь"
        );

        const link = document.createElement("button");
        link.type = "button";
        link.className = "profile__link";
        link.textContent = "Все избранные объявления";

        block.appendChild(title);
        block.appendChild(favorite);
        block.appendChild(link);

        return block;
    }

    private createOfferAd(offerData: OfferData): HTMLElement {
        const ad = document.createElement("div");
        ad.className = "profile__ad";
        ad.dataset.offerId = offerData.id;

        const img = document.createElement("img");
        img.className = "profile__ad-image";

        let imageUrl = offerData.image_url || offerData.images?.[0];
        if (imageUrl) {
            img.src = MediaService.getOfferImageUrl(imageUrl);
        } else {
            img.src = MediaService.getAvatarUrl("default_offer.jpg");
        }
        
        img.alt = "Объявление";
        img.loading = "lazy";
        img.onerror = () => {
            img.src = MediaService.getAvatarUrl("default_offer.jpg");
        };

        const info = document.createElement("div");
        info.className = "profile__ad-info";

        const title = document.createElement("h1");
        title.className = "profile__ad-title";

        const typeText = offerData.offer_type === 'sale' ? 'Продажа' : 'Аренда';
        const propertyText = this.getPropertyTypeText(offerData.property_type);
        const price = this.formatPrice(offerData.price);

        title.textContent = `${typeText} ${offerData.rooms}-комн. ${propertyText}, ${price}`;

        const text = document.createElement("span");
        text.className = "profile__ad-text";
        text.textContent = offerData.address || 'Адрес не указан';

        info.appendChild(title);
        info.appendChild(text);

        ad.appendChild(img);
        ad.appendChild(info);

        ad.addEventListener('click', () => {
            this.controller.navigate(`/offers/${offerData.id}`);
        });

        return ad;
    }

    private createAd(imgSrc: string, titleText: string, description: string): HTMLElement {
        const ad = document.createElement("div");
        ad.className = "profile__ad";

        const img = document.createElement("img");
        img.className = "profile__ad-image";
        img.src = imgSrc;
        img.alt = "Объявление";
        img.onerror = () => {
            img.src = MediaService.getAvatarUrl("default_offer.jpg");
        };

        const info = document.createElement("div");
        info.className = "profile__ad-info";

        const title = document.createElement("h1");
        title.className = "profile__ad-title";
        title.textContent = titleText;

        const text = document.createElement("span");
        text.className = "profile__ad-text";
        text.textContent = description;

        info.appendChild(title);
        info.appendChild(text);

        ad.appendChild(img);
        ad.appendChild(info);

        return ad;
    }

    private getPropertyTypeText(propertyType: string): string {
        const types: { [key: string]: string } = {
            'flat': 'кв.',
            'house': 'дом',
            'apartment': 'апартаменты',
            'studio': 'студия'
        };
        return types[propertyType] || 'недвижимость';
    }

    private formatPrice(price: number): string {
        if (!price || price === 0) return 'цена не указана';
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }

    cleanup(): void {
        if (this.contentElement) {
            this.contentElement.innerHTML = '';
        }
        this.contentElement = null;
    }
}