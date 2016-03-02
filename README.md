# Redux

> [Redux](http://rackt.org/redux/) utility functions to help implement CivicSource conventions

If you are new to Redux, [start with the documentation](https://facebook.github.io/flux/docs/overview.html) (the _Introduction_ & the _Basics_).

## Install

Make sure you have the [CivicSource private npm registry](https://github.com/civicsource/first-time-setup#civicsource-npm-feed) set up.

```
npm install @civicsource/redux --save
```

## API Reference

### `createReducer(initialState, handlers)`

As your app grows more complex, a `switch` statement in your reducer no longer cuts it when trying to handle actions. The `createReducer` function takes the initial state of your reducer and will autowire actions to the object you pass in as the `handlers` parameter. e.g. If an action of type `MessageSend` is dispatched, it will be autowired to a function with the same name with the `on` prefix applied, e.g. `onMessageSend`. Internally, it uses [lodash's string methods](https://lodash.com/docs#camelCase) to wire the methods, so dispatching with type `messageSend`, `message-send`, or `MESSAGE_SEND` will still work.

```js
import { Map } from "immutable"; //using immutable.js for immutable state in our reducer
import { createReducer } from "@civicsource/redux";

const users = createReducer(Map({
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
	}
});
```

### `fetchOnUpdate(keys, fn, shouldRender)`

This is a HoC (higher order component) that will reduce the amount of boilerplate you need when writing a component that will need to do data fetching on load. In general, you should strive to separate your components into [presentational & container components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0). In doing this, you can cleanly separate your presentation logic from your data-fetching logic. Here is an example:

#### `user.js`

```js
import React, { Component, PropTypes as t } from "react";

export default class UserProfile extends Component {
    render() {
        const user = this.props.user;

        if (user.isLoading) {
            return <span>Loading...</span>;
        }

        return <span title={user.username}>{user.email}</span>;
    }
}

UserProfile.propTypes = {
    user: t.object.isRequired
};
```

This is a simple component that will display user information given a user object. We can use this in places where we already have the user object loaded and not have to worry about any unwanted network requests. However, there are a lot of places where we don't have the user object loaded (we just have a username or user ID) deep in the component tree and we also want to show user information. We can solve this by also including a "containerized" version of this component which wraps the component and takes a username to fetch the `User` and pass it down to the original component.

TODO: more docs on this

#### `user-container.js`

```js
import React, { Component, PropTypes as t } from "react";
import { fetchOnUpdate } from "@civicsource/redux";
import MainComponent from "./user"; //the presenational user component
import { fetchUser } from "./actions/user"; //the redux action creator we will use to fire off a fetchUser action
import { connect } from "react-redux"; //we will use this to connect this component to the store state

const FetchingComponent = fetchOnUpdate(["username", "fetchUser"], props => {
	props.fetchUser(props.username);
}, props => !!props.user)(MainComponent);

FetchingComponent.propTypes = {
	fetchUser: t.func.isRequired,
	username: t.string.isRequired
};

const ContainerComponent = connect((state, props) => {
	var usr = state.users.get(props.username);
	return {
		user: state.users.get(props.username)
	};
}, dispatch => {
	return {
		fetchUser: username => dispatch(fetchUser(username))
	};
})(FetchingComponent);

ContainerComponent.propTypes = {
	username: t.string.isRequired
};

export default ContainerComponent;
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
import { createAjaxAction } from "@civicsource/redux";

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
