// Summary.ts - полный исправленный код

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

interface SupportTicket {
    id: string;
    user_id?: string;
    signed_email: string;
    response_email: string;
    name: string;
    category: string;
    description: string;
    status: string;
    photo_urls: string[];
    created_at: string;
    updated_at: string;
}

export class Summary {
    private state: AppState;
    private app: App;
    private myOffers: OfferData[];
    private myTickets: SupportTicket[];

    constructor(state: AppState, app: App) {
        this.state = state;
        this.app = app;
        this.myOffers = [];
        this.myTickets = [];
    }

    async render(): Promise<HTMLElement> {
        const content = document.createElement("div");
        content.className = "profile__content";

        const quickAdBlock = this.createQuickAdBlock();
        const myAdsBlock = await this.createMyAdsBlock();
        const supportTicketsBlock = await this.createSupportTicketsBlock();
        const favoritesBlock = this.createFavoritesBlock();

        content.appendChild(quickAdBlock);
        content.appendChild(myAdsBlock);
        content.appendChild(supportTicketsBlock);
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

    private async createSupportTicketsBlock(): Promise<HTMLElement> {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";
        title.textContent = "Мои обращения в поддержку";
        block.appendChild(title);

        try {
            // Получаем обращения без выброса исключения при ошибках
            const response = await ProfileService.getAllSupportTickets(1, 3);
            this.myTickets = response.tickets;

            console.log('Loaded support tickets:', this.myTickets); // Для отладки

            if (this.myTickets.length === 0) {
                const ticketElement = this.createTicketElement(
                    null,
                    "У вас пока нет обращений в поддержку",
                    "Если у вас возникли вопросы или проблемы, создайте обращение в поддержку"
                );
                block.appendChild(ticketElement);
            } else {
                this.myTickets.forEach(ticket => {
                    const ticketElement = this.createTicketElement(ticket);
                    block.appendChild(ticketElement);
                });
            }
        } catch (error) {
            console.error('Unexpected error loading support tickets in summary:', error);
            const ticketElement = this.createTicketElement(
                null,
                "Не удалось загрузить обращения",
                "Попробуйте обновить страницу"
            );
            block.appendChild(ticketElement);
        }

        const link = document.createElement("button");
        link.type = "button";
        link.className = "profile__link";
        link.textContent = "Все мои обращения";

        link.addEventListener("click", () => {
            this.app.router.navigate("/profile/support-tickets");
        });

        block.appendChild(link);

        return block;
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

    private createTicketElement(ticket: SupportTicket | null, titleText?: string, description?: string): HTMLElement {
        const element = document.createElement("div");
        element.className = "profile__ad";

        if (ticket) {
            const info = document.createElement("div");
            info.className = "profile__ad-info";
            info.style.width = "100%";

            const titleRow = document.createElement("div");
            titleRow.style.display = "flex";
            titleRow.style.justifyContent = "space-between";
            titleRow.style.alignItems = "center";
            titleRow.style.marginBottom = "8px";
            titleRow.style.width = "100%";

            const title = document.createElement("h1");
            title.className = "profile__ad-title";
            title.textContent = `#${ticket.id.substring(0, 8)} - ${ticket.name}`;
            title.style.margin = "0";
            title.style.flex = "1";
            title.style.marginRight = "10px";

            const statusBadge = document.createElement("span");
            statusBadge.className = "status-badge";
            statusBadge.textContent = ProfileService.getStatusDisplayName(ticket.status);
            statusBadge.style.backgroundColor = ProfileService.getStatusColor(ticket.status);
            statusBadge.style.color = "white";
            statusBadge.style.padding = "4px 8px";
            statusBadge.style.borderRadius = "12px";
            statusBadge.style.fontSize = "12px";
            statusBadge.style.fontWeight = "bold";
            statusBadge.style.flexShrink = "0";

            titleRow.appendChild(title);
            titleRow.appendChild(statusBadge);

            const category = document.createElement("div");
            category.className = "profile__ad-text";
            category.textContent = `Категория: ${ProfileService.getCategoryDisplayName(ticket.category)}`;
            category.style.marginBottom = "4px";

            const email = document.createElement("div");
            email.className = "profile__ad-text";
            email.textContent = `Email для ответа: ${ticket.response_email}`;
            email.style.marginBottom = "4px";

            const descriptionText = document.createElement("div");
            descriptionText.className = "profile__ad-text";
            descriptionText.textContent = ticket.description.length > 100 
                ? ticket.description.substring(0, 100) + '...' 
                : ticket.description;
            descriptionText.style.marginBottom = "4px";

            const date = document.createElement("div");
            date.className = "profile__ad-text";
            date.textContent = `Создано: ${new Date(ticket.created_at).toLocaleDateString('ru-RU')}`;
            date.style.fontSize = "12px";
            date.style.color = "#666";

            info.appendChild(titleRow);
            info.appendChild(category);
            info.appendChild(email);
            info.appendChild(descriptionText);
            info.appendChild(date);

            element.appendChild(info);

            element.addEventListener('click', () => {
                this.app.router.navigate(`/support-tickets/${ticket.id}`);
            });

            element.style.cursor = "pointer";
            element.style.transition = "background-color 0.2s";
            
            element.addEventListener('mouseenter', () => {
                element.style.backgroundColor = "#f5f5f5";
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.backgroundColor = "";
            });
        } else {
            // Placeholder for empty state
            const info = document.createElement("div");
            info.className = "profile__ad-info";

            const title = document.createElement("h1");
            title.className = "profile__ad-title";
            title.textContent = titleText || '';

            const text = document.createElement("span");
            text.className = "profile__ad-text";
            text.textContent = description || '';

            info.appendChild(title);
            info.appendChild(text);

            element.appendChild(info);
        }

        return element;
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
        // Cleanup logic if needed
    }
}