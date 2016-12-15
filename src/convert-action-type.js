import { camelCase, upperFirst } from "lodash";

export default function(type) {
	return `on${upperFirst(camelCase(type))}`;
}
