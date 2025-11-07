import { ProfileService } from '../../../utils/ProfileService.ts';
import { MediaService } from '../../../utils/MediaService.ts';


interface AppState {
    [key: string]: any;
    user?: User;
}

interface App {
    state: AppState;
    router: {
        navigate: (path: string) => void;
    };
    isProfileComplete: () => boolean;
    showProfileCompletionModal: () => void;
}

interface User {
    id?: string;
    email?: string;
    avatar?: string;
    photo_url?: string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    name?: string;
    AvatarURL?: string;
}

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
    private state: AppState;
    private app: App;
    private myOffers: OfferData[];

    constructor(state: AppState, app: App) {
        this.state = state;
        this.app = app;
        this.myOffers = [];
    }

    async render(): Promise<HTMLElement> {
        const content = document.createElement("div");
        content.className = "profile__content";

        const quickAdBlock = this.createQuickAdBlock();
        const myAdsBlock = await this.createMyAdsBlock();
        const favoritesBlock = this.createFavoritesBlock();

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
            if (this.state.user) {
                if (this.app.isProfileComplete()) {
                    this.app.router.navigate("/create-ad");
                } else {
                    this.app.showProfileCompletionModal();
                }
            } else {
                this.app.router.navigate("/login");
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
        title.textContent = "Мои объявления";
        block.appendChild(title);

        try {
            this.myOffers = await ProfileService.getMyOffers();

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
            console.error('Error loading my offers in summary:', error);
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
            this.app.router.navigate("/profile/myoffers");
        });

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
            this.app.router.navigate(`/offers/${offerData.id}`);
        });

        return ad;
    }

    private createFavoritesBlock(): HTMLElement {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";
        title.textContent = "Избранное";

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
            'garage': 'гараж',
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