export class UserModel {
    constructor() {
        this.user = this.getStoredUser();
        this.token = localStorage.getItem('authToken');
    }

    getStoredUser() {
        try {
            const storedUserData = localStorage.getItem('userData');
            if (storedUserData && storedUserData !== "undefined") {
                return JSON.parse(storedUserData);
            }
        } catch (error) {
            localStorage.removeItem('userData');
        }
        return null;
    }

    setUser(user, token = null) {
        this.user = {
            id: user.id,
            firstName: user.FirstName || user.firstName || user.first_name || '',
            lastName: user.LastName || user.lastName || user.last_name || '',
            email: user.Email || user.email || '',
            phone: user.Phone || user.phone || '',
            avatar: user.AvatarURL || user.avatar || user.avatar_url || user.photo_url || '../../images/user.png'
        };

        localStorage.setItem('userData', JSON.stringify(this.user));
        
        if (token) {
            this.token = token;
            localStorage.setItem('authToken', token);
        }
    }

    updateUser(profileData) {
        if (!this.user) return;

        this.user = {
            ...this.user,
            ...profileData,
            firstName: profileData.FirstName || this.user.firstName,
            lastName: profileData.LastName || this.user.lastName,
            email: profileData.Email || this.user.email,
            phone: profileData.Phone || this.user.phone,
            avatar: profileData.AvatarURL || this.user.avatar
        };

        localStorage.setItem('userData', JSON.stringify(this.user));
    }

    clearUser() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
    }

    isProfileComplete() {
        if (!this.user) return false;

        const { firstName, lastName, phone, email, avatar } = this.user;

        const requiredFields = ['firstName', 'lastName', 'phone', 'email'];
        const fieldValues = { firstName, lastName, phone, email };

        for (const field of requiredFields) {
            const value = fieldValues[field];
            if (!value || value.trim() === '') {
                return false;
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            return false;
        }

        if (!avatar || avatar === '../images/user.png' || avatar === '../../images/user.png') {
            return false;
        }

        return true;
    }

    decodeJWT(token) {
        try {
            if (!token) return null;
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    }
}