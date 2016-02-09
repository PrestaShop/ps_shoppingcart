/* global $, prestashop */

/**
 * This module exposes an extension point in the form of the `showModal` function.
 *
 * If you want to override the way the modal window is displayed, simply define:
 *
 * prestashop.blockcart = prestashop.blockcart || {};
 * prestashop.blockcart.showModal = function myOwnShowModal (modalHTML) {
 *   // your own code
 *   // please not that it is your responsibility to handle closing the modal too
 * };
 *
 * Attention: your "override" JS needs to be included **before** this file.
 * The safest way to do so is to place your "override" inside the theme's main JS file.
 *
 */

$(document).ready(function () {
    prestashop.blockcart = prestashop.blockcart || {};

    var showModal = prestashop.blockcart.showModal || function defaultShowModal (modal) {
        $(document.body).append(modal);
        $('body').one('click', '#blockcart-modal', function (event) {
            if (event.target.id === 'blockcart-modal') {
                $(event.target).remove();
            }
        });
    }

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

    $('body').on(
      'click',
      '[data-button-action="add-to-cart"]',
      function (event) {
        event.preventDefault();
        var $form = $($(event.target).closest('form'));
        var query = $form.serialize() + '&add=1';
        var actionURL = $form.attr('action');
        $.post(actionURL, query, null, 'json').then(function (resp) {
            prestashop.emit('cart updated', {
                reason: {
                    idProduct: resp.id_product,
                    idProductAttribute: resp.id_product_attribute,
                    linkAction: 'add-to-cart'
                }
            });
        });
      }
    )
});
