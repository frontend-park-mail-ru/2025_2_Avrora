export class Summary {
    constructor(state, app) {
        this.state = state;
        this.app = app;
    }

    async render() {
        const content = document.createElement("div");
        content.className = "profile__content";

        const quickAdBlock = this.createQuickAdBlock();
        const myAdsBlock = this.createMyAdsBlock();
        const favoritesBlock = this.createFavoritesBlock();

        content.appendChild(quickAdBlock);
        content.appendChild(myAdsBlock);
        content.appendChild(favoritesBlock);

        return content;
    }

    createQuickAdBlock() {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";
        title.textContent = "Добавление объявления в 1 клик";

        const text = document.createElement("span");
        text.className = "profile__text";
        text.textContent = "Воспользуйтесь функцией «Добавление в один клик», чтобы быстро и без лишних хлопот разместить своё объявление";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "profile__action-button";
        button.textContent = "Добавить объявление";

        button.addEventListener("click", () => {
            if (this.app.isProfileComplete()) {
                this.app.router.navigate("/create-ad");
            } else {
                this.app.showProfileCompletionModal();
            }
        });

        block.appendChild(title);
        block.appendChild(text);
        block.appendChild(button);

        return block;
    }

    createMyAdsBlock() {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";
        title.textContent = "Мои объявления";

        const ad = this.createAd(
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "Аренда 3-комн. кв., 86 000 ₽",
            "Пролетарский проспект, 27, Москва"
        );

        const link = document.createElement("button");
        link.type = "button";
        link.className = "profile__link";
        link.textContent = "Все мои объявления";

        link.addEventListener("click", () => {
            this.app.router.navigate("/profile/myoffers");
        });

        block.appendChild(title);
        block.appendChild(ad);
        block.appendChild(link);

        return block;
    }

    createFavoritesBlock() {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";
        title.textContent = "Избранное";

        const favorite = this.createAd(
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "Аренда 3-комн. кв., 86 000 ₽",
            "Пролетарский проспект, 27, Москва"
        );

        const link = document.createElement("button");
        link.type = "button";
        link.className = "profile__link";
        link.textContent = "Все избранные объявления";

        block.appendChild(title);
        block.appendChild(favorite);
        block.appendChild(link);

        return block;
    }

    createAd(imgSrc, titleText, description) {
        const ad = document.createElement("div");
        ad.className = "profile__ad";

        const img = document.createElement("img");
        img.className = "profile__ad-image";
        img.src = imgSrc;
        img.alt = "Объявление";

        const info = document.createElement("div");
        info.className = "profile__ad-info";

        const title = document.createElement("h1");
        title.className = "profile__ad-title";
        title.textContent = titleText;

        const text = document.createElement("span");
        text.className = "profile__ad-text";
        text.textContent = description;

        info.appendChild(title);
        info.appendChild(text);

        ad.appendChild(img);
        ad.appendChild(info);

        return ad;
    }

    cleanup() {
    }
}