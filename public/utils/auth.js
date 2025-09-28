/**
 * Модуль для валидации email и пароля
 * @module auth
 */

/**
 * Валидирует email адрес
 * @param {string} email - Email для валидации
 * @returns {boolean} true если email валиден, иначе false
 */
export function validEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

/**
 * Валидирует пароль по критериям безопасности
 * @param {string} password - Пароль для валидации
 * @returns {string[]} Массив ошибок валидации (пустой если пароль валиден)
 */
export function validPassword(password) {
    const errors = [];
    if (password.length < 8) errors.push("Пароль должен быть не менее 8 символов");
    if (!/[A-Z]/.test(password)) errors.push("Пароль должен содержать заглавную букву");
    if (!/[a-z]/.test(password)) errors.push("Пароль должен содержать строчную букву");
    if (!/[0-9]/.test(password)) errors.push("Пароль должен содержать цифру");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("Пароль должен содержать спецсимвол");
    }
    return errors;
}