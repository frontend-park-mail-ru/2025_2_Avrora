import { API } from '../utils/API.js';
import { validEmail, validPassword } from '../utils/auth.js';
import { ErrorMessage } from '../components/Alerts/ErrorMessage.js';

export class RegisterPage {
    constructor(parent, state, app) {
        this.state = state;
        this.parent = parent;
        this.app = app;
        this.eventListeners = [];
    }

    render() {
        const template = Handlebars.templates["Register.hbs"];
        this.parent.innerHTML = template({
            inputs: [
                { placeholder: "Email", type: "email", name: "email" },
                { placeholder: "Пароль", type: "password", name: "password" },
                { placeholder: "Повторите пароль", type: "password", name: "repassword" }
            ]
        });

        this.errorMessage = new ErrorMessage(this.parent.querySelector("#warn_signup"));
        this.setEventListeners();
    }

    getElements() {
        return {
            email: this.parent.querySelector("input[name=email]"),
            password: this.parent.querySelector("input[name=password]"),
            rePassword: this.parent.querySelector("input[name=repassword]"),
            form: this.parent.querySelector("form"),
            warnEmail: this.parent.querySelector("#warn_email"),
            warnPassword: this.parent.querySelector("#warn_password"),
            warnRePass: this.parent.querySelector("#warn_repassword")
        };
    }

    async submitSignup(e) {
        e.preventDefault();
        const { email, password, rePassword, warnEmail, warnPassword, warnRePass } = this.getElements();

        const emailStr = email.value.trim();
        const passStr = password.value.trim();
        const repassStr = rePassword.value.trim();

        let hasErrors = false;

        if (!emailStr || !validEmail(emailStr)) {
            email.classList.add("warning");
            warnEmail.textContent = "Введите корректный Email";
            warnEmail.classList.add("active");
            hasErrors = true;
        }

        const errors = validPassword(passStr);
        if (errors.length > 0) {
            password.classList.add("warning");
            warnPassword.textContent = errors[0];
            warnPassword.classList.add("active");
            hasErrors = true;
        }

        if (passStr !== repassStr) {
            rePassword.classList.add("warning");
            warnRePass.textContent = "Пароли не совпадают";
            warnRePass.classList.add("active");
            hasErrors = true;
        }

        if (hasErrors) return;

        try {
            const result = await API.post("/auth/register", { email: emailStr, password: passStr });
            if (result.ok) {
                this.app.setUser(result.data.user, result.data.token);
            } else {
                this.errorMessage.show(result.error || "Ошибка регистрации");
            }
        } catch {
            this.errorMessage.show("Ошибка сети. Попробуйте позже.");
        }
    }

    setEventListeners() {
        const { form, email, password, rePassword } = this.getElements();
        if (form) this.addEventListener(form, "submit", this.submitSignup.bind(this));
        [email, password, rePassword].forEach(el => {
            this.addEventListener(el, "focus", () => {
                el.classList.remove("warning");
                this.errorMessage.clear();
            });
        });
    }

    addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) =>
            element.removeEventListener(event, handler)
        );
        this.eventListeners = [];
    }
}
