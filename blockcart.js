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
            refreshCartPreview();
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

  function refreshCartPreview () {
    var cartBlocks = getCartBlocks();

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

    if (cartBlocks[0]) {
      var refreshURL = cartBlocks[0].dataset.refreshUrl;
      var xhr = new XMLHttpRequest();
      xhr.addEventListener('load', function ajaxAddToCart () {
        if (xhr.status === 200) {
          replaceCartBlocksWith(xhr.responseText);
        } else {
          // TODO: error handling
          console.log('Something went wrong.');
        }
      });
      xhr.open('GET', refreshURL);
      xhr.send();
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
