export default function createAjaxAction(action, getPromise) {
	return (dispatch, getState) => {
		const promise = getPromise(getState);
		if (!promise) return;

		//setTimeout here for dispatching success so that any errors that occur during the dispatch are not
		//handled & potentially swallowed by the promise's catch. A failure should be dispatched only if the
		//AJAX request iteslf fails, not any error that occurs as a result of processing the AJAX request.
		promise
			.then(response => setTimeout(() => dispatch(completed(response)), 0))
			.catch(err => setTimeout(() => dispatch(failed(err)), 0));

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
