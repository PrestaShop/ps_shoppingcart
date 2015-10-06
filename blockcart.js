/* global $ */

$(document).ready(function () {

    function showModal (modal) {
        $(document.body).append(modal);
    }

    $('body').on('click', '#blockcart-modal', function (event) {
        if (event.target.id === 'blockcart-modal') {
            $(event.target).remove();
        }
    });

    $('body').on(
        'click',
        '[data-link-action="add-to-cart"], [data-link-action="remove-from-cart"]',
        function (event) {
            event.preventDefault();

            // First perform the action using AJAX
            var actionURL = event.target.href;
            $.post(actionURL, null, null, 'json').then(function () {
                // If succesful, refresh cart preview
                var refreshURL = $('.blockcart').data('refresh-url');
                var actionSettings = event.target.dataset;
                var requestData = {
                    id_product_attribute: actionSettings.idProductAttribute,
                    id_product: actionSettings.idProduct,
                    action: actionSettings.linkAction
                };
                $.post(refreshURL, requestData).then(function (resp) {
                    $('.blockcart').replaceWith(resp.preview);
                    if (resp.modal) {
                        showModal(resp.modal);
                    }
                });
            });
        }
    );
});
