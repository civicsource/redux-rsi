export default function createAjaxAction(action, getPromise) {
	return (dispatch, getState) => {
		const promise = getPromise(getState);
		if (!promise) return;

		dispatch(action);

		promise.then(response => {
			// setTimeout here for dispatching success so that any errors that occur during the dispatch are not
			// handled & potentially swallowed by the promise's catch. A failure should be dispatched only if the
			// AJAX request iteslf fails, not any error that occurs as a result of processing the AJAX request.
			setTimeout(() => dispatch(completed(response, action.payload)), 0);
		}, err => {
			setTimeout(() => dispatch(failed(err, action.payload)), 0);
		});
	};

	function completed(payload, meta) {
		return {
			type: `${action.type}_COMPLETED`,
			payload,
			meta
		};
	}

	function failed(payload, meta) {
		return {
			type: `${action.type}_FAILED`,
			payload,
			meta,
			error: true
		};
	}
}
