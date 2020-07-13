import { default as cards } from './cards.js';
import { default as validation } from './validation.js';

const cardFormatUtils = {

    cardFromNumber : function (num) {
        num = (num + '').replace(/\D/g, '');
        for (let i in cards) {
            for (let j in cards[i].patterns) {
                let p = cards[i].patterns[j] + '';
                if (num.substr(0, p.length) === p) { return cards[i]; }
            }
        }
    },

    cardFromType: function (type) {
        for (let i in cards) { if (cards[i].type === type) { return cards[i]; } }
    },

    luhnCheck: function (num) {
        let odd = true;
        let sum = 0;

        let digits = (num + '').split('').reverse();

        for (let i in digits) {
            let digit = parseInt(digits[i], 10);
            if (odd = !odd) { digit *= 2; }
            if (digit > 9) { digit -= 9; }
            sum += digit;
        }

        return (sum % 10) === 0;
    },

    hasTextSelected: function (target) {
        // If some text is selected
        if ((target.selectionStart != null) &&
            (target.selectionStart !== target.selectionEnd)) { return true; }

        // If some text is selected in IE
        if (cardFormatUtils.__guard__(typeof document !== 'undefined' && document !== null ? document.selection : undefined, x => x.createRange) != null) {
            if (document.selection.createRange().text) { return true; }
        }

        return false;
    },

    // Private

    // Safe Val

    safeVal: function (value, target, e) {
        if (e.inputType === 'deleteContentBackward') {
          return;
        }
        let cursor;
        try {
            cursor = target.selectionStart;
        } catch (error) {
            cursor = null;
        }
        let last = target.value;
        target.value = value;
        value = target.value;
        if ((cursor !== null) && document.activeElement == target) {
            if (cursor === last.length) { cursor = target.value.length; }

            // This hack looks for scenarios where we are changing an input's value such
            // that "X| " is replaced with " |X" (where "|" is the cursor). In those
            // scenarios, we want " X|".
            //
            // For example:
            // 1. Input field has value "4444| "
            // 2. User types "1"
            // 3. Input field has value "44441| "
            // 4. Reformatter changes it to "4444 |1"
            // 5. By incrementing the cursor, we make it "4444 1|"
            //
            // This is awful, and ideally doesn't go here, but given the current design
            // of the system there does not appear to be a better solution.
            //
            // Note that we can't just detect when the cursor-1 is " ", because that
            // would incorrectly increment the cursor when backspacing, e.g. pressing
            // backspace in this scenario: "4444 1|234 5".
            if (last !== value) {
                let prevPair = last.slice(cursor - 1, +cursor + 1 || undefined);
                let currPair = target.value.slice(cursor - 1, +cursor + 1 || undefined);
                let digit = value[cursor];
                if (/\d/.test(digit) &&
                    (prevPair === `${digit} `) && (currPair === ` ${digit}`)) { cursor = cursor + 1; }
            }

            target.selectionStart = cursor;
            return target.selectionEnd = cursor;
        }
    },

    // Replace Full-Width Chars

    replaceFullWidthChars: function (str) {
        if (str == null) { str = ''; }
        let fullWidth = '\uff10\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19';
        let halfWidth = '0123456789';

        let value = '';
        let chars = str.split('');

        // Avoid using reserved word `char`
        for (let i in chars) {
            let idx = fullWidth.indexOf(chars[i]);
            if (idx > -1) { 
                chars[i] = halfWidth[idx]; 
            }
            value += chars[i];
        }

        return value;
    },

    // Format Numeric

    reFormatNumeric: function (e) {
        let target = e.currentTarget;
        return setTimeout(function () {
            let value = target.value;
            value = cardFormatUtils.replaceFullWidthChars(value);
            value = value.replace(/\D/g, '');
            return cardFormatUtils.safeVal(value, target, e);
        });
    },

    // Format Card Number

    reFormatCardNumber: function (e) {
        let target = e.currentTarget;
        return setTimeout(() => {
            let value = target.value;
            value = cardFormatUtils.replaceFullWidthChars(value);
            value = validation.formatCardNumber(value);
            return cardFormatUtils.safeVal(value, target, e);
        });
    },

    formatCardNumber: function (e) {
        // Only format if input is a number
        let re;
        let digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) { return; }

        let target = e.currentTarget;
        let value = target.value;
        let card = cardFormatUtils.cardFromNumber(value + digit);
        let length = (value.replace(/\D/g, '') + digit);

        let upperLength = 16;
        if (card) { upperLength = card.length[card.length.length - 1]; }
        if (length >= upperLength) { return; }

        // Return if focus isn't at the end of the text
        if ((target.selectionStart != null) &&
            (target.selectionStart !== value.length)) { return; }

        if (card && (card.type === 'amex')) {
            // AMEX cards are formatted differently
            re = /^(\d{4}|\d{4}\s\d{6})$/;
        } else {
            re = /(?:^|\s)(\d{4})$/;
        }

        // If '4242' + 4
        if (re.test(value + digit)) {
            e.preventDefault();
            return setTimeout(() => target.value = value + ' ' + digit);

            // If '424' + 2
        } else if (re.test(value + digit)) {
            e.preventDefault();
            return setTimeout(() => target.value = value + digit + ' ');
        }

    },

    formatBackCardNumber: function (e) {
        let target = e.currentTarget;
        let value = target.value;

        // Return unless backspacing
        if (e.which !== 8) { return; }

        // Return if focus isn't at the end of the text
        if ((target.selectionStart != null) &&
            (target.selectionStart !== value.length)) { return; }

        // Remove the digit + trailing space
        if (/\d\s$/.test(value)) {
            e.preventDefault();
            return setTimeout(() => target.value = value.replace(/\d\s$/, ''));
            // Remove digit if ends in space + digit
        } else if (/\s\d?$/.test(value)) {
            e.preventDefault();
            return setTimeout(() => target.value = value.replace(/\d$/, ''));
        }
    },

    // Format Expiry

    reFormatExpiry: function (e) {
        let target = e.currentTarget;
        return setTimeout(function () {
            let value = target.value;
            value = cardFormatUtils.replaceFullWidthChars(value);
            value = validation.formatExpiry(value);
            return cardFormatUtils.safeVal(value, target, e);
        });
    },

    formatExpiry: function (e) {
        // Only format if input is a number
        let digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) { return; }

        let target = e.currentTarget;
        let val = target.value + digit;

        if (/^\d$/.test(val) && !['0', '1'].includes(val)) {
            e.preventDefault();
            return setTimeout(() => target.value = (`0${val} / `));

        } else if (/^\d\d$/.test(val)) {
            e.preventDefault();
            return setTimeout(function () {
                // Split for months where we have the second digit > 2 (past 12) and turn
                // that into (m1)(m2) => 0(m1) / (m2)
                let m1 = parseInt(val[0], 10);
                let m2 = parseInt(val[1], 10);
                if ((m2 > 2) && (m1 !== 0)) {
                    return target.value = (`0${m1} / ${m2}`);
                } else {
                    return target.value = (`${val} / `);
                }
            });
        }
    },

    formatForwardExpiry: function (e) {
        let digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) { return; }

        let target = e.currentTarget;
        let val = target.value;

        if (/^\d\d$/.test(val)) {
            return target.value = (`${val} / `);
        }
    },

    formatForwardSlashAndSpace: function (e) {
        let which = String.fromCharCode(e.which);
        if ((which !== '/') && (which !== ' ')) { return; }

        let target = e.currentTarget;
        let val = target.value;

        if (/^\d$/.test(val) && (val !== '0')) {
            return target.value = (`0${val} / `);
        }
    },

    formatBackExpiry: function (e) {
        let target = e.currentTarget;
        let value = target.value;

        // Return unless backspacing
        if (e.which !== 8) { return; }

        // Return if focus isn't at the end of the text
        if ((target.selectionStart != null) &&
            (target.selectionStart !== value.length)) { return; }

        // Remove the trailing space + last digit
        if (/\d\s\/\s$/.test(value)) {
            e.preventDefault();
            return setTimeout(() => target.value = value.replace(/\d\s\/\s$/, ''));
        }
    },

    // Adds maxlength to Expiry field
    handleExpiryAttributes: function(e){
        e.setAttribute('maxlength', 9);
    },

    // Format CVC
    reFormatCVC: function (e) {
        let target = e.currentTarget;
        return setTimeout(function () {
            let value = target.value;
            value = cardFormatUtils.replaceFullWidthChars(value);
            value = value.replace(/\D/g, '').slice(0, 4);
            return cardFormatUtils.safeVal(value, target, e);
        });
    },

    // Restrictions
    restrictNumeric: function (e) {

        // Key event is for a browser shortcut
        if (e.metaKey || e.ctrlKey) { return true; }

        // If keycode is a space
        if (e.which === 32) { return false; }

        // If keycode is a special char (WebKit)
        if (e.which === 0) { return true; }

        // If char is a special char (Firefox)
        if (e.which < 33) { return true; }

        let input = String.fromCharCode(e.which);

        // Char is a number or a space
        return (!!/[\d\s]/.test(input)) ? true : e.preventDefault();
    },

    restrictCardNumber: function (e) {
        let target = e.currentTarget;
        let digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) { return; }
        if (cardFormatUtils.hasTextSelected(target)) { return; }
        // Restrict number of digits
        let value = (target.value + digit).replace(/\D/g, '');
        let card = cardFormatUtils.cardFromNumber(value);

        if (card) {
            return value.length <= card.length[card.length.length - 1];
        } else {
            // All other cards are 16 digits long
            return value.length <= 16;
        }
    },

    restrictExpiry: function (e) {
        let target = e.currentTarget;
        let digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) { return; }

        if (cardFormatUtils.hasTextSelected(target)) { return; }

        let value = target.value + digit;
        value = value.replace(/\D/g, '');

        if (value.length > 6) { return false; }
    },

    restrictCVC: function (e) {
        let target = e.currentTarget;
        let digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) { return; }

        if (cardFormatUtils.hasTextSelected(target)) { return; }

        let val = target.value + digit;
        return val.length <= 4;
    },

    setCardType: function (e) {
        
        let target = e.currentTarget;
        let val = target.value;
        let cardType = validation.cardType(val) || 'unknown';

        if (target.className.indexOf(cardType) === -1) {
            
            let allTypes = [];
            for(let i in cards){
                allTypes.push(cards[i].type);
            }

            target.classList.remove('unknown');
            target.classList.remove('identified');
            target.classList.remove(... allTypes);
            target.classList.add(cardType);
            target.dataset.cardBrand = cardType;
            
            if(cardType !== 'unknown'){
                target.classList.add('identified');
            }

        }
    },

    __guard__: function (value, transform) {
        return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
    }

};

export default cardFormatUtils;