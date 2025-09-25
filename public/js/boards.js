const mockAdsData = [
    {
        id: 1,
        image: './images/living-room.jpg',
        price: '86 000 ₽/мес.',
        description: '3-комн. кв. · 78,9м² · 3/8 этаж',
        metro: 'Кантемировская',
        address: 'Пролетарский проспект, 27',
        isLiked: false
    },
    {
        id: 2,
        image: './images/living-room.jpg',
        price: '95 000 ₽/мес.',
        description: '2-комн. кв. · 54,2м² · 5/9 этаж',
        metro: 'Автозаводская',
        address: 'ул. Ленинская Слобода, 26',
        isLiked: false
    },
    {
        id: 3,
        image: './images/living-room.jpg',
        price: '72 500 ₽/мес.',
        description: '1-комн. кв. · 38,7м² · 2/5 этаж',
        metro: 'Дубровка',
        address: 'ул. Сайкина, 15',
        isLiked: false
    },
    {
        id: 4,
        image: './images/living-room.jpg',
        price: '120 000 ₽/мес.',
        description: '4-комн. кв. · 105,3м² · 7/12 этаж',
        metro: 'Павелецкая',
        address: 'Кожевническая ул., 7',
        isLiked: false
    },
    {
        id: 5,
        image: './images/living-room.jpg',
        price: '65 000 ₽/мес.',
        description: 'Студия · 28,5м² · 1/3 этаж',
        metro: 'Тульская',
        address: 'Даниловский пер., 8',
        isLiked: false
    },
    {
        id: 6,
        image: './images/living-room.jpg',
        price: '110 000 ₽/мес.',
        description: '3-комн. кв. · 82,1м² · 6/10 этаж',
        metro: 'Нагатинская',
        address: 'Варшавское шоссе, 28',
        isLiked: false
    },
    {
        id: 7,
        image: './images/living-room.jpg',
        price: '88 000 ₽/мес.',
        description: '2-комн. кв. · 61,8м² · 4/7 этаж',
        metro: 'Коломенская',
        address: 'пр-т Андропова, 22',
        isLiked: false
    },
    {
        id: 8,
        image: './images/living-room.jpg',
        price: '78 000 ₽/мес.',
        description: '2-комн. кв. · 58,3м² · 3/6 этаж',
        metro: 'Технопарк',
        address: 'ул. Трофимова, 32',
        isLiked: false
    }
];

function createAdCard(ad) {
    const likeIcon = ad.isLiked ? './images/active-like-icon.png' : './images/like-icon.png';
    const likeClass = ad.isLiked ? 'card-like-active' : '';
    
    return `
        <div class="slick-slide">
            <div class="slick-card">
                <img class="card-image" src="${ad.image}" alt="Фото квартиры">
                <span class="card-like ${likeClass}" data-ad-id="${ad.id}">
                    <img src="${likeIcon}" alt="Лайк">
                </span>
                <span class="card-price">${ad.price}</span>
                <span class="card-description">${ad.description}</span>
                <span class="card-metro">
                    <img src="./images/metro.png" alt="Метро">${ad.metro}
                </span>
                <span class="card-address">${ad.address}</span>
            </div>
        </div>
    `;
}

function loadPopularAds() {
    const sliderContainer = document.querySelector('.slick-slider-container');
    
    if (!sliderContainer) {
        console.error('Slider container not found');
        return;
    }
    
    sliderContainer.innerHTML = '';
    
    mockAdsData.forEach(ad => {
        const adCard = createAdCard(ad);
        sliderContainer.innerHTML += adCard;
    });
    
    initSlider();
    
    initCardLikes();
}

function toggleLike(adId) {
    const ad = mockAdsData.find(item => item.id === adId);
    if (ad) {
        ad.isLiked = !ad.isLiked;
        
        const likeElement = document.querySelector(`.card-like[data-ad-id="${adId}"]`);
        const likeImg = likeElement.querySelector('img');
        
        if (ad.isLiked) {
            likeImg.src = './images/active-like-icon.png';
            likeElement.classList.add('card-like-active');
        } else {
            likeImg.src = './images/like-icon.png';
            likeElement.classList.remove('card-like-active');
        }
    }
}