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
}