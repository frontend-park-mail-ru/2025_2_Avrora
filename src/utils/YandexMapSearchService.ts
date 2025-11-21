export class YandexMapSearchService {
    private static mapInstance: any = null;
    private static selectedPlacemark: any = null;
    private static offersByAddress: Map<string, any[]> = new Map();
    private static currentFilters: Record<string, string> = {};

    static async initMap(containerId: string, offers: any[], filters: Record<string, string>): Promise<void> {
        if (!window.ymaps) {
            console.error('Яндекс.Карты не загружены');
            return;
        }

        try {
            await new Promise(resolve => {
                if (window.ymaps.ready) {
                    resolve(true);
                } else {
                    window.ymaps.ready(resolve);
                }
            });

            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Элемент с ID "${containerId}" не найден`);
                return;
            }

            if (this.mapInstance) {
                this.mapInstance.destroy();
                this.mapInstance = null;
            }

            this.currentFilters = filters;

            this.mapInstance = new ymaps.Map(containerId, {
                center: [55.75, 37.62], 
                zoom: 10,
                controls: ['zoomControl', 'fullscreenControl']
            }, {
                suppressMapOpenBlock: true,
                geolocationControlSize: 'large',
                geolocationControlPosition: { top: '50px', right: '10px' },
                zoomControlSize: 'small'
            });

            this.groupOffersByAddress(offers);

            await this.addPlacemarks();

            this.mapInstance.events.add('click', () => {
                this.closeSidebar();
            });

        } catch (error) {
            console.error('Ошибка при инициализации карты:', error);
        }
    }

    private static groupOffersByAddress(offers: any[]): void {
        this.offersByAddress.clear();

        offers.forEach(offer => {
            const address = offer.address || 'Не указано';
            if (!this.offersByAddress.has(address)) {
                this.offersByAddress.set(address, []);
            }
            this.offersByAddress.get(address)!.push(offer);
        });
    }

    private static async addPlacemarks(): Promise<void> {
        const placemarks = [];

        for (const [address, offerList] of this.offersByAddress.entries()) {

            const geocodeResult = await ymaps.geocode(address);
            const firstGeoObject = geocodeResult.geoObjects.get(0);

            if (!firstGeoObject) {
                console.warn(`Адрес "${address}" не найден на карте`);
                continue;
            }

            const coords = firstGeoObject.geometry.getCoordinates();

            let iconContent = '';
            if (offerList.length > 1) {
                iconContent = `<div class="placemark-count">${offerList.length}</div>`;
            }

            const placemark = new ymaps.Placemark(coords, {
                hintContent: `${address} (${offerList.length} объявлений)`,
                balloonContent: address,
                iconContent: iconContent
            }, {
                iconLayout: 'default#imageWithContent',
                iconImageHref: '/images/map-marker-green.svg', 
                iconImageSize: [30, 40],
                iconImageOffset: [-15, -40],
                iconContentOffset: [0, 0],
                iconContentLayout: 'default#imageWithContent',
                iconContentColor: '#fff',
                iconContentFontWeight: 'bold',
                iconContentFontSize: '14px'
            });

            placemark.events.add('click', (e: any) => {
                e.preventDefault();
                this.selectPlacemark(placemark, address);
            });

            placemarks.push(placemark);
        }

        this.mapInstance.geoObjects.add(new ymaps.ObjectManager({
            clusterize: false,
            clusterDisableClickZoom: true,
            clusterHasBalloon: false,
            clusterIconLayout: 'default#imageWithContent',
            clusterIconImageHref: '/images/map-marker-green.svg',
            clusterIconImageSize: [30, 40],
            clusterIconOffset: [-15, -40],
            clusterIconContentOffset: [0, 0],
            clusterIconContentLayout: 'default#imageWithContent',
            clusterIconContentColor: '#fff',
            clusterIconContentFontWeight: 'bold',
            clusterIconContentFontSize: '14px'
        }));

        placemarks.forEach(placemark => {
            this.mapInstance.geoObjects.add(placemark);
        });

        if (placemarks.length > 0) {
            this.mapInstance.setCenter(placemarks[0].geometry.getCoordinates(), 12);
        }
    }

    private static selectPlacemark(placemark: any, address: string): void {
        if (this.selectedPlacemark) {
            this.selectedPlacemark.options.set('iconImageHref', '/images/map-marker-green.svg');
        }

        placemark.options.set('iconImageHref', '/images/map-marker-blue.svg'); 
        this.selectedPlacemark = placemark;

        this.openSidebar(address);
    }

    private static openSidebar(address: string): void {
        const sidebar = document.createElement('div');
        sidebar.className = 'map-sidebar';

        const header = document.createElement('div');
        header.className = 'map-sidebar__header';
        header.innerHTML = `
            <h3>${address}</h3>
            <button class="map-sidebar__close">&times;</button>
        `;
        sidebar.appendChild(header);

        const content = document.createElement('div');
        content.className = 'map-sidebar__content';

        const offers = this.offersByAddress.get(address) || [];
        if (offers.length === 0) {
            content.innerHTML = '<p>Нет объявлений по этому адресу</p>';
        } else {
            offers.forEach(offer => {
                const card = document.createElement('div');
                card.className = 'map-sidebar__offer-card';

                const imageContainer = document.createElement('div');
                imageContainer.className = 'map-sidebar__offer-image';
                imageContainer.style.backgroundImage = `url(${offer.images[0] || '/images/default_offer.jpg'})`;

                const info = document.createElement('div');
                info.className = 'map-sidebar__offer-info';

                const price = document.createElement('div');
                price.className = 'map-sidebar__offer-price';
                price.textContent = offer.price;

                const desc = document.createElement('div');
                desc.className = 'map-sidebar__offer-desc';
                desc.textContent = `${offer.infoDesc} · ${offer.metro}`;

                const addressEl = document.createElement('div');
                addressEl.className = 'map-sidebar__offer-address';
                addressEl.textContent = offer.address;

                info.appendChild(price);
                info.appendChild(desc);
                info.appendChild(addressEl);

                card.appendChild(imageContainer);
                card.appendChild(info);

                card.addEventListener('click', () => {
                    window.location.href = `/offers/${offer.id}`;
                });

                content.appendChild(card);
            });
        }

        sidebar.appendChild(content);
        document.body.appendChild(sidebar);

        const closeButton = header.querySelector('.map-sidebar__close') as HTMLElement;
        closeButton.addEventListener('click', () => {
            this.closeSidebar();
        });

        sidebar.scrollTop = 0;
    }

    private static closeSidebar(): void {
        const sidebar = document.querySelector('.map-sidebar');
        if (sidebar) {
            sidebar.remove();
        }

        if (this.selectedPlacemark) {
            this.selectedPlacemark.options.set('iconImageHref', '/images/map-marker-green.svg');
            this.selectedPlacemark = null;
        }
    }

    static destroyMap(): void {
        if (this.mapInstance) {
            this.mapInstance.destroy();
            this.mapInstance = null;
        }
        this.selectedPlacemark = null;
        this.offersByAddress.clear();
        this.currentFilters = {};
    }
}