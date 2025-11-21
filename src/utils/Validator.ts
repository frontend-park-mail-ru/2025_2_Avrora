interface ValidationField {
  value: any;
  type: string;
  required: boolean;
  validator?: (value: any) => string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export function validEmail(email: string | null | undefined): boolean {
  if (!email || email.trim().length === 0) {
    return false;
  }
  const pattern = /^[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}$/u;
  return pattern.test(email.trim());
}

export function validPassword(password: string | null | undefined): string[] {
  const errors: string[] = [];
  if (!password || password.length === 0) {
    errors.push("Пароль обязателен для заполнения");
    return errors;
  }
  if (password.length < 6) errors.push("Пароль должен быть не менее 6 символов");
  if (!/[A-Z]/.test(password)) errors.push("Пароль должен содержать заглавную букву");
  if (!/[a-z]/.test(password)) errors.push("Пароль должен содержать строчную букву");
  if (!/[0-9]/.test(password)) errors.push("Пароль должен содержать цифру");
  return errors;
}

export function validName(name: string | null | undefined): string[] {
  const errors: string[] = [];
  if (!name || name.trim().length === 0) {
    errors.push("Поле обязательно для заполнения");
  } else if (name.trim().length < 2) {
    errors.push("Должно содержать минимум 2 символа");
  } else if (!/^[\p{L}\s\-]+$/u.test(name.trim())) {
    errors.push("Может содержать только буквы, пробелы и дефисы");
  } else if (name.trim().length > 50) {
    errors.push("Слишком длинное значение");
  }
  return errors;
}

export function validPhone(phone: string | null | undefined): string[] {
  const errors: string[] = [];
  if (!phone || phone.trim().length === 0) {
    errors.push("Телефон обязателен для заполнения");
    return errors;
  }

  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const digitsOnly = cleanPhone.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    errors.push("Телефон должен содержать минимум 10 цифр");
  }

  if (digitsOnly.length > 15) {
    errors.push("Телефон слишком длинный");
  }

  if (!/^\+?[\d\s\-()]+$/.test(phone)) {
    errors.push("Телефон может содержать только цифры, пробелы, скобки, дефисы и знак + в начале");
  }

  if (phone.includes('+') && !phone.startsWith('+')) {
    errors.push("Знак + может быть только в начале номера");
  }

  return errors;
}

export function validImageFile(file: File | null | undefined): string[] {
  const errors: string[] = [];

  if (!file) {
    errors.push("Файл не выбран");
    return errors;
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    errors.push("Допустимые форматы: JPEG, PNG, GIF, WebP");
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push("Размер файла не должен превышать 10MB");
  }

  return errors;
}

export function validPrice(price: number | string | null | undefined): string[] {
  const errors: string[] = [];

  if (price === null || price === undefined || price === '') {
    errors.push("Цена обязательна для заполнения");
    return errors;
  }

  const priceNum = Number(price);
  if (isNaN(priceNum)) {
    errors.push("Цена должна быть числом");
  } else if (priceNum < 0) {
    errors.push("Цена не может быть отрицательной");
  } else if (priceNum > 1000000000) {
    errors.push("Цена слишком большая");
  }

  return errors;
}

export function validAddress(address: string | null | undefined): string[] {
  const errors: string[] = [];

  if (!address || address.trim().length === 0) {
    errors.push("Адрес обязателен для заполнения");
  } else if (address.trim().length < 5) {
    errors.push("Адрес должен содержать минимум 5 символов");
  } else if (address.trim().length > 200) {
    errors.push("Адрес слишком длинный");
  }

  return errors;
}

export function validDescription(description: string | null | undefined): string[] {
  const errors: string[] = [];

  if (!description || description.trim().length === 0) {
    errors.push("Описание обязательно для заполнения");
  } else if (description.trim().length < 10) {
    errors.push("Описание должно содержать минимум 10 символов");
  } else if (description.trim().length > 2000) {
    errors.push("Описание слишком длинное");
  }

  return errors;
}

export function validateForm(fields: Record<string, ValidationField>): ValidationResult {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName];
    let fieldErrors: string[] = [];

    if (field.required && (!field.value || field.value.toString().trim().length === 0)) {
      fieldErrors.push("Это поле обязательно для заполнения");
    } else if (field.value && field.value.toString().trim().length > 0) {
      switch (field.type) {
        case 'email':
          if (!validEmail(field.value)) {
            fieldErrors.push("Некорректный формат email");
          }
          break;

        case 'password':
          const passwordErrors = validPassword(field.value);
          fieldErrors = [...fieldErrors, ...passwordErrors];
          break;

        case 'name':
          const nameErrors = validName(field.value);
          fieldErrors = [...fieldErrors, ...nameErrors];
          break;

        case 'phone':
          const phoneErrors = validPhone(field.value);
          fieldErrors = [...fieldErrors, ...phoneErrors];
          break;

        case 'price':
          const priceErrors = validPrice(field.value);
          fieldErrors = [...fieldErrors, ...priceErrors];
          break;

        case 'address':
          const addressErrors = validAddress(field.value);
          fieldErrors = [...fieldErrors, ...addressErrors];
          break;

        case 'description':
          const descriptionErrors = validDescription(field.value);
          fieldErrors = [...fieldErrors, ...descriptionErrors];
          break;

        case 'custom':
          if (field.validator) {
            const customErrors = field.validator(field.value);
            fieldErrors = [...fieldErrors, ...customErrors];
          }
          break;
      }
    }

    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
}

export function showFieldErrors(inputElement: HTMLElement, errors: string[] | null): void {
  const existingError = inputElement.parentNode?.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }

  if (errors && errors.length > 0) {
    inputElement.classList.add('field-error-border');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';

    errors.forEach(error => {
      const errorP = document.createElement('p');
      errorP.textContent = error;
      errorDiv.appendChild(errorP);
    });

    inputElement.parentNode?.appendChild(errorDiv);
  } else {
    inputElement.classList.remove('field-error-border');
  }
}

export function clearFieldError(inputElement: HTMLElement): void {
  const existingError = inputElement.parentNode?.querySelector('.field-error');

  if (existingError) {
    existingError.remove();
  }

  inputElement.classList.remove('field-error-border');
}