import { Dropdown } from "./Search/Dropdown/Dropdown.ts";
import { RangeDropdown } from "./Search/RangeDropdown/RangeDropdown.ts";
import { Button } from "./Search/Button/Button.ts";
import { SearchField } from "./Search/SearchField/SearchField.ts";

interface SearchWidgetOptions {
    onSearch?: ((params: Record<string, string>) => void) | null;
    onShowMap?: ((params: Record<string, string>) => void) | null;
    navigate?: ((path: string) => void) | null;
}

interface DropdownConfig {
    key: string;
    placeholder: string;
    items: Array<{ label: string; value: string }>;
}

interface RangeDropdownConfig {
    key: string;
    placeholder: string;
    type: 'price' | 'area';
}

export class SearchWidget {
    private parent: HTMLElement;
    private dropdowns: Dropdown[] = [];
    private rangeDropdowns: RangeDropdown[] = [];
    private buttons: Button[] = [];
    private searchField: SearchField | null = null;
    private rootElement: HTMLElement | null = null;
    private onSearch: ((params: Record<string, string>) => void) | null = null;
    private onShowMap: ((params: Record<string, string>) => void) | null = null;
    private navigate: ((path: string) => void) | null = null;
    private template: any = null;
    private currentParams: Record<string, string> = {};
    private dropdownConfigs: DropdownConfig[] = [
        { key: 'offer_type', placeholder: 'Тип сделки', items: [
            { label: 'Продажа', value: 'sale' },
            { label: 'Аренда', value: 'rent' }
        ] },
        { key: 'property_type', placeholder: 'Тип недвижимости', items: [
            { label: 'Квартира', value: 'apartment' },
            { label: 'Дом', value: 'house' },
        ] }
    ];
    private rangeDropdownConfigs: RangeDropdownConfig[] = [
        { key: 'price', placeholder: 'Цена', type: 'price' },
        { key: 'area', placeholder: 'Площадь', type: 'area' }
    ];

    constructor(
        parent: HTMLElement,
        { onSearch = null, onShowMap = null, navigate = null }: SearchWidgetOptions = {}
    ) {
        this.parent = parent;
        this.onSearch = typeof onSearch === 'function' ? onSearch : null;
        this.onShowMap = typeof onShowMap === 'function' ? onShowMap : null;
        this.navigate = typeof navigate === 'function' ? navigate : null;
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

    private async loadTemplate(): Promise<any> {
        if (this.template) return this.template;
        this.template = (Handlebars as any).templates['Search'] || (Handlebars as any).templates['Search.hbs'];
        if (!this.template) {
            throw new Error('Search template not found');
        }
        if (typeof this.template !== 'function') {
            throw new Error('Search template is not a function');
        }
        return this.template;
    }

    private getParamsFromURL(): Record<string, string> {
        const urlParams = new URLSearchParams(window.location.search);
        const params: Record<string, string> = {};
        if (urlParams.has('location')) params.location = urlParams.get('location')!;
        if (urlParams.has('offer_type')) params.offer_type = urlParams.get('offer_type')!;
        if (urlParams.has('property_type')) params.property_type = urlParams.get('property_type')!;
        if (urlParams.has('min_price')) params.min_price = urlParams.get('min_price')!;
        if (urlParams.has('max_price')) params.max_price = urlParams.get('max_price')!;
        if (urlParams.has('min_area')) params.min_area = urlParams.get('min_area')!;
        if (urlParams.has('max_area')) params.max_area = urlParams.get('max_area')!;
        return params;
    }

    private applyCurrentParams(): void {
        if (this.currentParams.location && this.searchField) {
            this.searchField.setValue(this.currentParams.location);
        }
        this.dropdowns.forEach((dropdown, index) => {
            const config = this.dropdownConfigs[index];
            if (this.currentParams[config.key]) {
                dropdown.setValue(this.currentParams[config.key]);
            }
        });
        this.rangeDropdowns.forEach((rangeDropdown, index) => {
            const config = this.rangeDropdownConfigs[index];
            if (config.key === 'price') {
                rangeDropdown.setValue(this.currentParams.min_price || '', this.currentParams.max_price || '');
            } else if (config.key === 'area') {
                rangeDropdown.setValue(this.currentParams.min_area || '', this.currentParams.max_area || '');
            }
        });
    }

    private initializeComponents(): void {
        const dropdownContainers = this.rootElement!.querySelectorAll('.search-widget__dropdown[data-type="regular"]');
        const rangeDropdownContainers = this.rootElement!.querySelectorAll('.search-widget__dropdown[data-type="range"]');
        const searchFieldContainer = this.rootElement!.querySelector('.search-widget__field');
        const buttonsContainer = this.rootElement!.querySelector('.search-widget__buttons');

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

        this.searchField = this.createSearchField(searchFieldContainer as HTMLElement);
        const showMapButton = new Button({
            text: 'Показать на карте',
            onClick: () => this.handleSearch('map')
        });
        const showListButton = new Button({
            text: 'Показать объявления',
            onClick: () => this.handleSearch('list')
        });
        showMapButton.mount(buttonsContainer!);
        showListButton.mount(buttonsContainer!);
        this.buttons = [showMapButton, showListButton];
    }

    private createSearchField(container: HTMLElement): SearchField {
        const searchField = new SearchField({
            parent: container,
            placeholder: 'Город, улица, метро, дом',
            onInput: (value: string) => this.toggleClearButton(value),
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
            if (searchField.onInput) searchField.onInput('');
        });
        wrapper.appendChild(clearButton);
        (searchField as any).clearButton = clearButton;
    }

    private toggleClearButton(value: string): void {
        const clearBtn = (this.searchField as any)?.clearButton;
        if (clearBtn) {
            clearBtn.style.display = value ? 'flex' : 'none';
        }
    }

    private buildSearchParams(): Record<string, string> {
        const params: Record<string, string> = {};
        if (this.searchField) {
            const query = this.searchField.getValue().trim();
            if (query) params.location = query;
        }
        this.dropdowns.forEach((dropdown, index) => {
            const val = dropdown.getValue();
            if (val) params[this.dropdownConfigs[index].key] = val;
        });
        this.rangeDropdowns.forEach((rd, index) => {
            const v = rd.getValue();
            const key = this.rangeDropdownConfigs[index].key;
            if (key === 'price') {
                if (v.from) params.min_price = v.from;
                if (v.to) params.max_price = v.to;
            } else if (key === 'area') {
                if (v.from) params.min_area = v.from;
                if (v.to) params.max_area = v.to;
            }
        });
        return params;
    }

    private buildUrl(basePath: string, params: Record<string, string>): string {
        const url = new URL(basePath, window.location.origin);
        url.search = '';
        Object.entries(params).forEach(([k, v]) => {
            if (v) url.searchParams.set(k, v);
        });
        return url.pathname + url.search;
    }

    private handleSearch(type: 'map' | 'list' = 'list'): void {
        const params = this.buildSearchParams();
        const path = type === 'map' ? '/search-map' : '/search-ads';
        const target = this.buildUrl(path, params);
        if (this.navigate) {
            this.navigate(target);
        } else {
            window.history.pushState({}, "", target);
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
        if (type === 'map' && this.onShowMap) this.onShowMap(params);
        if (type === 'list' && this.onSearch) this.onSearch(params);
    }

    private attachEventListeners(): void {
        document.addEventListener('click', (e: Event) => {
            const target = e.target as Element;
            if (!target.closest('.dropdown')) {
                this.dropdowns.forEach(d => d.close());
                this.rangeDropdowns.forEach(rd => rd.close());
            }
        });
    }

    cleanup(): void {
        this.dropdowns.forEach(d => d.destroy());
        this.rangeDropdowns.forEach(rd => rd.destroy());
        this.buttons.forEach(b => b.destroy());
        this.searchField?.destroy();
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