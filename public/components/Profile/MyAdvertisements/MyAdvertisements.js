export class MyAdvertisements {
  constructor(state, app) {
    this.state = state;
    this.app = app;
  }

  render() {
    const content = document.createElement("div");
    content.className = "profile__content";

    const block = document.createElement("div");
    block.className = "profile__block";

    const title = document.createElement("h1");
    title.className = "profile__title";
    title.textContent = "Мои объявления (4)";

    block.appendChild(title);

    const ads = [
      {
        imgSrc: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
        title: "Аренда 3-комн. кв., 86 000 ₽",
        text: "Пролетарский проспект, 27, Москва"
      },
      {
        imgSrc: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
        title: "Аренда 3-комн. кв., 86 000 ₽",
        text: "Пролетарский проспект, 27, Москва"
      },
      {
        imgSrc: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
        title: "Аренда 3-комн. кв., 86 000 ₽",
        text: "Пролетарский проспект, 27, Москва"
      },
      {
        imgSrc: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
        title: "Аренда 3-комн. кв., 86 000 ₽",
        text: "Пролетарский проспект, 27, Москва"
      }
    ];

    ads.forEach(adData => {
      const ad = this.createAd(adData);
      block.appendChild(ad);
    });

    content.appendChild(block);
    return content;
  }

  createAd(adData) {
    const ad = document.createElement("div");
    ad.className = "profile__ad";

    const img = document.createElement("img");
    img.className = "profile__ad-image";
    img.src = adData.imgSrc;
    img.alt = "Объявление";

    const info = document.createElement("div");
    info.className = "profile__ad-info";

    const infoTitle = document.createElement("h1");
    infoTitle.className = "profile__ad-title";
    infoTitle.textContent = adData.title;

    const infoText = document.createElement("span");
    infoText.className = "profile__ad-text";
    infoText.textContent = adData.text;

    info.appendChild(infoTitle);
    info.appendChild(infoText);

    ad.appendChild(img);
    ad.appendChild(info);

    return ad;
  }
}