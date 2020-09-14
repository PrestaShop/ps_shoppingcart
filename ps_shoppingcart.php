<?php
/**
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
 */

use PrestaShop\PrestaShop\Adapter\Cart\CartPresenter;

if (!defined('_PS_VERSION_')) {
    exit;
}

use PrestaShop\PrestaShop\Core\Module\WidgetInterface;

class Ps_Shoppingcart extends Module implements WidgetInterface
{
    /**
     * @var string Name of the module running on PS 1.6.x. Used for data migration.
     */
    const PS_16_EQUIVALENT_MODULE = 'blockcart';

    public function __construct()
    {
        $this->name = 'ps_shoppingcart';
        $this->tab = 'front_office_features';
        $this->version = '2.0.4';
        $this->author = 'PrestaShop';
        $this->need_instance = 0;

        $this->bootstrap = true;
        parent::__construct();

        $this->displayName = $this->trans('Shopping cart', [], 'Modules.Shoppingcart.Admin');
        $this->description = $this->trans('Adds a block containing the customer\'s shopping cart.', [], 'Modules.Shoppingcart.Admin');
        $this->ps_versions_compliancy = ['min' => '1.7.1.0', 'max' => _PS_VERSION_];
        $this->controllers = ['ajax'];
    }

    /**
     * @return void
     */
    public function hookHeader()
    {
        if (Configuration::isCatalogMode()) {
            return;
        }

        if (Configuration::get('PS_BLOCK_CART_AJAX')) {
            $this->context->controller->registerJavascript('modules-shoppingcart', 'modules/' . $this->name . '/ps_shoppingcart.js', ['position' => 'bottom', 'priority' => 150]);
        }
    }

    /**
     * @return string
     */
    private function getCartSummaryURL()
    {
        return $this->context->link->getPageLink(
            'cart',
            null,
            $this->context->language->id,
            [
                'action' => 'show',
            ],
            false,
            null,
            true
        );
    }

    /**
     * @param string|null $hookName
     * @param array<string,mixed> $params
     *
     * @return array<string,mixed>
     */
    public function getWidgetVariables($hookName, array $params)
    {
        $cart_url = $this->getCartSummaryURL();

        return [
            'cart' => (new CartPresenter())->present(isset($params['cart']) ? $params['cart'] : $this->context->cart),
            'refresh_url' => $this->context->link->getModuleLink('ps_shoppingcart', 'ajax', [], null, null, null, true),
            'cart_url' => $cart_url,
        ];
    }

    /**
     * @param string|null $hookName
     * @param array<string,mixed> $params
     *
     * @return string
     */
    public function renderWidget($hookName, array $params)
    {
        if (Configuration::isCatalogMode()) {
            return '';
        }

        $this->smarty->assign($this->getWidgetVariables($hookName, $params));

        return $this->fetch('module:ps_shoppingcart/ps_shoppingcart.tpl');
    }

    /**
     * @param Cart $cart
     * @param int $id_product
     * @param int $id_product_attribute
     * @param int $id_customization
     *
     * @return string
     *
     * @throws Exception
     */
    public function renderModal(Cart $cart, $id_product, $id_product_attribute, $id_customization)
    {
        $data = (new CartPresenter())->present($cart);
        $product = null;
        foreach ($data['products'] as $p) {
            if ((int) $p['id_product'] == $id_product &&
                (int) $p['id_product_attribute'] == $id_product_attribute &&
                (int) $p['id_customization'] == $id_customization) {
                $product = $p;
                break;
            }
        }

        $this->smarty->assign([
            'product' => $product,
            'cart' => $data,
            'cart_url' => $this->getCartSummaryURL(),
        ]);

        return $this->fetch('module:ps_shoppingcart/modal.tpl');
    }

    /**
     * @return string
     */
    public function getContent()
    {
        $output = '';
        if (Tools::isSubmit('submitBlockCart')) {
            $ajax = Tools::getValue('PS_BLOCK_CART_AJAX');
            if ($ajax != 0 && $ajax != 1) {
                $output .= $this->displayError($this->trans('Ajax: Invalid choice.', [], 'Modules.Shoppingcart.Admin'));
            } else {
                Configuration::updateValue('PS_BLOCK_CART_AJAX', (int) ($ajax));
            }
        }

        return $output . $this->renderForm();
    }

    /**
     * @return bool
     */
    public function install()
    {
        $this->uninstallPrestaShop16Module();

        return
            parent::install()
                && $this->registerHook('header')
                && $this->registerHook('displayNav2')
                && Configuration::updateValue('PS_BLOCK_CART_AJAX', 1);
    }

    /**
     * Migrate data from 1.6 equivalent module (if applicable), then uninstall
     *
     * @return bool
     */
    public function uninstallPrestaShop16Module()
    {
        if (!Module::isInstalled(self::PS_16_EQUIVALENT_MODULE)) {
            return false;
        }
        $oldModule = Module::getInstanceByName(self::PS_16_EQUIVALENT_MODULE);
        if ($oldModule) {
            // This closure calls the parent class to prevent data to be erased
            // It allows the new module to be configured without migration
            $parentUninstallClosure = function () {
                return parent::uninstall();
            };
            $parentUninstallClosure = $parentUninstallClosure->bindTo($oldModule, get_class($oldModule));
            $parentUninstallClosure();
        }

        return true;
    }

    /**
     * @return string
     */
    public function renderForm()
    {
        $fields_form = [
            'form' => [
                'legend' => [
                    'title' => $this->trans('Settings', [], 'Admin.Global'),
                    'icon' => 'icon-cogs',
                ],
                'input' => [
                    [
                        'type' => 'switch',
                        'label' => $this->trans('Ajax cart', [], 'Modules.Shoppingcart.Admin'),
                        'name' => 'PS_BLOCK_CART_AJAX',
                        'is_bool' => true,
                        'desc' => $this->trans('Activate Ajax mode for the cart (compatible with the default theme).', [], 'Modules.Shoppingcart.Admin'),
                        'values' => [
                            [
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->trans('Enabled', [], 'Admin.Global'),
                            ],
                            [
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->trans('Disabled', [], 'Admin.Global'),
                            ],
                        ],
                    ],
                ],
                'submit' => [
                    'title' => $this->trans('Save', [], 'Admin.Actions'),
                ],
            ],
        ];

        $helper = new HelperForm();
        $helper->show_toolbar = false;
        $helper->table = $this->table;
        $lang = new Language((int) Configuration::get('PS_LANG_DEFAULT'));
        $helper->default_form_language = $lang->id;
        $helper->allow_employee_form_lang = Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG') ? Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG') : 0;

        $helper->identifier = $this->identifier;
        $helper->submit_action = 'submitBlockCart';
        $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false) . '&configure=' . $this->name . '&tab_module=' . $this->tab
        . '&module_name=' . $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->tpl_vars = [
            'fields_value' => $this->getConfigFieldsValues(),
            'languages' => $this->context->controller->getLanguages(),
            'id_language' => $this->context->language->id,
        ];

        return $helper->generateForm([$fields_form]);
    }

    /**
     * @return bool[]
     */
    public function getConfigFieldsValues()
    {
        return [
            'PS_BLOCK_CART_AJAX' => (bool) Tools::getValue('PS_BLOCK_CART_AJAX', Configuration::get('PS_BLOCK_CART_AJAX')),
        ];
    }
}
