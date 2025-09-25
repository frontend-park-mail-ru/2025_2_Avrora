$(document).ready(function(){
    loadPopularAds();
    
    initModals();
    initAuth();
    
    $('#show-map-btn').on('click', function() {
        alert('Функция "Показать на карте" будет реализована позже');
    });
    
    $('#show-ads-btn').on('click', function() {
        alert('Функция "Показать объявления" будет реализована позже');
    });
    
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('.modal').css('display', 'none');
        }
    });
    
    $(window).on('resize', function() {
        if ($('.slick-slider-container').hasClass('slick-initialized')) {
            $('.slick-slider-container').slick('resize');
        }
    });
});

function reloadAds() {
    if ($('.slick-slider-container').hasClass('slick-initialized')) {
        $('.slick-slider-container').slick('unslick');
    }
    loadPopularAds();
}
