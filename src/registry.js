// http://nicolasgallagher.com/redux-modules-and-code-splitting/

export class ReducerRegistry {
	constructor() {
		this.reset();
	}

	getReducers() {
		return { ...this.reducers };
	}

	register(name, reducer) {
		this.reducers = { ...this.reducers, [name]: reducer };
		this.onChange();
	}

	reset() {
		this.emitChange = null;
		this.reducers = {};
	}

	onChange() {
		if (this.emitChange) {
			this.emitChange(this.getReducers());
		}
	}

	setChangeListener(listener) {
		this.emitChange = listener;
	}
}

const reducerRegistry = new ReducerRegistry();
export default reducerRegistry;
