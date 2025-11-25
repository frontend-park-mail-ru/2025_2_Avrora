export class YandexMapSearchService {
    private static mapInstance: any = null;
    private static markers: Map<string, any> = new Map();
    private static selectedMarker: any = null;
    private static offersByAddress: Map<string, any[]> = new Map();
    private static currentFilters: Record<string, string> = {};
    private static onMarkerClick: ((address: string, offers: any[]) => void) | null = null;

    static async initMap(
        containerId: string,
        offers: any[],
        filters: Record<string, string>,
        onMarkerClick?: (address: string, offers: any[]) => void
    ): Promise<void> {

        if (!offers || offers.length === 0) {
            this.showNoOffersMessage(containerId);
            return;
        }

        this.onMarkerClick = onMarkerClick || null;
        this.clearContainerBeforeInit(containerId);

        if (!window.ymaps3) {
            this.showError(containerId, 'Библиотека карт не загружена');
            return;
        }

        try {
            await ymaps3.ready;

            const container = document.getElementById(containerId);
            if (!container) {
                return;
            }

            if (this.mapInstance) {
                try {
                    this.mapInstance.destroy();
                } catch (error) {

                }
                this.mapInstance = null;
            }

            this.markers.clear();
            this.currentFilters = filters;

            const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker} = ymaps3;

            this.mapInstance = new YMap(
                container,
                {
                    location: {
                        center: [37.6173, 55.7558],
                        zoom: 10
                    }
                }
            );

            this.mapInstance.addChild(new YMapDefaultSchemeLayer());
            this.mapInstance.addChild(new YMapDefaultFeaturesLayer());

            this.groupOffersByAddress(offers);

            await this.addMarkers();

        } catch (error) {
            this.showError(containerId, 'Ошибка загрузки карты');
        }
    }

    private static showNoOffersMessage(containerId: string): void {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                text-align: center;
                color: #666;
                padding: 20px;
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">🏠</div>
                <h3 style="margin: 0 0 8px 0; color: #333;">Объявления не найдены</h3>
                <p style="margin: 0;">Попробуйте изменить параметры поиска</p>
            </div>
        `;
    }

    private static showError(containerId: string, message: string): void {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                text-align: center;
                color: #dc3545;
                padding: 20px;
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                <h3 style="margin: 0 0 8px 0;">${message}</h3>
                <p style="margin: 0;">Попробуйте обновить страницу</p>
            </div>
        `;
    }

    private static clearContainerBeforeInit(containerId: string): void {
        const container = document.getElementById(containerId);
        if (!container) return;

        const dataAttributes: {[key: string]: string} = {};
        const classes = container.className;
        const style = container.style.cssText;

        for (let i = 0; i < container.attributes.length; i++) {
            const attr = container.attributes[i];
            if (attr.name.startsWith('data-')) {
                dataAttributes[attr.name] = attr.value;
            }
        }

        container.innerHTML = '';

        container.className = classes;
        container.style.cssText = style;

        Object.keys(dataAttributes).forEach(key => {
            container.setAttribute(key, dataAttributes[key]);
        });

        if (!container.style.height) {
            container.style.height = '100%';
        }
        if (!container.style.position) {
            container.style.position = 'relative';
        }
    }

    private static groupOffersByAddress(offers: any[]): void {
        this.offersByAddress.clear();

        offers.forEach(offer => {
            const address = offer.address || offer.Address || 'Адрес не указан';

            if (!this.offersByAddress.has(address)) {
                this.offersByAddress.set(address, []);
            }
            this.offersByAddress.get(address)!.push(offer);
        });
    }

    private static async addMarkers(): Promise<void> {
        const markers: any[] = [];
        const coordinates: [number, number][] = [];

        for (const [address, offerList] of this.offersByAddress.entries()) {
            try {
                const coords = await this.geocodeAddress(address);

                if (!coords) {
                    continue;
                }

                coordinates.push(coords);

                const markerElement = document.createElement('div');
                markerElement.style.cursor = 'pointer';

                let markerHtml = '';
                if (offerList.length > 1) {
                    markerHtml = `
                        <div style="
                            position: relative;
                            width: 40px;
                            height: 50px;
                            background-image: url('/images/map-marker-green.svg');
                            background-size: contain;
                            background-repeat: no-repeat;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <div style="
                                position: absolute;
                                top: 5px;
                                color: white;
                                font-size: 12px;
                                font-weight: bold;
                                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                            ">${offerList.length}</div>
                        </div>
                    `;
                } else {
                    markerHtml = `
                        <div style="
                            width: 30px;
                            height: 40px;
                            background-image: url('/images/map-marker-green.svg');
                            background-size: contain;
                            background-repeat: no-repeat;
                            cursor: pointer;
                        " title="${address}"></div>
                    `;
                }

                markerElement.innerHTML = markerHtml;

                markerElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectMarker(address, coords, markerElement, offerList);
                });

                const { YMapMarker } = ymaps3;
                const marker = new YMapMarker(
                    {
                        coordinates: coords,
                        title: `${address} (${offerList.length} объявлений)`
                    },
                    markerElement
                );

                this.markers.set(address, marker);
                markers.push(marker);

            } catch (error) {

            }
        }

        markers.forEach(marker => {
            this.mapInstance.addChild(marker);
        });

        if (coordinates.length > 0) {
            this.fitMapToMarkers(coordinates);
        }
    }

    private static fitMapToMarkers(coordinates: [number, number][]): void {
        if (coordinates.length === 0) return;

        if (coordinates.length === 1) {
            this.mapInstance.setLocation({
                center: coordinates[0],
                zoom: 14
            });
        } else {
            const lons = coordinates.map(coord => coord[0]);
            const lats = coordinates.map(coord => coord[1]);

            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);

            const center: [number, number] = [
                (minLon + maxLon) / 2,
                (minLat + maxLat) / 2
            ];

            const zoom = this.calculateZoom(minLon, maxLon, minLat, maxLat);

            this.mapInstance.setLocation({
                center: center,
                zoom: zoom
            });
        }
    }

    private static calculateZoom(minLon: number, maxLon: number, minLat: number, maxLat: number): number {
        const lonDiff = maxLon - minLon;
        const latDiff = maxLat - minLat;
        const maxDiff = Math.max(lonDiff, latDiff);

        if (maxDiff < 0.01) return 14;
        if (maxDiff < 0.02) return 13;
        if (maxDiff < 0.05) return 12;
        if (maxDiff < 0.1) return 11;
        if (maxDiff < 0.2) return 10;
        if (maxDiff < 0.5) return 9;
        if (maxDiff < 1) return 8;
        if (maxDiff < 2) return 7;
        return 6;
    }

    private static async geocodeAddress(address: string): Promise<[number, number] | null> {
        if (!address || address === 'Адрес не указан') {
            return null;
        }

        try {
            const searchAddress = address.includes('Москва') ? address : `Москва, ${address}`;

            const response = await fetch(
                `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=apikey&geocode=${encodeURIComponent(searchAddress)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const featureMember = data.response.GeoObjectCollection.featureMember;

            if (featureMember && featureMember.length > 0) {
                const pos = featureMember[0].GeoObject.Point.pos;
                const [lon, lat] = pos.split(' ').map(Number);
                return [lon, lat];
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    private static selectMarker(address: string, coords: [number, number], markerElement: HTMLElement, offers: any[]): void {
        if (this.selectedMarker) {
            const prevMarkerElement = this.selectedMarker.element;
            if (prevMarkerElement) {
                const img = prevMarkerElement.querySelector('div');
                if (img) {
                    img.style.backgroundImage = "url('/images/map-marker-green.svg')";
                }
            }
        }

        const img = markerElement.querySelector('div');
        if (img) {
            img.style.backgroundImage = "url('/images/map-marker-blue.svg')";
        }

        this.selectedMarker = {
            address,
            coords,
            element: markerElement
        };

        this.mapInstance.setLocation({
            center: coords,
            zoom: 16
        });

        if (this.onMarkerClick) {
            this.onMarkerClick(address, offers);
        }
    }

    static destroyMap(): void {
        if (this.mapInstance) {
            try {
                this.mapInstance.destroy();
            } catch (error) {

            }
            this.mapInstance = null;
        }
        this.markers.clear();
        this.selectedMarker = null;
        this.offersByAddress.clear();
        this.onMarkerClick = null;
    }
}