import { Dropdown } from "/components/Search/Dropdown/Dropdown.js";
import { RangeDropdown } from "/components/Search/RangeDropdown/RangeDropdown.js";
import { Button } from "/components/Search/Button/Button.js";
import { SearchField } from "/components/Search/SearchField/SearchField.js";

export class SearchWidget {
    constructor(parent, { onSearch = null, onShowMap = null, navigate = null } = {}) {
        this.parent = parent;
        this.dropdowns = [];
        this.rangeDropdowns = [];
        this.buttons = [];
        this.searchField = null;
        this.rootElement = null;

        this.onSearch = typeof onSearch === 'function' ? onSearch : null;
        this.onShowMap = typeof onShowMap === 'function' ? onShowMap : null;
        this.navigate = typeof navigate === 'function' ? navigate : null;

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

        // Загружаем параметры из URL при инициализации
        this.currentParams = this.getParamsFromURL();
    }

    async render() {
        this.cleanup();
        const template = await this.loadTemplate();

        const templateData = {
            dropdowns: [
                ...this.dropdownConfigs.map(config => ({ type: 'regular', key: config.key })),
                ...this.rangeDropdownConfigs.map(config => ({ type: 'range', key: config.key }))
            ]
        };

        if (typeof template !== 'function') {
            console.error('Template is not a function:', template);
            throw new Error('Search template is not a valid function');
        }

        const html = template(templateData);
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;

        this.rootElement = tempContainer.firstElementChild;
        this.parent.appendChild(this.rootElement);

        this.initializeComponents();
        this.applyCurrentParams();
        this.attachEventListeners();

        // Активируем кнопки если есть параметры
        if (Object.keys(this.currentParams).length > 0) {
            this.activateActions();
        }
    }

    async loadTemplate() {
        if (this.template) return this.template;

        try {
            this.template = Handlebars.templates['Search'] || Handlebars.templates['Search.hbs'];

            if (!this.template) {
                console.warn('Available templates:', Object.keys(Handlebars.templates || {}));
                throw new Error('Search template not found in compiled templates');
            }

            if (typeof this.template !== 'function') {
                throw new Error('Search template is not a function');
            }

            return this.template;
        } catch (error) {
            console.error('Failed to load search widget template:', error);
            throw new Error('Search widget template loading failed');
        }
    }

    getParamsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};

        // Базовые параметры
        if (urlParams.has('location')) params.location = urlParams.get('location');
        if (urlParams.has('offer_type')) params.offer_type = urlParams.get('offer_type');
        if (urlParams.has('property_type')) params.property_type = urlParams.get('property_type');

        // Числовые параметры
        if (urlParams.has('min_price')) params.min_price = urlParams.get('min_price');
        if (urlParams.has('max_price')) params.max_price = urlParams.get('max_price');
        if (urlParams.has('min_area')) params.min_area = urlParams.get('min_area');
        if (urlParams.has('max_area')) params.max_area = urlParams.get('max_area');

        return params;
    }

    applyCurrentParams() {
        // Применяем параметры из URL к компонентам
        if (this.currentParams.location && this.searchField) {
            this.searchField.setValue(this.currentParams.location);
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
                const from = this.currentParams.min_price || '';
                const to = this.currentParams.max_price || '';
                if (from || to) {
                    rangeDropdown.setValue(from, to);
                }
            } else if (config.key === 'area') {
                const from = this.currentParams.min_area || '';
                const to = this.currentParams.max_area || '';
                if (from || to) {
                    rangeDropdown.setValue(from, to);
                }
            }
        });
    }

    initializeComponents() {
        const dropdownContainers = this.rootElement.querySelectorAll('.search-widget__dropdown[data-type="regular"]');
        const rangeDropdownContainers = this.rootElement.querySelectorAll('.search-widget__dropdown[data-type="range"]');
        const searchFieldContainer = this.rootElement.querySelector('.search-widget__field');
        const buttonsContainer = this.rootElement.querySelector('.search-widget__buttons');

        this.dropdownConfigs.forEach((config, index) => {
            const container = dropdownContainers[index];
            if (container) {
                const dropdown = new Dropdown({
                    parent: container,
                    placeholder: config.placeholder,
                    items: config.items,
                    onSelect: (selected) => {
                        console.log('Dropdown selected:', selected);
                        this.activateActions();
                    },
                    reuseRoot: true
                });
                this.dropdowns.push(dropdown);
            }
        });

        this.rangeDropdownConfigs.forEach((config, index) => {
            const container = rangeDropdownContainers[index];
            if (container) {
                const rangeDropdown = new RangeDropdown({
                    parent: container,
                    placeholder: config.placeholder,
                    type: config.type,
                    onSelect: (selected) => {
                        console.log('RangeDropdown selected:', selected);
                        this.activateActions();
                    },
                    reuseRoot: true,
                    validateRange: true
                });
                this.rangeDropdowns.push(rangeDropdown);
            }
        });

        this.searchField = this.createSearchField(searchFieldContainer);

        const showMapButton = new Button({
            text: 'Показать на карте',
            disabled: true,
            onClick: () => this.handleSearch('map')
        });

        const showListButton = new Button({
            text: 'Показать объявления',
            disabled: true,
            onClick: () => this.handleSearch('list')
        });

        showMapButton.mount(buttonsContainer);
        showListButton.mount(buttonsContainer);

        this.buttons = [showMapButton, showListButton];
    }

    createSearchField(container) {
        const searchField = new SearchField({
            parent: container,
            placeholder: 'Город, улица, метро, дом',
            onInput: (value) => {
                this.toggleClearButton(value);
                if (value && value.trim()) this.activateActions();
            },
            onSubmit: () => this.handleSearch('list'),
            reuseRoot: true
        });

        this.addClearButton(searchField);

        return searchField;
    }

    addClearButton(searchField) {
        const input = searchField.input;
        const wrapper = document.createElement('div');
        wrapper.className = 'search-field__wrapper';

        input.parentNode.insertBefore(wrapper, input);
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

        searchField.clearButton = clearButton;
    }

    toggleClearButton(value) {
        if (this.searchField && this.searchField.clearButton) {
            this.searchField.clearButton.style.display = value ? 'flex' : 'none';
        }
    }

    activateActions() {
        this.buttons.forEach(button => button.setDisabled(false));
    }

    buildSearchParams() {
        const params = {};

        // Параметры поиска
        if (this.searchField) {
            const queryValue = this.searchField.getValue();
            if (queryValue && queryValue.trim()) {
                params.location = queryValue.trim();
            }
        }

        // Dropdown параметры
        this.dropdowns.forEach((dropdown, index) => {
            const config = this.dropdownConfigs[index];
            if (dropdown && dropdown.getValue()) {
                params[config.key] = dropdown.getValue();
            }
        });

        // Range параметры
        this.rangeDropdowns.forEach((rangeDropdown, index) => {
            const config = this.rangeDropdownConfigs[index];
            if (rangeDropdown) {
                const value = rangeDropdown.getValue();
                if (config.key === 'price') {
                    if (value.from) params.min_price = value.from;
                    if (value.to) params.max_price = value.to;
                } else if (config.key === 'area') {
                    if (value.from) params.min_area = value.from;
                    if (value.to) params.max_area = value.to;
                }
            }
        });

        return params;
    }

    buildUrl(basePath, params) {
        const url = new URL(basePath, window.location.origin);

        // Очищаем все существующие параметры
        url.search = '';

        // Добавляем только непустые параметры
        Object.entries(params).forEach(([key, value]) => {
            if (value != null && value !== '' && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });

        return url.pathname + url.search;
    }

handleSearch(type = 'list') {
        const params = this.buildSearchParams();
        const path = type === 'map' ? '/search-map' : '/search-ads';
        const target = this.buildUrl(path, params);

        console.log('SearchWidget - Search params:', params);
        console.log('SearchWidget - Navigating to:', target);

        if (this.navigate) {
            this.navigate(target);
        } else {
            // Fallback навигация
            window.history.pushState({}, "", target);
            window.dispatchEvent(new PopStateEvent('popstate'));
        }

        if (type === 'map') {
            if (this.onShowMap) this.onShowMap(params);
        } else {
            if (this.onSearch) this.onSearch(params);
        }
    }

    attachEventListeners() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.dropdowns.forEach(dropdown => dropdown.close());
                this.rangeDropdowns.forEach(rangeDropdown => rangeDropdown.close());
            }
        });
    }

    cleanup() {
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