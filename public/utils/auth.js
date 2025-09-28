/**
 * Проверяет валидность email адреса
 * @param {string} email - Email адрес для проверки
 * @returns {boolean} true если email валиден, false в противном случае
 */
export function validEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

/**
 * Проверяет валидность пароля по заданным правилам
 * @param {string} password - Пароль для проверки
 * @returns {string[]} Массив строк с ошибками валидации, пустой массив если пароль валиден
 */
export function validPassword(password) {
    const errors = [];
    if (password.length < 6) errors.push("Пароль должен быть не менее 6 символов");
    if (!/[A-Z]/.test(password)) errors.push("Пароль должен содержать заглавную букву");
    if (!/[a-z]/.test(password)) errors.push("Пароль должен содержать строчную букву");
    if (!/[0-9]/.test(password)) errors.push("Пароль должен содержать цифру");
    return errors;
}