export default function asyncifyAction(action) {
	return {
		request: action,
		completed: response => ({
			type: `${action.type}_COMPLETED`,
			payload: response,
			meta: action.payload // the original payload
		}),
		failed: err => ({
			type: `${action.type}_FAILED`,
			payload: err,
			meta: action.payload, // the original payload
			error: true
		})
	};
}