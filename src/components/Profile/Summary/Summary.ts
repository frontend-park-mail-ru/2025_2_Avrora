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

    constructor(controller: any) {
        this.controller = controller;
        this.myOffers = [];
        this.favoriteOffers = [];
    }

    async render(): Promise<HTMLElement> {
        const content = document.createElement("div");
        content.className = "profile__content";

        const quickAdBlock = this.createQuickAdBlock();
        const myAdsBlock = await this.createMyAdsBlock();
        const favoritesBlock = await this.createFavoritesBlock();

        content.appendChild(quickAdBlock);
        content.appendChild(myAdsBlock);
        content.appendChild(favoritesBlock);

        return content;
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

        try {
            this.myOffers = await ProfileService.getMyOffers();
            title.textContent = `Мои объявления (${this.myOffers.length})`;
            block.appendChild(title);

            if (this.myOffers.length === 0) {
                const ad = this.createAd(
                    null,
                    "У вас пока нет объявлений",
                    "Создайте первое объявление, чтобы оно появилось здесь"
                );
                block.appendChild(ad);
            } else {
                const recentOffers = this.myOffers.slice(0, 3);
                recentOffers.forEach(offer => {
                    const ad = this.createOfferAd(offer);
                    block.appendChild(ad);
                });
            }
        } catch (error) {
            title.textContent = "Мои объявления";
            block.appendChild(title);

            const ad = this.createAd(
                null,
                "Не удалось загрузить объявления",
                "Попробуйте обновить страницу"
            );
            block.appendChild(ad);
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

    private async createFavoritesBlock(): Promise<HTMLElement> {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";

        try {
            this.favoriteOffers = [];
            title.textContent = `Избранное (${this.favoriteOffers.length})`;
        } catch (error) {
            title.textContent = "Избранное";
        }

        const favorite = this.createAd(
            null,
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

        let imageUrl = offerData.image_url || offerData.images?.[0];
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = MediaService.getImageUrl(imageUrl);
        } else if (!imageUrl) {
            imageUrl = MediaService.getImageUrl('default_offer.jpg');
        }

        const img = document.createElement("img");
        img.className = "profile__ad-image";
        img.src = imageUrl;
        img.alt = "Объявление";
        img.loading = "lazy";

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

    private createAd(imgSrc: string | null, titleText: string, description: string): HTMLElement {
        const ad = document.createElement("div");
        ad.className = "profile__ad";

        if (imgSrc) {
            const img = document.createElement("img");
            img.className = "profile__ad-image";
            img.src = imgSrc;
            img.alt = "Объявление";
            ad.appendChild(img);
        }

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

    }
}