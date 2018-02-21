<div id="blockcart-modal" data-close-on-click="true">
  <div>
    <section>
      <h1>{l s='Errors occured during cart modification' d='Shop.Theme.Checkout'}</h1>
      <ul>
          {foreach $errors as $error}
          <li>{$error}</li>
          {/foreach}
      </ul>
    </section>
  </div>
</div>
