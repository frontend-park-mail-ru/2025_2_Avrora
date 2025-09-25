function initSlider() {
    $('.slick-slider-container').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            { breakpoint: 1500, settings: { slidesToShow: 3 } },
            { breakpoint: 1000, settings: { slidesToShow: 2 } },
            { breakpoint: 500, settings: { slidesToShow: 1 } }
        ]
    });
}

function initCardLikes() {
    $('body').on('click', '.card-like', function() {
        const $like = $(this);
        const $img = $like.find('img');
        const isActive = $img.attr('src').includes('active-like-icon.png');
        
        $img.attr('src', isActive ? 
                  './images/like-icon.png' : 
                  './images/active-like-icon.png'
        );
        
        $like.toggleClass('card-like-active', !isActive);
    });
}