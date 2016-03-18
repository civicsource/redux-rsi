export default function createAjaxAction(action, getPromise) {
	return (dispatch, getState) => {
		const promise = getPromise(getState);
		if (!promise) return;

		promise
			.catch(err => { dispatch(failed(err, action.payload)); })
			.then(response => { dispatch(completed(response, action.payload)); });

		dispatch(action);
	};

	function completed(payload, meta) {
		return {
			type: action.type + "_COMPLETED",
			payload,
			meta
		};
	}

	function failed(payload, meta) {
		return {
			type: action.type + "_FAILED",
			payload,
			meta,
			error: true
		};
	}
}
