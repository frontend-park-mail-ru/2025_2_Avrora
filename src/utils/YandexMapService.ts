export class YandexMapService {
    private static mapInstance: any = null;
    private static marker: any = null;

    static async initMap(containerId: string, address: string): Promise<void> {
        this.clearContainerBeforeInit(containerId);

        if (!window.ymaps3) {
            return;
        }

        try {
            await ymaps3.ready;

            const container = document.getElementById(containerId);
            if (!container) {
                return;
            }

            if (this.mapInstance) {
                this.mapInstance.destroy();
                this.mapInstance = null;
            }

            const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker} = ymaps3;

            this.mapInstance = new YMap(
                container,
                {
                    location: {
                        center: [37.62, 55.75],
                        zoom: 10
                    }
                }
            );

            this.mapInstance.addChild(new YMapDefaultSchemeLayer());
            this.mapInstance.addChild(new YMapDefaultFeaturesLayer());

            const coords = await this.geocodeAddress(address);
            if (coords) {
                this.mapInstance.setLocation({
                    center: coords,
                    zoom: 16
                });

                if (this.marker) {
                    this.mapInstance.removeChild(this.marker);
                }

                const markerElement = document.createElement('div');
                markerElement.innerHTML = `
                    <div style="
                        width: 30px;
                        height: 40px;
                        background-image: url('/images/map-marker.svg');
                        background-size: contain;
                        background-repeat: no-repeat;
                        cursor: pointer;
                    " title="${address}"></div>
                `;

                this.marker = new YMapMarker(
                    {
                        coordinates: coords,
                        title: address
                    },
                    markerElement
                );

                this.mapInstance.addChild(this.marker);

            } else {

                const errorElement = document.createElement('div');
                errorElement.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #666;
                    font-size: 14px;
                    text-align: center;
                    padding: 20px;
                `;
                errorElement.textContent = `Адрес "${address}" не найден на карте`;

                container.appendChild(errorElement);
            }

        } catch (error) {

            const container = document.getElementById(containerId);
            if (container) {
                const errorElement = document.createElement('div');
                errorElement.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #f44336;
                    font-size: 14px;
                    text-align: center;
                    padding: 20px;
                `;
                errorElement.textContent = 'Ошибка загрузки карты';

                container.appendChild(errorElement);
            }
        }
    }

    private static clearContainerBeforeInit(containerId: string): void {
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        const dataAttributes: {[key: string]: string} = {};
        const classes = container.className;
        const style = container.style.cssText;
        const id = container.id;

        for (let i = 0; i < container.attributes.length; i++) {
            const attr = container.attributes[i];
            if (attr.name.startsWith('data-')) {
                dataAttributes[attr.name] = attr.value;
            }
        }

        container.innerHTML = '';

        container.className = classes;
        container.style.cssText = style;
        container.id = id;

        Object.keys(dataAttributes).forEach(key => {
            container.setAttribute(key, dataAttributes[key]);
        });

        if (!container.style.height) {
            container.style.height = '400px';
        }
        if (!container.style.position) {
            container.style.position = 'relative';
        }
    }

    private static async geocodeAddress(address: string): Promise<[number, number] | null> {
        try {
            const response = await fetch(
                `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=fb8ef9b8-e5d4-49d2-9ccf-b4b8de0e5a44&geocode=${encodeURIComponent(address)}`
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

    static destroyMap(): void {
        if (this.mapInstance) {
            this.mapInstance.destroy();
            this.mapInstance = null;
            this.marker = null;
        }
    }
}