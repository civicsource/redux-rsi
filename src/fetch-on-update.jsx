import React, { Component } from "react";
import shallowEqual from "shallowequal";

export default function fetchOnUpdate(fn, ...keys) {
	return DecoratedComponent => class FetchOnUpdateDecorator extends Component {
		componentWillMount() {
			fn(this.props);
		}

		componentDidUpdate (prevProps) {
			const params = mapParams(keys, this.props);
			const prevParams = mapParams(keys, prevProps);

			if (!shallowEqual(params, prevParams)) {
				fn(this.props);
			}
		}

		render() {
			return <DecoratedComponent {...this.props} />;
		}
	};
}

function mapParams (paramKeys, params) {
	if (paramKeys.length < 1) return params;

	return paramKeys.reduce((acc, key) => {
		return Object.assign({}, acc, { [key]: params[key] });
	}, {});
}
