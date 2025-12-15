export class EventDispatcher {
    static dispatchProfileUpdated(userData) {
        const event = new CustomEvent('profileUpdated', {
            detail: { 
                user: userData,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(event);
    }
    
    static dispatchOffersCountUpdated() {
        const event = new CustomEvent('offersCountUpdated', {
            detail: { timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    static dispatchUIUpdate() {
        const event = new CustomEvent('uiUpdate', {
            detail: { timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    static dispatchFavoritesUpdated() {
        const event = new CustomEvent('favoritesUpdated', {
            detail: { 
                timestamp: new Date().toISOString(),
                action: 'updated'
            }
        });
        window.dispatchEvent(event);
    }
    
    static dispatchFavoritesCountUpdated(count) {
        const event = new CustomEvent('favoritesCountUpdated', {
            detail: { 
                count: count,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(event);
    }
    
    static dispatchAuthChanged(isAuthenticated) {
        const event = new CustomEvent('authChanged', {
            detail: { 
                isAuthenticated: isAuthenticated,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(event);
    }
}