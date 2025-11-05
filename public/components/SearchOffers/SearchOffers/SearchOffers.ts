import { SearchWidget } from '../widgets/SearchWidget.ts';

interface SearchOffersOptions {
    onSearch?: ((...args: any[]) => void) | null;
    onShowMap?: ((...args: any[]) => void) | null;
    navigate?: ((...args: any[]) => void) | null;
}

export class SearchOffers {
    private parent: HTMLElement;
    private searchWidget: SearchWidget | null;
    
    private onSearch: ((...args: any[]) => void) | null;
    private onShowMap: ((...args: any[]) => void) | null;
    private navigate: ((...args: any[]) => void) | null;

    constructor(parent: HTMLElement, { 
        onSearch = null, 
        onShowMap = null, 
        navigate = null 
    }: SearchOffersOptions = {}) {
        this.parent = parent;
        this.searchWidget = null;
        
        this.onSearch = typeof onSearch === 'function' ? onSearch : null;
        this.onShowMap = typeof onShowMap === 'function' ? onShowMap : null;
        this.navigate = typeof navigate === 'function' ? navigate : null;
    }

    render(): void {
        this.cleanup();

        this.searchWidget = new SearchWidget(this.parent, {
            onSearch: this.onSearch,
            onShowMap: this.onShowMap,
            navigate: this.navigate
        });

        this.searchWidget.render();
    }

    destroy(): void {
        if (this.searchWidget) {
            this.searchWidget.cleanup();
            this.searchWidget = null;
        }
    }

    cleanup(): void {
        this.destroy();
    }
}