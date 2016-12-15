import React, { Component } from "react";
import { get } from "lodash";
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

	return paramKeys.reduce((result, path) => {
		const value = get(params, path);

		// move any nested paths to the root of the result
		// for the purpose of doing a shallow comparison
		const shallowKey = path.replace(".", "_");

		return {
			...result,
			[shallowKey]: value
		};
	});
}