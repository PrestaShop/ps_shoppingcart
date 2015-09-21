document.addEventListener('readystatechange', function () {

  function interceptCartActionClick (element) {

    var actionURL = element.getAttribute('href');

    if (actionURL) {
      element.addEventListener('click', function (event) {
        // do not follow the link
        event.preventDefault();
        // add to the cart via AJAX
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', function ajaxAddToCart () {
          if (xhr.status === 200) {
            refreshCartPreview(element.dataset);
          } else {
            // TODO: error handling
            console.log('Something went wrong.');
          }
        });
        xhr.open('POST', actionURL);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
      });
    }
  }

  function getCartBlocks () {
    return document.querySelectorAll('.blockcart');
  }

  function refreshCartPreview (actionSettings) {

    function replaceCartBlocksWith (html) {
      for (var i = 0, len = cartBlocks.length; i < len; ++i) {
        cartBlocks[i].outerHTML = html;
      }

      setTimeout(function () {
        // after nodes have been updated, bind our events again
        var cartBlocks = getCartBlocks();
        for (var i = 0, len = cartBlocks.length; i < len; ++i) {
          bindToCartActionLinks(cartBlocks[i]);
        }
      }, 0);
    }

    function showModal (html) {
      var modal = document.createElement('div');
      document.body.appendChild(modal);
      modal.outerHTML = html;
      setTimeout(function () {
        var modal = document.getElementById('blockcart-modal');
        modal.addEventListener('click', function (event) {
          if (event.target.dataset.closeOnClick) {
            modal.parentNode.removeChild(modal);
          }
        });
      }, 0);
    }

    var cartBlocks = getCartBlocks();

    if (cartBlocks[0]) {
      var refreshURL = cartBlocks[0].dataset.refreshUrl;
      var xhr = new XMLHttpRequest();
      xhr.addEventListener('load', function ajaxAddToCart () {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          replaceCartBlocksWith(response.preview);
          if (response.modal) {
            showModal(response.modal);
          }
        } else {
          // TODO: error handling
          console.log('Something went wrong.');
        }
      });

      var formData = new FormData();
      formData.append('id_product_attribute', actionSettings.idProductAttribute);
      formData.append('id_product', actionSettings.idProduct);
      formData.append('action', actionSettings.linkAction);

      xhr.open('POST', refreshURL);
      xhr.send(formData);
    }
  }

  function bindToCartActionLinks (rootElement) {
    var addToCartLinks = rootElement.querySelectorAll(
      '[data-link-action="add-to-cart"], [data-link-action="remove-from-cart"]'
    );
    for (var i = 0, len = addToCartLinks.length; i < len; ++i) {
      interceptCartActionClick(addToCartLinks[i]);
    }
  }

  if (document.readyState === "interactive") {
    bindToCartActionLinks(document);
  }
});
