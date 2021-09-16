# vue-credit-card-validation

[![npm](https://img.shields.io/npm/v/vue-credit-card-validation.svg)](https://www.npmjs.com/package/vue-credit-card-validation)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

A dependency-free Vue plugin for formatting and validating credit card form fields.

A directive is provides input masking, card brand awareness, card number and expiration validation and other features to make creating payment forms a little easier for both you and your users.

[View Demo](https://wuori.github.io/vue-credit-card-validation/example/)

## Installation

Via npm:
```sh
yarn add vue-credit-card-validation
- OR -
npm install vue-credit-card-validation
```

## Using this plugin

Adding vue-credit-card-validation to your application is as simple as any other plugin:

```js
import Vue from 'vue';

import VueCardFormat from 'vue-credit-card-validation';

Vue.use(VueCardFormat);

new Vue({
  el: '#app',
});
```

The `v-cardformat` directive is now available to your app. Masks can be accessed as the arg of this directive, for example:

```html
<form>
  <div class="form-group">
    <label>Card number</label>
    <input class="form-control" v-cardformat:formatCardNumber>
  </div>
  <div class="form-group">
    <label>Card Expiry</label>
    <input class="form-control" v-cardformat:formatCardExpiry>
  </div>
  <div class="form-group">
    <label>Card CVC</label>
    <input class="form-control" v-cardformat:formatCardCVC>
  </div>
  <div class="form-group">
    <label>Numeric input</label>
    <input class="form-control" v-cardformat:restrictNumeric>
  </div>
  <button class="btn btn-primary">Submit</button>
</form>
```

View the [advanced example](https://wuori.github.io/vue-credit-card-validation/example/) to see other functionalities that can be used with this plugin.
 
For further details, see the [stripe/jquery.payment](https://github.com/stripe/jquery.payment) readme.

## Warning!

This plugin is not intended for collection credit card data directly. Instead, it is used to format and validate the supplied card information before tokenizing it (for Stripe, etc.) or otherwise storing it securely.

Using [Stripe Elements](https://stripe.com/docs/stripe-js/elements/quickstart) will offer much of the same functionality with much easier implementation and PCI compliance.

## Credits

This plugin was originally a clone of [samturrell/vue-stripe-payment](https://github.com/samturrell/vue-stripe-payment) but was rewritten to include the methods provided by [stripe/jquery-payment](https://github.com/stripe/jquery.payment).

## :copyright: License

[MIT](http://opensource.org/licenses/MIT)
