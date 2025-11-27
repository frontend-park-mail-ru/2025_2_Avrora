import { Dropdown } from "/components/Search/Dropdown/Dropdown.ts";
import { RangeDropdown } from "/components/Search/RangeDropdown/RangeDropdown.ts";
import { Button } from "/components/Search/Button/Button.ts";
import { SearchField } from "/components/Search/SearchField/SearchField.ts";

interface SearchWidgetOptions {
    onSearch?: ((params: Record<string, string>) => void) | null;
    onShowMap?: ((params: Record<string, string>) => void) | null;
    navigate?: ((path: string) => void) | null;
}

export class SearchWidget {
    private parent: HTMLElement;
    private dropdowns: Dropdown[];
    private rangeDropdowns: RangeDropdown[];
    private buttons: Button[];
    private searchField: SearchField | null;
    private rootElement: HTMLElement | null;
    private template: ((data: any) => string) | null;
    private onSearch: ((params: Record<string, string>) => void) | null;
    private onShowMap: ((params: Record<string, string>) => void) | null;
    private navigate: ((path: string) => void) | null;
    private dropdownConfigs: any[];
    private rangeDropdownConfigs: any[];
    private currentParams: Record<string, string>;

    constructor(parent: HTMLElement, { onSearch = null, onShowMap = null, navigate = null }: SearchWidgetOptions = {}) {
        this.parent = parent;
        this.dropdowns = [];
        this.rangeDropdowns = [];
        this.buttons = [];
        this.searchField = null;
        this.rootElement = null;
        this.template = null;
        this.onSearch = onSearch;
        this.onShowMap = onShowMap;
        this.navigate = navigate;

        this.dropdownConfigs = [
            { key: 'offer_type', placeholder: 'Тип сделки', items: [
                { label: 'Продажа', value: 'sale' },
                { label: 'Аренда', value: 'rent' }
            ] },
            { key: 'property_type', placeholder: 'Тип недвижимости', items: [
                { label: 'Квартира', value: 'apartment' },
                { label: 'Дом', value: 'house' },
            ] }
        ];

        this.rangeDropdownConfigs = [
            { key: 'price', placeholder: 'Цена', type: 'price' },
            { key: 'area', placeholder: 'Площадь', type: 'area' }
        ];

        this.currentParams = this.getParamsFromURL();
    }

    async render(): Promise<void> {
        this.cleanup();
        const template = await this.loadTemplate();

        const templateData = {
            dropdowns: [
                ...this.dropdownConfigs.map(config => ({ type: 'regular', key: config.key })),
                ...this.rangeDropdownConfigs.map(config => ({ type: 'range', key: config.key }))
            ]
        };

        if (typeof template !== 'function') {
            throw new Error('Search template is not a valid function');
        }

        const html = template(templateData);
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;

        this.rootElement = tempContainer.firstElementChild as HTMLElement;
        this.parent.appendChild(this.rootElement);

        this.initializeComponents();
        this.applyCurrentParams();
        this.attachEventListeners();
    }

    private async loadTemplate(): Promise<(data: any) => string> {
        if (this.template) return this.template;

        const templates = (window as any).Handlebars.templates;
        this.template = templates['Search'] || templates['Search.hbs'];

        if (!this.template) {
            throw new Error('Search template not found in compiled templates');
        }

        if (typeof this.template !== 'function') {
            throw new Error('Search template is not a function');
        }

        return this.template;
    }

    private getParamsFromURL(): Record<string, string> {
        const urlParams = new URLSearchParams(window.location.search);
        const params: Record<string, string> = {};

        // Исправлено: location -> address
        if (urlParams.has('address')) params.address = urlParams.get('address')!;
        if (urlParams.has('offer_type')) params.offer_type = urlParams.get('offer_type')!;
        if (urlParams.has('property_type')) params.property_type = urlParams.get('property_type')!;
        // Исправлено: min_price -> price_min, max_price -> price_max
        if (urlParams.has('price_min')) params.price_min = urlParams.get('price_min')!;
        if (urlParams.has('price_max')) params.price_max = urlParams.get('price_max')!;
        // Исправлено: min_area -> area_min, max_area -> area_max
        if (urlParams.has('area_min')) params.area_min = urlParams.get('area_min')!;
        if (urlParams.has('area_max')) params.area_max = urlParams.get('area_max')!;

        return params;
    }

    private applyCurrentParams(): void {
        // Исправлено: location -> address
        if (this.currentParams.address && this.searchField) {
            this.searchField.setValue(this.currentParams.address);
        }

        this.dropdowns.forEach((dropdown, index) => {
            const config = this.dropdownConfigs[index];
            if (this.currentParams[config.key] && dropdown) {
                dropdown.setValue(this.currentParams[config.key]);
            }
        });

        this.rangeDropdowns.forEach((rangeDropdown, index) => {
            const config = this.rangeDropdownConfigs[index];
            if (config.key === 'price') {
                // Исправлено: min_price -> price_min, max_price -> price_max
                const from = this.currentParams.price_min || '';
                const to = this.currentParams.price_max || '';
                if (from || to) {
                    rangeDropdown.setValue(from, to);
                }
            } else if (config.key === 'area') {
                // Исправлено: min_area -> area_min, max_area -> area_max
                const from = this.currentParams.area_min || '';
                const to = this.currentParams.area_max || '';
                if (from || to) {
                    rangeDropdown.setValue(from, to);
                }
            }
        });
    }

    private initializeComponents(): void {
        if (!this.rootElement) return;

        const dropdownContainers = this.rootElement.querySelectorAll('.search-widget__dropdown[data-type="regular"]');
        const rangeDropdownContainers = this.rootElement.querySelectorAll('.search-widget__dropdown[data-type="range"]');
        const searchFieldContainer = this.rootElement.querySelector('.search-widget__field');
        const buttonsContainer = this.rootElement.querySelector('.search-widget__buttons');

        this.dropdownConfigs.forEach((config, index) => {
            const container = dropdownContainers[index];
            if (container) {
                const dropdown = new Dropdown({
                    parent: container as HTMLElement,
                    placeholder: config.placeholder,
                    items: config.items,
                    onSelect: () => {},
                    reuseRoot: true
                });
                this.dropdowns.push(dropdown);
            }
        });

        this.rangeDropdownConfigs.forEach((config, index) => {
            const container = rangeDropdownContainers[index];
            if (container) {
                const rangeDropdown = new RangeDropdown({
                    parent: container as HTMLElement,
                    placeholder: config.placeholder,
                    type: config.type,
                    onSelect: () => {},
                    reuseRoot: true,
                    validateRange: true
                });
                this.rangeDropdowns.push(rangeDropdown);
            }
        });

        if (searchFieldContainer) {
            this.searchField = this.createSearchField(searchFieldContainer as HTMLElement);
        }

        const showMapButton = new Button({
            text: 'Показать на карте',
            onClick: () => this.handleSearch('map')
        });

        const showListButton = new Button({
            text: 'Показать объявления',
            onClick: () => this.handleSearch('list')
        });

        if (buttonsContainer) {
            showMapButton.mount(buttonsContainer as HTMLElement);
            showListButton.mount(buttonsContainer as HTMLElement);
        }

        this.buttons = [showMapButton, showListButton];
    }

    private createSearchField(container: HTMLElement): SearchField {
        const searchField = new SearchField({
            parent: container,
            placeholder: 'Город, улица, метро, дом',
            onInput: (value: string) => {
                this.toggleClearButton(value);
            },
            onSubmit: () => this.handleSearch('list'),
            reuseRoot: true
        });

        this.addClearButton(searchField);
        return searchField;
    }

    private addClearButton(searchField: SearchField): void {
        const input = searchField.input;
        const wrapper = document.createElement('div');
        wrapper.className = 'search-field__wrapper';

        input.parentNode!.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.className = 'search-field__clear';
        clearButton.innerHTML = '&times;';
        clearButton.style.display = 'none';

        clearButton.addEventListener('click', () => {
            searchField.setValue('');
            this.toggleClearButton('');
            if (searchField.onInput) {
                searchField.onInput('');
            }
        });

        wrapper.appendChild(clearButton);
        (searchField as any).clearButton = clearButton;
    }

    private toggleClearButton(value: string): void {
        if (this.searchField && (this.searchField as any).clearButton) {
            (this.searchField as any).clearButton.style.display = value ? 'flex' : 'none';
        }
    }

    private buildSearchParams(): Record<string, string> {
        const params: Record<string, string> = {};

        if (this.searchField) {
            const queryValue = this.searchField.getValue();
            if (queryValue && queryValue.trim()) {
                // Исправлено: location -> address
                params.address = queryValue.trim();
            }
        }

        this.dropdowns.forEach((dropdown, index) => {
            const config = this.dropdownConfigs[index];
            if (dropdown && dropdown.getValue()) {
                params[config.key] = dropdown.getValue()!;
            }
        });

        this.rangeDropdowns.forEach((rangeDropdown, index) => {
            const config = this.rangeDropdownConfigs[index];
            if (rangeDropdown) {
                const value = rangeDropdown.getValue();
                if (config.key === 'price') {
                    // Исправлено: min_price -> price_min, max_price -> price_max
                    if (value.from) params.price_min = value.from;
                    if (value.to) params.price_max = value.to;
                } else if (config.key === 'area') {
                    // Исправлено: min_area -> area_min, max_area -> area_max
                    if (value.from) params.area_min = value.from;
                    if (value.to) params.area_max = value.to;
                }
            }
        });

        return params;
    }

    private buildUrl(basePath: string, params: Record<string, string>): string {
        const url = new URL(basePath, window.location.origin);
        url.search = '';
        Object.entries(params).forEach(([key, value]) => {
            if (value != null && value !== '' && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.pathname + url.search;
    }

    private handleSearch(type: 'list' | 'map' = 'list'): void {
        const params = this.buildSearchParams();
        const path = type === 'map' ? '/search-map' : '/search-ads';
        const target = this.buildUrl(path, params);

        if (this.navigate) {
            this.navigate(target);
        } else {
            window.history.pushState({}, "", target);
            window.dispatchEvent(new PopStateEvent('popstate'));
        }

        if (type === 'map') {
            if (this.onShowMap) this.onShowMap(params);
        } else {
            if (this.onSearch) this.onSearch(params);
        }
    }

    private attachEventListeners(): void {
        document.addEventListener('click', (e: MouseEvent) => {
            if (!(e.target as Element).closest('.dropdown')) {
                this.dropdowns.forEach(dropdown => dropdown.close());
                this.rangeDropdowns.forEach(rangeDropdown => rangeDropdown.close());
            }
        });
    }

    cleanup(): void {
        this.dropdowns.forEach(dropdown => {
            if (dropdown && typeof dropdown.destroy === 'function') {
                dropdown.destroy();
            }
        });
        this.rangeDropdowns.forEach(rangeDropdown => {
            if (rangeDropdown && typeof rangeDropdown.destroy === 'function') {
                rangeDropdown.destroy();
            }
        });
        this.buttons.forEach(button => {
            if (button && typeof button.destroy === 'function') {
                button.destroy();
            }
        });
        if (this.searchField && typeof this.searchField.destroy === 'function') {
            this.searchField.destroy();
        }

        if (this.rootElement) {
            this.rootElement.remove();
            this.rootElement = null;
        }

        this.dropdowns = [];
        this.rangeDropdowns = [];
        this.buttons = [];
        this.searchField = null;
    }
}