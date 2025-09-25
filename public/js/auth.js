function initAuth() {
    checkAuthStatus();

    $('body').on('input', '#register-form input, #login-form input', function() {
        const $input = $(this);
        if ($input.hasClass('form-wrong-data') || $input.hasClass('form-right-data')) {
            $input.removeClass('form-wrong-data form-right-data');
            
            const $form = $input.closest('form');
            const $errorMessage = $form.find('.form-error');
            if ($errorMessage.length > 0) {
                $errorMessage.remove();
            }
        }
    });

    $('body').on('submit', '#register-form', function(e) {
        e.preventDefault();
        
        const $form = $(this);
        const email = $form.find('input[type="email"]').val();
        const password = $form.find('input[name="password"]').val();
        const confirmPassword = $form.find('input[name="confirmPassword"]').val();
        
        clearFormValidation($form);
        
        if (password !== confirmPassword) {
            const $passwordInput = $form.find('input[name="password"]');
            const $confirmPasswordInput = $form.find('input[name="confirmPassword"]');
            const $submitButton = $form.find('button[type="submit"]');
            
            $passwordInput.addClass('form-wrong-data');
            $confirmPasswordInput.addClass('form-wrong-data');
            $('<span class="form-error">Пароли не совпадают!</span>').insertBefore($submitButton);
            return;
        }
        
        if (!email.match(/@/)) {
            const $emailInput = $form.find('input[type="email"]');
            const $submitButton = $form.find('button[type="submit"]');
            
            $emailInput.addClass('form-wrong-data');
            $('<span class="form-error">Введите корректный email!</span>').insertBefore($submitButton);
            return;
        }
        
        if (!password.match(/^\S{8,}$/)) {
            const $passwordInput = $form.find('input[name="password"]');
            const $confirmPasswordInput = $form.find('input[name="confirmPassword"]');
            const $submitButton = $form.find('button[type="submit"]');
            
            $passwordInput.addClass('form-wrong-data');
            $confirmPasswordInput.addClass('form-wrong-data');
            $('<span class="form-error">Пароль должен содержать минимум 8 символов без пробелов!</span>').insertBefore($submitButton);
            return;
        }
        
        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                const $emailInput = $form.find('input[type="email"]');
                const $passwordInput = $form.find('input[name="password"]');
                const $confirmPasswordInput = $form.find('input[name="confirmPassword"]');
                const $submitButton = $form.find('button[type="submit"]');
                
                $form.find('.form-error').remove();
                
                $emailInput.addClass('form-wrong-data');
                $passwordInput.addClass('form-wrong-data');
                $confirmPasswordInput.addClass('form-wrong-data');
                $('<span class="form-error">' + data.error + '</span>').insertBefore($submitButton);
            } else {
                const $emailInput = $form.find('input[type="email"]');
                const $passwordInput = $form.find('input[name="password"]');
                const $confirmPasswordInput = $form.find('input[name="confirmPassword"]');
                
                $emailInput.addClass('form-right-data');
                $passwordInput.addClass('form-right-data');
                $confirmPasswordInput.addClass('form-right-data');
                
                setTimeout(() => {
                    $form.closest('.modal').css('display', 'none');
                    $form.trigger('reset');
                    clearFormValidation($form);
                    updateUIAfterLogin(data.email);
                }, 1000);
            }
        })
        .catch(error => {
            const $submitButton = $form.find('button[type="submit"]');
            $form.find('.form-error').remove();
            $('<span class="form-error">Ошибка соединения!</span>').insertBefore($submitButton);
        });
    });

    $('body').on('submit', '#login-form', function(e) {
        e.preventDefault();
        
        const $form = $(this);
        const email = $form.find('input[type="email"]').val();
        const password = $form.find('input[name="password"]').val();
        
        clearFormValidation($form);
        
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                const $emailInput = $form.find('input[type="email"]');
                const $passwordInput = $form.find('input[name="password"]');
                const $submitButton = $form.find('button[type="submit"]');
                
                $form.find('.form-error').remove();
                
                $emailInput.addClass('form-wrong-data');
                $passwordInput.addClass('form-wrong-data');
                $('<span class="form-error">Неправильно введен email или пароль!</span>').insertBefore($submitButton);
            } else {
                const $emailInput = $form.find('input[type="email"]');
                const $passwordInput = $form.find('input[name="password"]');
                
                $emailInput.addClass('form-right-data');
                $passwordInput.addClass('form-right-data');
                
                setTimeout(() => {
                    $form.closest('.modal').css('display', 'none');
                    $form.trigger('reset');
                    clearFormValidation($form);
                    updateUIAfterLogin(data.email);
                }, 1000);
            }
        })
        .catch(error => {
            const $submitButton = $form.find('button[type="submit"]');
            $form.find('.form-error').remove();
            $('<span class="form-error">Ошибка соединения!</span>').insertBefore($submitButton);
        });
    });

    $('body').on('click', '#logout-btn', function(e) {
        e.preventDefault();
        logout();
    });
}

async function checkAuthStatus() {
    try {
        const response = await fetch('/me');
        if (response.ok) {
            const userData = await response.json();
            updateUIAfterLogin(userData.email);
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

async function logout() {
    try {
        await fetch('/logout', { method: 'POST' });
        location.reload();
    } catch (error) {
        console.error('Error during logout:', error);
        location.reload();
    }
}

function clearFormValidation($form) {
    $form.find('.form-error').remove();
    $form.closest('.modal').find('.form-error').remove();
    $form.find('input').removeClass('form-wrong-data form-right-data');
}

function updateUIAfterLogin(email) {
    $('.header-nav').html(`
        <div class="header-user">
            <span class="header-user-email">${email}</span>
            <span class="header-user-photo"></span>
        </div>
        <div><button id="logout-btn" class="logout-button">Выйти</button></div>
    `);
    
    $('.login-button, .register-button').hide();
}

$(document).ready(function() {
    initAuth();
});