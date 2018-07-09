// http://nicolasgallagher.com/redux-modules-and-code-splitting/

import { combineReducers, createStore as _createStore } from "redux";
import registry from "./registry";

export default function createStore(
	initialState,
	enhancer,
	combineFn = combineReducers
) {
	// Preserve initial state for not-yet-loaded reducers
	const combine = reducers => {
		if (initialState) {
			const reducerNames = Object.keys(reducers);
			Object.keys(initialState).forEach(item => {
				if (reducerNames.indexOf(item) === -1) {
					reducers[item] = (state = null) => state;
				}
			});
		}

		return combineFn(reducers);
	};

	const reducer = combine(registry.getReducers());
	const store = _createStore(reducer, initialState, enhancer);

	// Replace the store's reducer whenever a new reducer is registered.
	registry.setChangeListener(reducers => {
		store.replaceReducer(combine(reducers));
	});

	return store;
}
