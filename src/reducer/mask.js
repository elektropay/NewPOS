const mask = (state = { needMask:0 }, action) => {
    switch (action.type) {
        case 'SHOW_MASK':
            return { needMask: state.needMask+1 };
        case 'HIDE_MASK':
            return { needMask: state.needMask > 0 ? state.needMask-1:0 };
        default:
            return state
    }
}

export default mask