import { default as format } from './format.js';

const VueCardFormat = {
  install(vue, opts) {
    // provide plugin to Vue
    vue.prototype.$cardFormat = format;
    // provide directive
    vue.directive('cardformat', {
      bind(el, binding, vnode) {
        // see if el is an input
        if (el.nodeName.toLowerCase() !== 'input'){
          el = el.querySelector('input');
        }
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

export default VueCardFormat;

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueCardFormat)
}
