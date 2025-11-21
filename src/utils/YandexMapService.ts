export class YandexMapService {
    private static mapInstance: any = null;

    static async initMap(containerId: string, address: string): Promise<void> {
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

            this.mapInstance = new ymaps.Map(containerId, {
                center: [55.75, 37.62], 
                zoom: 10,
                controls: ['zoomControl', 'fullscreenControl']
            }, {
                suppressMapOpenBlock: true,
                balloonMaxWidth: 200,
                geolocationControlSize: 'large',
                geolocationControlPosition: { top: '50px', right: '10px' },
                zoomControlSize: 'small'
            });

            const geocodeResult = await ymaps.geocode(address);
            const firstGeoObject = geocodeResult.geoObjects.get(0);

            if (!firstGeoObject) {
                console.warn(`Адрес "${address}" не найден на карте`);
                return;
            }

            const coords = firstGeoObject.geometry.getCoordinates();
            this.mapInstance.setCenter(coords, 16);

            const customIcon = new ymaps.Placemark(coords, {
                hintContent: address,
                balloonContent: address
            }, {
                iconLayout: 'default#image',
                iconImageHref: '/images/map-marker.svg',
                iconImageSize: [30, 40],
                iconImageOffset: [-15, -40]
            });

            this.mapInstance.geoObjects.add(customIcon);

            const mapContainer = document.getElementById(containerId);
            if (mapContainer) {
                const loader = mapContainer.querySelector(':before');
                if (loader) {
                    loader.remove();
                }
            }

        } catch (error) {
            console.error('Ошибка при инициализации карты:', error);
        }
    }

    static destroyMap(): void {
        if (this.mapInstance) {
            this.mapInstance.destroy();
            this.mapInstance = null;
        }
    }
}