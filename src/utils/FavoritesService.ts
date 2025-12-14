export class FavoritesService {
    static getFavorites() {
        try {
            const favoritesStr = localStorage.getItem('favoriteOffers');
            if (favoritesStr && favoritesStr !== 'undefined') {
                return JSON.parse(favoritesStr);
            }
        } catch (error) {

        }
        return [];
    }

    static saveFavorites(favorites) {
        try {
            localStorage.setItem('favoriteOffers', JSON.stringify(favorites));
            
            window.dispatchEvent(new CustomEvent('favoritesUpdated', {
                detail: { action: 'updated' }
            }));
        } catch (error) {

        }
    }

    static addToFavorites(offer) {
        const favorites = this.getFavorites();
        if (!favorites.find(fav => fav.id === offer.id)) {
            favorites.push(offer);
            this.saveFavorites(favorites);
        }
    }

    static removeFromFavorites(offerId) {
        const favorites = this.getFavorites();
        const updatedFavorites = favorites.filter(fav => fav.id !== offerId);
        this.saveFavorites(updatedFavorites);
    }

    static isFavorite(offerId) {
        const favorites = this.getFavorites();
        return favorites.some(fav => fav.id === offerId);
    }

    static getFavoritesCount() {
        return this.getFavorites().length;
    }

    static clearFavorites() {
        localStorage.removeItem('favoriteOffers');
        window.dispatchEvent(new CustomEvent('favoritesUpdated', {
            detail: { action: 'cleared' }
        }));
    }
}