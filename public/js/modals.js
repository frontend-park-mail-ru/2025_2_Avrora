function initModals() {
    $('body').on('click', '.modal-btn', function() {
        const modalName = $(this).data('modal');
        $(`.modal[data-modal="${modalName}"]`).css('display', 'block');
    });
    
    $('body').on('click', '.modal .close', function() {
        $(this).closest('.modal').css('display', 'none');
    });
    
    $('body').on('click', '.modal', function(event) {
        if (event.target === this) {
            $(this).css('display', 'none');
        }
    });
    
    $('body').on('click', '.password-control', function(){
        const $passwordBlock = $(this).closest('.password');
        const $input = $passwordBlock.find('input');
        const isPassword = $input.attr('type') === 'password';
        
        $(this).toggleClass('view', !isPassword);
        $input.attr('type', isPassword ? 'text' : 'password');
        
        return false;
    });
}