import { Dropdown } from '../components/Search/Dropdown/Dropdown.js';
import { RangeDropdown } from '../components/Search/RangeDropdown/RangeDropdown.js';
import { Button } from '../components/Search/Button/Button.js';
import { SearchField } from '../components/Search/SearchField/SearchField.js';

export class SearchWidget {
    constructor(parent, { onSearch = null, onShowMap = null, navigate = null } = {}) {
        this.parent = parent;
        this.dropdowns = [];
        this.rangeDropdowns = [];
        this.buttons = [];
        this.searchField = null;

        this.onSearch = typeof onSearch === 'function' ? onSearch : null;
        this.onShowMap = typeof onShowMap === 'function' ? onShowMap : null;
        this.navigate = typeof navigate === 'function' ? navigate : null;

        this.dropdownConfigs = [
            { key: 'deal', placeholder: 'Тип сделки', items: [
                { label: 'Продажа', value: 'sale' },
                { label: 'Аренда', value: 'rent' }
            ] },
            { key: 'type', placeholder: 'Тип недвижимости', items: [
                { label: 'Квартира', value: 'flat' },
                { label: 'Дом', value: 'house' },
                { label: 'Коммерческая', value: 'commercial' }
            ] }
        ];

        this.rangeDropdownConfigs = [
            { key: 'price', placeholder: 'Цена', type: 'price' },
            { key: 'area', placeholder: 'Площадь', type: 'area' }
        ];
    }

    render() {
        this.cleanup();

        const widgetElement = this.createWidgetElement();
        this.parent.appendChild(widgetElement);

        this.initializeComponents(widgetElement);
        this.attachEventListeners();
    }

    createWidgetElement() {
        const widget = document.createElement('div');
        widget.className = 'search-widget';

        // Background
        const background = document.createElement('div');
        background.className = 'search-widget__background';
        widget.appendChild(background);

        // Title
        const title = document.createElement('h1');
        title.className = 'search-widget__title';
        title.textContent = 'Твой следующий адрес начинается здесь';
        widget.appendChild(title);

        // Main block with dropdowns and search field
        const block = document.createElement('div');
        block.className = 'search-widget__block';

        // Create regular dropdowns
        this.dropdownConfigs.forEach(config => {
            const dropdownContainer = document.createElement('div');
            dropdownContainer.className = 'search-widget__dropdown';
            dropdownContainer.dataset.type = 'regular';
            dropdownContainer.dataset.key = config.key;
            block.appendChild(dropdownContainer);
        });

        // Create range dropdowns
        this.rangeDropdownConfigs.forEach(config => {
            const rangeDropdownContainer = document.createElement('div');
            rangeDropdownContainer.className = 'search-widget__dropdown';
            rangeDropdownContainer.dataset.type = 'range';
            rangeDropdownContainer.dataset.key = config.key;
            block.appendChild(rangeDropdownContainer);
        });

        // Search field container
        const searchFieldContainer = document.createElement('div');
        searchFieldContainer.className = 'search-widget__field';
        block.appendChild(searchFieldContainer);

        widget.appendChild(block);

        // Actions section
        const actions = document.createElement('div');
        actions.className = 'search-widget__actions';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'search-widget__buttons';
        actions.appendChild(buttonsContainer);

        widget.appendChild(actions);

        return widget;
    }

    initializeComponents(widgetElement) {
        const dropdownContainers = widgetElement.querySelectorAll('.search-widget__dropdown[data-type="regular"]');
        const rangeDropdownContainers = widgetElement.querySelectorAll('.search-widget__dropdown[data-type="range"]');
        const searchFieldContainer = widgetElement.querySelector('.search-widget__field');
        const buttonsContainer = widgetElement.querySelector('.search-widget__buttons');

        // Initialize regular dropdowns
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

        // Initialize range dropdowns
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
                    reuseRoot: true
                });
                this.rangeDropdowns.push(rangeDropdown);
            }
        });

        // Initialize search field with clear button
        this.searchField = this.createSearchField(searchFieldContainer);

        // Initialize buttons
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

        // Add clear button to search field
        this.addClearButton(searchField);

        return searchField;
    }

    addClearButton(searchField) {
        const input = searchField.input;
        const wrapper = document.createElement('div');
        wrapper.className = 'search-field__wrapper';
        
        // Wrap the input
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Create clear button
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

        // Store reference to clear button
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

    buildParams() {
        const params = {
            query: this.searchField ? this.searchField.getValue() : ''
        };

        this.dropdowns.forEach((dropdown, index) => {
            const key = this.dropdownConfigs[index]?.key;
            if (dropdown && dropdown.getValue()) {
                params[key] = dropdown.getValue();
            }
        });

        this.rangeDropdowns.forEach((rangeDropdown, index) => {
            const key = this.rangeDropdownConfigs[index]?.key;
            if (rangeDropdown) {
                const value = rangeDropdown.getValue();
                if (value.from) params[`${key}_from`] = value.from;
                if (value.to) params[`${key}_to`] = value.to;
            }
        });

        return params;
    }

    buildUrl(basePath, params) {
        const url = new URL(basePath, window.location.origin);
        Object.entries(params || {}).forEach(([key, value]) => {
            if (value != null && value !== '') {
                url.searchParams.set(key, value);
            }
        });
        return url.pathname + url.search;
    }

    handleSearch(type = 'list') {
        const params = this.buildParams();
        const path = type === 'map' ? '/search-map' : '/search-ads';
        const target = this.buildUrl(path, params);

        if (this.navigate) {
            this.navigate(target);
        } else {
            window.history.pushState({}, '', target);
            window.dispatchEvent(new PopStateEvent('popstate'));
        }

        if (type === 'map') {
            if (this.onShowMap) this.onShowMap(params);
        } else {
            if (this.onSearch) this.onSearch(params);
        }
    }

    attachEventListeners() {
        // Close dropdowns when clicking outside
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
        this.parent.innerHTML = '';

        this.dropdowns = [];
        this.rangeDropdowns = [];
        this.buttons = [];
        this.searchField = null;
    }
}