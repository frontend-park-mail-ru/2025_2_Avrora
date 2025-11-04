import { SearchWidget } from '../widgets/SearchWidget.js';

export class SearchOffers {
    constructor(parent, { onSearch = null, onShowMap = null, navigate = null } = {}) {
        this.parent = parent;
        this.searchWidget = null;
        
        this.onSearch = typeof onSearch === 'function' ? onSearch : null;
        this.onShowMap = typeof onShowMap === 'function' ? onShowMap : null;
        this.navigate = typeof navigate === 'function' ? navigate : null;
    }

    render() {
        this.cleanup();

        this.searchWidget = new SearchWidget(this.parent, {
            onSearch: this.onSearch,
            onShowMap: this.onShowMap,
            navigate: this.navigate
        });

        this.searchWidget.render();
    }

    destroy() {
        if (this.searchWidget) {
            this.searchWidget.cleanup();
            this.searchWidget = null;
        }
    }

    cleanup() {
        this.destroy();
    }
}