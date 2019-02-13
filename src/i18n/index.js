import WELCOME from './welcome';
import LAYOUT from './layout';

const locale = "zh_cn";

function getLocale(locales){
    Object.keys(locales).forEach(function(key){
        locales[key] = locales[key][locale]
    });
    return locales;
}

export const welcome = getLocale(WELCOME);
export const layout = getLocale(LAYOUT);
