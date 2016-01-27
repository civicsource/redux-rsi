import camelCase from "lodash.camelcase";
import upperFirst from "lodash.upperfirst";

export default function(type) {
	return "on" + upperFirst(camelCase(type));
}
