$(document).ready(function(){
    initModals();
    initSlider();
    initCardLikes();
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
});