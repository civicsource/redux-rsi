import convertActionType from "./convert-action-type";

export default function createReducer(initialState, handlers) {
	return function reducer(state = initialState, action) {
		if (!action) return state;

		const actionType = convertActionType(action.type);

		if (handlers.hasOwnProperty(actionType)) {
			return handlers[actionType](state, action.payload, action.meta);
		}

		if (action.error && handlers["handleError"]) {
			return handlers.handleError(state, action.type, action.payload, action.meta);
		}

		return state;
	};
}
