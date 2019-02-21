/**
 * 对于多处用到的数据，可以存入redux中
 * 子页面需要按照原有逻辑去请求数据，得到返回后修改redux store
 * 避免请求未返回时，页面展示空白
 */
import { combineReducers } from 'redux'
import { createStore } from 'redux'
import mask from './mask'
import restaurantHour from './restaurantHour'

const reducer = combineReducers({
    mask,
    restaurantHour
})
const store = createStore(reducer);

export default store;
