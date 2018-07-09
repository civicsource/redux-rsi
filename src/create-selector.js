// https://github.com/reactjs/reselect#use-memoize-function-from-lodash-for-an-unbounded-cache

import { createSelectorCreator } from "reselect";
import { memoize } from "lodash";

const hashFn = (...args) =>
	args.reduce((acc, val) => `${acc}-${JSON.stringify(val)}`, "");

export default createSelectorCreator(memoize, hashFn);
