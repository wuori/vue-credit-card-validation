import { default as format } from './format.js';

const cardFormat = {
  install(vue, opts) {
    // provide plugin to Vue
    Vue.prototype.$cardFormat = format;
    // provide directive
    vue.directive('cardformat', {
      bind(el, binding, vnode) {
        // call format function from prop
        let method = Object.keys(format).find((key) => key.toLowerCase() === binding.arg.toLowerCase());
        format[method](el, vnode);
        // update cardBrand value if available
        if (method == 'formatCardNumber' && typeof vnode.context.cardBrand !== 'undefined'){
          el.addEventListener('keyup', () => {
            if (el.dataset.cardBrand) {
              vnode.context.cardBrand = el.dataset.cardBrand;
            };
          })
        }
      }
    })  
  }
}

export default cardFormat;

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(cardFormat)
}
