const hours = (state = [], action) => {
    switch (action.type) {
        case 'SET_HOURS':
            return action.param;

        default:
            return state
    }
}

export default hours