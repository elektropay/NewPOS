// common中包含一些常用字段，会包含在在各语言模块中导出
import Common from './common'
import Welcome from './welcome';
import Layout from './layout';
import Restaurant from './restaurant';
import DeliveryArea from './deliveryArea'
import GalleryTransporter from './galleryTransporter'

const locale = window.storage.getItem("locale") || "zh_cn";
const localeDefault = "en";

export const welcome = getLocale(Welcome);
export const layout = getLocale(Layout);
export const restaurant = getLocale(Restaurant);
export const deliveryArea = getLocale(DeliveryArea)
export const galleryTransporter = getLocale(GalleryTransporter)

function getLocale(locales) {
    var lan = Object.assign({}, Common, locales);
    Object.keys(lan).forEach(function (key) {
        lan[key] = lan[key][locale] || lan[key][locale.replace(/-/i, "_")] || lan[key][locale.replace(/_/i, "-")] || lan[key][localeDefault]
    });
    return lan;
}