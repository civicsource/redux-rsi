export default function createAjaxAction(action, getPromise) {
	return (dispatch, getState) => {
		const promise = getPromise(getState);
		if (!promise) return;

		promise
			.then(response => dispatch(completed(response)))
			.catch(err => dispatch(failed(err)));

		dispatch(action);
	};

	function completed(response) {
		return {
			type: action.type + "_COMPLETED",
			payload: response.body
		};
	}

	function failed(err) {
		return {
			type: action.type + "_FAILED",
			payload: err
		};
	}
}
