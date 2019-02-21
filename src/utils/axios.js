/**
 * 基于axios的ajax方法
 * 如果在data或config中带NOT_NEED_MASK属性，则不会产生遮罩
 * example:  axios.post("https://github.com/dashboard-feed",{data...},{NOT_NEED_MASK:true})
 */
import axios from 'axios'
import store from '../reducer'
import { common as i18n } from "../i18n/"

const instance = axios.create({
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
});

instance.interceptors.request.use(function (config) {
    if (!config.NOT_NEED_MASK && !(config.data && config.data.NOT_NEED_MASK)){
        store.dispatch({
            type: "SHOW_MASK"
        })
    }
    return config;
}, function (error) {
        store.dispatch({
            type: "HIDE_MASK"
        })
    return Promise.reject(error);
});

instance.interceptors.response.use((response) => {
    store.dispatch({
        type: "HIDE_MASK"
    })
    if (response.data.code == 0) {
        return response.data.data;
    } else {
        return Promise.reject(i18n.requestError + (response.data.info ? (i18n.colon + response.data.info) : ""));
    }
}, (error) => {
        store.dispatch({
            type: "HIDE_MASK"
        })
        return Promise.reject(i18n.badRequest);
});
export default instance;