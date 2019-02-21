import { combineReducers } from 'redux'
import { createStore } from 'redux'
import restaurantHour from './restaurantHour'
import mask from './mask'

const reducer = combineReducers({
    restaurantHour,
    mask
})
const store = createStore(reducer);

export default store;
