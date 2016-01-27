import convertActionType from "./convert-action-type";

export default function createReducer(initialState, handlers) {
	return function reducer(state = initialState, action) { // jshint ignore:line
		const actionType = convertActionType(action.type);

		if (handlers.hasOwnProperty(actionType)) {
			return handlers[actionType](state, action.payload);
		}

		return state;
	};
}
