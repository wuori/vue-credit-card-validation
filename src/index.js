import { default as format } from './format.js';

const VueCardFormat = {
  install(vue, opts) {
    // provide plugin to Vue
    if ( typeof vue.prototype !== 'undefined' ) {
      vue.prototype.$cardFormat = format;
    } else {
      // vue 3.0+
      vue.config.globalProperties.$cardFormat = format; 
    }
    // provide directive
    vue.directive('cardformat', {
      beforeMount(el, binding, vnode) {
        // see if el is an input
        if (el.nodeName.toLowerCase() !== 'input'){
          el = el.querySelector('input');
        }
        // call format function from prop
        let method = Object.keys(format).find((key) => key.toLowerCase() === binding.arg.toLowerCase());
        format[method](el, vnode);
        // update cardBrand value if available
        if (method == 'formatCardNumber' && typeof binding.instance.cardBrand !== 'undefined'){
          el.addEventListener('keyup', () => {
            if (el.dataset.cardBrand) {
              binding.instance.cardBrand = el.dataset.cardBrand;
            };
          })
        }
      }
    })  
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueCardFormat)
}

export default VueCardFormat;
