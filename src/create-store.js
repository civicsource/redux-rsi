// http://nicolasgallagher.com/redux-modules-and-code-splitting/

import { combineReducers, createStore as _createStore } from "redux";
import registry from "./registry";

export default function createStore(initialState, enhancer) {
	if (!initialState) initialState = {};

	const reducer = combine(registry.getReducers(), initialState);
	const store = _createStore(reducer, initialState, enhancer);

	// Replace the store's reducer whenever a new reducer is registered.
	registry.setChangeListener(reducers => {
		store.replaceReducer(combine(reducers));
	});

	return store;
}

// Preserve initial state for not-yet-loaded reducers
function combine(reducers, initialState) {
	if (initialState) {
		const reducerNames = Object.keys(reducers);
		Object.keys(initialState).forEach(item => {
			if (reducerNames.indexOf(item) === -1) {
				reducers[item] = (state = null) => state;
			}
		});
	}

	return combineReducers(reducers);
}
