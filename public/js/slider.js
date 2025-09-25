function initSlider() {
    if ($('.slick-slider-container').hasClass('slick-initialized')) {
        $('.slick-slider-container').slick('unslick');
    }
    
    $('.slick-slider-container').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        dots: true,
        arrows: true,
        responsive: [
            { 
                breakpoint: 1200, 
                settings: { 
                    slidesToShow: 3,
                    slidesToScroll: 1
                } 
            },
            { 
                breakpoint: 768, 
                settings: { 
                    slidesToShow: 2,
                    slidesToScroll: 1
                } 
            },
            { 
                breakpoint: 480, 
                settings: { 
                    slidesToShow: 1,
                    slidesToScroll: 1
                } 
            }
        ]
    });
}

function initCardLikes() {
    $('body').off('click', '.card-like');
    
    $('body').on('click', '.card-like', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const adId = parseInt($(this).data('ad-id'));
        if (adId) {
            toggleLike(adId);
        }
    });
}
