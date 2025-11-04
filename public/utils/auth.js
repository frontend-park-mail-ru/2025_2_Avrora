// auth.js - добавлены новые функции валидации
export function validEmail(email) {
    const pattern = /^[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}$/u;
    return pattern.test(email);
}

export function validPassword(password) {
    const errors = [];
    if (password.length < 6) errors.push("Пароль должен быть не менее 6 символов");
    if (!/[A-Z]/.test(password)) errors.push("Пароль должен содержать заглавную букву");
    if (!/[a-z]/.test(password)) errors.push("Пароль должен содержать строчную букву");
    if (!/[0-9]/.test(password)) errors.push("Пароль должен содержать цифру");
    return errors;
}

export function validName(name) {
    if (!name || name.trim().length < 2) {
        return "Имя должно содержать минимум 2 символа";
    }
    if (name.length > 50) {
        return "Имя не должно превышать 50 символов";
    }
    return null;
}

export function validPhone(phone) {
    if (!phone) return null; // Телефон не обязателен
    
    // Упрощенная валидация телефона (разрешает цифры, пробелы, скобки, дефисы)
    const phonePattern = /^[\d\s\-\(\)\+]+$/;
    if (!phonePattern.test(phone)) {
        return "Некорректный формат телефона";
    }
    
    // Убираем все нецифровые символы для проверки длины
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
        return "Телефон должен содержать не менее 10 цифр";
    }
    
    return null;
}