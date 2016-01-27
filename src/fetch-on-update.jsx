import React, { Component } from "react";
import shallowEqual from "react-redux/lib/utils/shallowEqual";

export default function fetchOnUpdate(keys, fn, shouldRender) {
	return DecoratedComponent => class FetchOnUpdateDecorator extends Component {
		componentWillMount() {
			fn(mapParams(keys, this.props));
		}

		componentDidUpdate (prevProps) {
			const params = mapParams(keys, this.props);
			const prevParams = mapParams(keys, prevProps);

			if (!shallowEqual(params, prevParams)) {
				fn(params);
			}
		}

		render() {
			if (shouldRender && !shouldRender(this.props)) {
				return null;
			}

			return <DecoratedComponent {...this.props} />;
		}
	}
}

function mapParams (paramKeys, params) {
	return paramKeys.reduce((acc, key) => {
		return Object.assign({}, acc, { [key]: params[key] });
	}, {});
}
