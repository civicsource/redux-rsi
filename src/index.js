import registry from "./registry";

export const registerReducer = registry.register.bind(registry);

export createReducer from "./create-reducer";
export mergeWithCurrent from "./merge-with-current";

export asyncifyAction from "./asyncify-action";
export createAjaxAction from "./create-ajax-action";

export createStore from "./create-store";
