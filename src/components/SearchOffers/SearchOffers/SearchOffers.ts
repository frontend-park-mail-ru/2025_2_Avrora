interface SearchOffersOptions {
    onSearch?: (params: Record<string, string>) => void;
    onShowMap?: (params: Record<string, string>) => void;
    navigate?: (path: string) => void;
}

export class SearchOffers {
    private parent: HTMLElement;
    private searchWidget: any;
    private onSearch: ((params: Record<string, string>) => void) | null;
    private onShowMap: ((params: Record<string, string>) => void) | null;
    private navigate: ((path: string) => void) | null;

    constructor(parent: HTMLElement, { onSearch = null, onShowMap = null, navigate = null }: SearchOffersOptions = {}) {
        this.parent = parent;
        this.searchWidget = null;

        this.onSearch = typeof onSearch === 'function' ? onSearch : null;
        this.onShowMap = typeof onShowMap === 'function' ? onShowMap : null;
        this.navigate = typeof navigate === 'function' ? navigate : null;
    }

    render(): void {
        this.cleanup();

        this.searchWidget = new (window as any).SearchWidget(this.parent, {
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