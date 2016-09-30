import Immutable from "seamless-immutable";

export default function mergeWithCurrent(state, key, data, initFn) {
	initFn = initFn || (() => Immutable({}));

	const current = state[key] || initFn();

	return state.set(key, current.merge(data));
}