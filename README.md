# Redux RSI

> Reduce your risk of [repetitive strain injury](https://en.wikipedia.org/wiki/Repetitive_strain_injury) when using [Redux](https://redux.js.org/)

![rsi](rsi.jpg)

Utility & helper functions for reducing the boilerplate necessary when creating redux reducers, actions, & stores. It also includes an implementation of a [reducer registry](http://nicolasgallagher.com/redux-modules-and-code-splitting/) to aid in the creation of redux modules when composing large applications.

## Install

```
yarn add redux-rsi
```

or

```
npm install redux-rsi --save
```

## API Reference

1. [`createReducer`](#createreducerinitialstate-handlers)
2. [`createAjaxAction`](#createajaxactionaction-getpromise)
3. [`asyncifyAction`](#asyncifyactionaction)
4. [`mergeWithCurrent`](#mergewithcurrentstate-key-data-initfn)
5. [`registerReducer`](#registerreducername-reducer)
6. [`createStore`](#createstoreinitialstate-enhancer-combinefn)
7. [`resetReducers`](#resetreducers)

### `createReducer(initialState, handlers)`

As your app grows more complex, a `switch` statement in your reducer no longer cuts it when trying to handle actions. The `createReducer` function takes the initial state of your reducer and will autowire actions to the object you pass in as the `handlers` parameter. e.g. If an action of type `MessageSend` is dispatched, it will be autowired to a function with the same name with the `on` prefix applied, e.g. `onMessageSend`. Internally, it uses [lodash's string methods](https://lodash.com/docs#camelCase) to wire the methods, so dispatching with type `messageSend`, `message-send`, or `MESSAGE_SEND` will still work.

`createReducer` assumes your actions are all [Flux Standard Actions](https://github.com/acdlite/flux-standard-action). If an action handler cannot be found, the current state will be returned to the caller unmodified.

```js
import { Immutable } from "seamless-immutable"; //using seamless-immutable for immutable state in our reducer
import { createReducer } from "redux-rsi";

const users = createReducer(Immutable({
	isAuthenticating: false,
	isAuthenticated: false,
	user: null
}), {
	//this will respond to USER_AUTHENTICATE
	onUserAuthenticate(state, credentials) {
		return state.merge({
			isAuthenticating: true,
			isAuthenticated: false,
			user: null
		});
	},

	//this will respond to USER_AUTHENTICATE_COMPLETED
	onUserAuthenticateCompleted(state, user) {
		return state.merge({
			isAuthenticating: false,
			isAuthenticated: true,
			user: user
		});
	},

	handleError(state, type, err) {
		//do something nice with this error
		console.log(err);
		return state;
	}
});
```

### `createAjaxAction(action, getPromise)`

If you are using the [redux-thunk](https://github.com/gaearon/redux-thunk) middleware to make AJAX calls, you might find yourself constantly writing action creators similar to the following:

```js
export function fetchUser(username) {
	return (dispatch, getState) => {
		if (!!getState().users.get(username)) {
			//don't fetch if the user is already loaded in the current state
			return;
		}

		api.fetchUser(username) //this is a separate API lib which will make the AJAX call and return a promise
			.then(response => dispatch(fetchCompleted(response))
			.catch(err => dispatch(fetchFailed(err));

		dispatch({
			type: "USERS_FETCH",
			payload: username
		});
	};
}

function fetchCompleted(response) {
	return {
		type: "USERS_FETCH_COMPLETED",
		payload: response.body
	};
}

function fetchFailed(err) {
	return {
		type: "USERS_FETCH_FAILED",
		payload: err
	};
}
```

`createAjaxAction` will help you reduce this boilerplate when making an AJAX call:

```js
import { createAjaxAction } from "redux-rsi";

export function fetchUser(username) {
	return createAjaxAction({
		type: "USERS_FETCH",
		payload: username
	}, getState => {
		if (!!getState().users.get(username)) {
			//don't fetch if the user is already loaded in the current state
			return;
		}

		return api.fetchUser(username);
	});
}
```

The first argument is the action you want to dispatch. The action type will be used to create two new action types (one with a `_COMPLETED` appended and one with a `_FAILED` appended).

The second argument is your function that will return a `Promise`. If nothing is returned, nothing will be dispatched (e.g. in this case, if the user has already been fetched).

If you have no reason to check the current state, this example can be reduced further:

```js
export function fetchUser(username) {
	return createAjaxAction({
		type: "USERS_FETCH",
		payload: username
	}, () => api.fetchUser(username));
}
```

### `asyncifyAction(action)`

This will "asyncify" an action by returning to you the _completed_ & _failed_ action types by appending `_COMPLETED` and `_FAILED` to your original action type.

```js
import { asyncifyAction } from "redux-rsi";

const fetchActions = asyncifyAction({
	type: "USERS_FETCH",
	payload: username
});

export function fetchUser(username) {
	// assuming using redux-thunk here
	return dispatch => {
		// dispatch the original action USERS_FETCH
		dispatch(fetchActions.request);

		// simulate an ajax request & dispatch USERS_FETCH_COMPLETED after 2 seconds
		setTimeout(fetchActions.completed({ hello: "from the server" }), 2000);
		
		// ...OR...

		// simulate a failed ajax request & dispatch USERS_FETCH_FAILED after 2 seconds
		setTimeout(fetchActions.failed({ message: "error from the server" }), 2000);
	};
}
```

The _failed_ & _completed_ actions have the payload from the original action set as their `meta` (see [Flux Standard Actions](https://github.com/acdlite/flux-standard-action)).

This is what [`createAjaxAction`](#createajaxactionaction-getpromise) uses internally.

### `mergeWithCurrent(state, key, data, [initFn])`

If your state tree is a keyed object, you may find yourself writing a lot of code that looks something like this:

```js
export default createReducer(Immutable({}), {
	onSomethingHappened(state, data) {
		// first, get the current item in our state because we don't want to overwrite anything
		// if no item exists, just create an empty item
		let item = state[data.key] || initEmptyItem(data.key);

		// merge the new data from the server (while not overwriting anything the server didn't send back)
		item = item.merge(data);

		// set the new data on the state and return it
		return state.set(data.key, item);
	}
});

// our function to init an empty item
function initEmptyItem(key) {
	return Immutable({
		key,
		isLoading: false,
		isLoaded: false,
		items: []
	})
}
```

`mergeWithCurrent` will help you reduce this boilerplate:

```js
import { mergeWithCurrent } from "redux-rsi";

export default createReducer(Immutable({}), {
	onSomethingHappened(state, data) {
		return mergeWithCurrent(
			state,			//the state tree
			data.key,		//the key of the item we want to merge
			data,			//the new data to merge with any existing data
			initEmptyItem 	//an optional init function if the data doesn't already exist (if none passed, defaults to {})
		);
	}
});
```

The above two examples are equivalent. The `initFn` will receive the state `key` as its only argument.

### `registerReducer(name, reducer)`

In order to effectively encapsulate the state tree structure from the rest of your app, it is advantageous to [colocate your selector functions with your reducers](https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers). As your app grows, using this approach you will find that you end up with a massive root reducer file filled with repetetive selector functions just drilling down the state tree to child reducers. The static definition of the reducer/state tree does not scale. If you find yourself in this situation, it can help to introduce a reducer registry to implement the [redux module concept](http://randycoulman.com/blog/2018/06/12/solving-circular-dependencies-in-modular-redux/).

`registerReducer` registers a reducer function with the registry with a given name so that any selector functions defined with that reducer will know where they are located within the state tree. This effectively inverts the control of the structure of the state tree. Instead of the application consuming the reducers defining what the state tree looks like, it is the reducers themselves that are defining where they will live within the tree.

```js
// reducer.js
import { registerReducer } from "redux-rsi";

const REDUCER_NAME = "app/counter";

const reducer = (state, { type }) => {
	if (state === undefined) return 0;

	if (type === "INCREMENT") return state + 1;
	if (type === "DECREMENT") return state - 1;

	return state;
};

export default function init() {
	registerReducer(REDUCER_NAME, reducer);
}

export const getCount = state => state[REDUCER_NAME];
```

### `createStore([initialState], [enhancer], [combineFn])`

This API is meant to mirror the official [redux `createStore` API](https://redux.js.org/api-reference/createstore) except that it uses the reducers from the reducer registry rather than accepting a `reducer` parameter.

All parameters are optional and match the behavior of the [official API](https://redux.js.org/api-reference/createstore).

The `combineFn`, if specified, will override the function to use to combine the reducers together. By default, if not specified, it will use the [`combineReducers` function from redux](https://redux.js.org/api-reference/combinereducers). Depending on the needs of your app, you may want to use a different function (e.g. [`combineReducers` from _redux-seamless-immutable_](https://github.com/eadmundo/redux-seamless-immutable)).

```js
// app.js
import { createStore } from "redux-rsi";
import init, { getCount } from "./reducer"; // using the example above from registerReducer

init();
const store = createStore();

this.store.dispatch({ type: "INCREMENT" });

console.log(getCount(this.store.getState())); // 1
```

Any reducers registered after the store has been created will cause the store to reload and add the new reducers dynamically. This allows for incremental loading and code splitting of reducers.

### `resetReducers()`

After registering reducers and creating a store from those registrations, `resetReducers` will clear the reducer registry and discard any store subscriptions. This effectively disconnects any created store from listening for new reducer changes. This is only really meant to be used when writing tests for your reducers. After each test case in which you register reducers and create a store, you should call `resetReducers` to ensure the next test case will start with a clean slate.

```js
// using mocha as an example
import { createStore, resetReducers } from "redux-rsi";
import init from "./myapp/reducer";

export default function() {
	beforeEach(function() {
		init();
		this.store = createStore();
	});

	afterEach(function() {
		resetReducers();
	});

	// ... your test cases using this.store
}
```

## Contributing

Clone the repo and run `yarn` to install dependencies.

### Linting

To run the linter:

```
yarn run lint
```

and to automatically fix fixable errors:

```
yarn run lint --fix
```

### Testing

The tests are written BDD-style using [Mocha](https://mochajs.org/). To run them locally:

```
yarn test
```

To debug the tests:

```
yarn test --debug-brk
```

You can then use [Visual Studio Code](http://code.visualstudio.com/) (or whatever other debugger you desire) to debug through the tests.
