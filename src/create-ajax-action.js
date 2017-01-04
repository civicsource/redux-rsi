import asyncify from "./asyncify-action";

export default function createAjaxAction(actionTemplate, getPromise) {
	return (dispatch, getState) => {
		const promise = getPromise(getState);
		if (!promise) return;

		const action = asyncify(actionTemplate);

		dispatch(action.request);

		promise.then(response => {
			// setTimeout here for dispatching success so that any errors that occur during the dispatch are not
			// handled & potentially swallowed by the promise's catch. A failure should be dispatched only if the
			// AJAX request iteslf fails, not any error that occurs as a result of processing the AJAX request.
			setTimeout(() => dispatch(action.completed(response)), 0);
		}, err => {
			setTimeout(() => dispatch(action.failed(err)), 0);
		});
	};
}