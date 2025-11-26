// OfferWidget.ts - обновленный файл
import { OfferCard } from "../components/Offer/OfferCard/OfferCard.ts";
import { YandexMapService } from "../utils/YandexMapService.ts";
import { PriceHistoryChartService } from "../utils/PriceHistoryChartService.ts";
import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";

export class OfferWidget {
    private parent: HTMLElement;
    private controller: any;
    private offerId: number | null;
    private eventListeners: Array<{element: HTMLElement, event: string, handler: EventListenerOrEventListenerObject}>;
    private isLoading: boolean;
    private offerCard: OfferCard | null;
    private rootEl: HTMLElement | null;

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.offerId = null;
        this.eventListeners = [];
        this.isLoading = false;
        this.offerCard = null;
        this.rootEl = null;
    }

    async renderWithParams(params: any = {}): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            this.offerId = params.id || null;
            const offerData = await this.loadOffer();
            await this.renderContent(offerData);
        } catch (error) {
            this.renderError("Не удалось загрузить объявление");
        } finally {
            this.isLoading = false;
        }
    }

    async loadOffer(): Promise<any> {
        if (!this.offerId) {
            const offersResult = await this.controller.loadOffers({ limit: 1 });
            if (offersResult.ok && offersResult.data.offers && offersResult.data.offers.length > 0) {
                this.offerId = offersResult.data.offers[0].id || offersResult.data.offers[0].ID;
            } else {
                throw new Error("No offers available");
            }
        }

        const result = await this.controller.loadOffer(this.offerId);
        if (result.ok && result.data) {
            const sellerData = await this.controller.loadSellerData(result.data.user_id || result.data.UserID);
            const formattedOffer = this.formatOffer(result.data, sellerData);
            return formattedOffer;
        }
        throw new Error(result.error || "Ошибка загрузки объявления");
    }

    formatOffer(apiData: any, sellerData: any): any {
        const offerId = apiData.id || apiData.ID;
        const userId = apiData.user_id || apiData.UserID;
        const price = apiData.price || apiData.Price;
        const area = apiData.area || apiData.Area;
        const rooms = apiData.rooms || apiData.Rooms;
        const floor = apiData.floor || apiData.Floor;
        const totalFloors = apiData.total_floors || apiData.TotalFloors;
        const address = apiData.address || apiData.Address;
        const offerType = apiData.offer_type || apiData.OfferType;
        const propertyType = apiData.property_type || apiData.PropertyType;
        const livingArea = apiData.living_area || apiData.LivingArea;
        const kitchenArea = apiData.kitchen_area || apiData.KitchenArea;
        const description = apiData.description || apiData.Description;
        const title = apiData.title || apiData.Title;

        const housingComplexId = apiData.housing_complex_id || apiData.HousingComplexID || apiData.housing_complex || null;
        const housingComplexName = apiData.housing_complex_name || apiData.HousingComplexName || apiData.complex_name || null;

        const images = this.controller.getOfferImages(apiData);
        const sellerInfo = this.controller.getSellerInfo(sellerData);

        return {
            id: offerId,
            title: title,
            infoDesc: this.generateInfoDesc(offerType, propertyType),
            metro: this.extractMetroFromAddress(address),
            address: address,
            price: this.formatPrice(price),
            userName: sellerInfo.name,
            userPhone: sellerInfo.phone,
            userAvatar: sellerInfo.avatar,
            description: description,
            images: images,
            characteristics: this.getCharacteristics({
                livingArea: livingArea,
                kitchenArea: kitchenArea,
                propertyType: propertyType,
                floor: floor,
                totalFloors: totalFloors,
                rooms: rooms,
                housingComplexId: housingComplexId,
                housingComplexName: housingComplexName
            }),
            offerType: offerType,
            deposit: apiData.deposit || apiData.Deposit || 0,
            commission: apiData.commission || apiData.Commission || 0,
            rentalPeriod: this.formatRentalPeriod(apiData.rental_period || apiData.RentalPeriod),
            userId: userId,
            housingComplexId: housingComplexId,
            housingComplexName: housingComplexName,
            showOwnerActions: this.controller.isOfferOwner(apiData),
            showContactBtn: !this.controller.isOfferOwner(apiData),
            showPhone: this.controller.isOfferOwner(apiData),
            likesCount: apiData.likes_count || apiData.likesCount || 0, // Добавляем получение счетчика
            isLiked: apiData.is_liked || apiData.isLiked || false,
        };
    }

    generateInfoDesc(offerType: string, propertyType: string): string {
        const type = offerType === 'sale' ? 'Продажа' : 'Аренда';
        const property = this.getPropertyTypeText(propertyType);
        return `${type} ${property}`;
    }

    getPropertyTypeText(propertyType: string): string {
        const types: {[key: string]: string} = {
            'apartment': 'квартиры',
            'house': 'дома',
            'flat': 'квартиры'
        };
        return types[propertyType] || 'недвижимости';
    }

    extractMetroFromAddress(address: string): string {
        if (address.includes('Москва') || address.includes('Moscow')) {
            return "Ближайшее метро";
        }
        return "Метро не указано";
    }

    formatPrice(price: number): string {
        if (!price) return "Цена не указана";
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0
        }).format(price);
    }

    formatRentalPeriod(period: string): string {
        if (!period) return "";
        const periodMap: {[key: string]: string} = {
            'monthly': 'ежемесячно',
            'yearly': 'ежегодно',
            'daily': 'ежедневно',
            'weekly': 'еженедельно'
        };
        return periodMap[period] || period;
    }

    getCharacteristics(apiData: any): any[] {
        const characteristics = [
            {
                title: 'Жилая площадь',
                value: `${apiData.livingArea || '—'} м²`,
                icon: 'living'
            },
            {
                title: 'Площадь кухни',
                value: `${apiData.kitchenArea || '—'} м²`,
                icon: 'kitchen'
            },
            {
                title: 'Этаж',
                value: `${apiData.floor || '—'}/${apiData.totalFloors || '—'}`,
                icon: 'floor'
            },
            {
                title: 'Количество комнат',
                value: apiData.rooms || '—',
                icon: 'rooms'
            },
            {
                title: 'Тип недвижимости',
                value: this.getPropertyTypeDisplay(apiData.propertyType),
                icon: 'type'
            }
        ];

        if (apiData.housingComplexId) {
            characteristics.splice(1, 0, {
                title: 'В составе ЖК',
                value: apiData.housingComplexName,
                icon: 'complex',
                isComplex: true,
                complexId: apiData.housingComplexId
            });
        }

        return characteristics;
    }

    getPropertyTypeDisplay(propertyType: string): string {
        const types: {[key: string]: string} = {
            'apartment': 'Квартира',
            'house': 'Дом',
            'flat': 'Квартира'
        };
        return types[propertyType] || 'Не указано';
    }

    renderLoading(): void {
        this.cleanup();
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "loading";
        loadingDiv.textContent = "Загрузка объявления...";
        this.parent.appendChild(loadingDiv);
    }

    async renderContent(offerData: any): Promise<void> {
        this.cleanup();
        this.offerCard = new OfferCard(offerData, this.controller);
        const element = await this.offerCard.render();
        this.parent.appendChild(element);

        this.rootEl = element;

        await this.initYandexMap(offerData.address);
        await this.initPriceHistoryChart(offerData.id);
    }

    private async initYandexMap(address: string | undefined): Promise<void> {
        if (!address) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        const mapContainer = this.rootEl?.querySelector('#yandex-map') as HTMLElement | null;
        if (!mapContainer) {
            return;
        }

        try {
            await YandexMapService.initMap('yandex-map', address);
        } catch (error) {

        }
    }

    private async initPriceHistoryChart(offerId: number): Promise<void> {
        try {
            const priceHistory = await this.loadPriceHistory(offerId);

            await new Promise(resolve => setTimeout(resolve, 500));

            const chartContainer = this.rootEl?.querySelector('#price-history-chart') as HTMLElement | null;
            if (!chartContainer) {
                this.showNoDataMessage();
                return;
            }

            chartContainer.innerHTML = '';

            if (!priceHistory || priceHistory.length === 0) {
                this.showNoDataMessage();
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.id = 'price-history-chart-canvas';
            canvas.style.width = '100%';
            canvas.style.height = '300px';
            canvas.style.minHeight = '300px';
            canvas.style.maxHeight = '300px';
            chartContainer.appendChild(canvas);

            await new Promise(resolve => setTimeout(resolve, 100));

            await PriceHistoryChartService.initChart('price-history-chart-canvas', priceHistory);

        } catch (error) {
            this.showChartError('Не удалось загрузить историю цен');
        }
    }

    private async loadPriceHistory(offerId: number): Promise<Array<{ date: string; price: number }>> {
        try {
            const endpoint = `${API_CONFIG.ENDPOINTS.OFFERS.PRICE_HISTORY}/${offerId}`;

            const result = await API.get(endpoint);

            if (result.ok && result.data) {
                const priceHistory = this.processPriceHistoryData(result.data);
                return priceHistory;
            } else {
                return [];
            }
        } catch (error) {
            return [];
        }
    }

    private processPriceHistoryData(apiData: any): Array<{ date: string; price: number }> {
        if (!Array.isArray(apiData)) {
            return [];
        }

        const rawData = apiData.map((item: any, index: number) => {
            let date: string;
            let price: number;

            if (item.date && item.price !== undefined) {
                date = item.date;
                price = Number(item.price);
            } else if (item.Date && item.Price !== undefined) {
                date = item.Date;
                price = Number(item.Price);
            } else if (item.timestamp && item.price_value !== undefined) {
                date = new Date(item.timestamp).toISOString();
                price = Number(item.price_value);
            } else {
                return null;
            }

            return {
                date: new Date(date).toISOString(),
                price: price,
                timestamp: new Date(date).getTime(),
                originalIndex: index
            };
        }).filter(Boolean);

        if (rawData.length === 0) {
            return [];
        }

        rawData.sort((a: any, b: any) => a.timestamp - b.timestamp || a.originalIndex - b.originalIndex);

        const exactDuplicatesRemoved = [];
        const exactSeen = new Set();

        rawData.forEach((item: any) => {
            const exactKey = `${item.timestamp}_${item.price}`;
            if (!exactSeen.has(exactKey)) {
                exactSeen.add(exactKey);
                exactDuplicatesRemoved.push(item);
            }
        });

        const timeDeduplicatedMap = new Map();
        exactDuplicatesRemoved.forEach((item: any) => {
            timeDeduplicatedMap.set(item.timestamp, item);
        });

        const timeDeduplicated = Array.from(timeDeduplicatedMap.values());
        timeDeduplicated.sort((a: any, b: any) => a.timestamp - b.timestamp);

        const uniquePriceData = [];

        for (let i = 0; i < timeDeduplicated.length; i++) {
            const current = timeDeduplicated[i];
            const previous = uniquePriceData[uniquePriceData.length - 1];

            if (!previous) {
                uniquePriceData.push({
                    date: current.date,
                    price: current.price
                });
                continue;
            }

            if (current.price !== previous.price) {
                uniquePriceData.push({
                    date: current.date,
                    price: current.price
                });
            }
            else if (current.timestamp - new Date(previous.date).getTime() > 24 * 60 * 60 * 1000) {
                uniquePriceData.push({
                    date: current.date,
                    price: current.price
                });
            }
        }

        if (uniquePriceData.length === 1) {
            uniquePriceData.push({
                date: new Date().toISOString(),
                price: uniquePriceData[0].price
            });
        }

        return uniquePriceData;
    }

    private showNoDataMessage(): void {
        const chartContainer = this.rootEl?.querySelector('#price-history-chart') as HTMLElement | null;
        if (!chartContainer) return;

        chartContainer.innerHTML = `
            <div class="offer__price-history-empty">
                <div class="offer__price-history-empty-icon">📊</div>
                <div class="offer__price-history-empty-text">
                    История изменения цены отсутствует
                </div>
            </div>
        `;
    }

    private showChartError(message: string): void {
        const chartContainer = this.rootEl?.querySelector('#price-history-chart') as HTMLElement | null;
        if (!chartContainer) return;

        chartContainer.innerHTML = `
            <div class="offer__price-history-empty">
                <div class="offer__price-history-empty-icon">❌</div>
                <div class="offer__price-history-empty-text">
                    ${message}
                </div>
            </div>
        `;
    }

    renderError(message: string): void {
        this.cleanup();
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-state";

        const errorText = document.createElement("p");
        errorText.textContent = message;
        errorDiv.appendChild(errorText);

        const retryButton = document.createElement("button");
        retryButton.textContent = "Попробовать снова";
        retryButton.className = "retry-button";
        retryButton.addEventListener("click", () => this.renderWithParams({ id: this.offerId }));
        errorDiv.appendChild(retryButton);

        this.parent.appendChild(errorDiv);
    }

    cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        this.parent.innerHTML = "";

        YandexMapService.destroyMap();
        PriceHistoryChartService.destroyChart();

        this.offerCard = null;
        this.rootEl = null;
    }
}