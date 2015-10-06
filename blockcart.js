/* global $, prestashop */

$(document).ready(function () {
    prestashop.on('cart updated', function (event) {
        var refreshURL = $('.blockcart').data('refresh-url');
        var requestData = {};

        if (event && event.reason) {
            requestData = {
                id_product_attribute: event.reason.idProductAttribute,
                id_product: event.reason.idProduct,
                action: event.reason.linkAction
            };
        }

        $.post(refreshURL, requestData).then(function (resp) {
            $('.blockcart').replaceWith(resp.preview);
            if (resp.modal) {
                showModal(resp.modal);
            }
        });
    });

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
                prestashop.emit('cart updated', {
                    reason: event.target.dataset
                });
            });
        }
    );
});
