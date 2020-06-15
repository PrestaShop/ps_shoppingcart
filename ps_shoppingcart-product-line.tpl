{**
 * 2007-2020 PrestaShop and Contributors
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License 3.0 (AFL-3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2020 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 * International Registered Trademark & Property of PrestaShop SA
 *}
<span class="product-quantity">{$product.quantity}</span>
<span class="product-name">{$product.name}</span>
<span class="product-price">{$product.price}</span>
<a  class="remove-from-cart"
    rel="nofollow"
    href="{$product.remove_from_cart_url}"
    data-link-action="remove-from-cart"
>
    {l s="Remove" d="Shop.Theme.Actions"}
</a>
{if $product.customizations|count}
    <div class="customizations">
        <ul>
            {foreach from=$product.customizations item="customization"}
                <li>
                    <span class="product-quantity">{$customization.quantity}</span>
                    <a href="{$customization.remove_from_cart_url}" class="remove-from-cart" rel="nofollow">{l s='Remove' d="Shop.Theme.Actions"}</a>
                    <ul>
                        {foreach from=$customization.fields item="field"}
                            <li>
                                <label>{$field.label}</label>
                                {if $field.type == 'text'}
                                    <span>{$field.text}</span>
                                {elseif $field.type == 'image'}
                                    <img src="{$field.image.small.url}">
                                {/if}
                            </li>
                        {/foreach}
                    </ul>
                </li>
            {/foreach}
        </ul>
    </div>
{/if}
