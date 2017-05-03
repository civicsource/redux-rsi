import { jsdom } from "jsdom";

export default function() {
	// inspired by https://semaphoreci.com/community/tutorials/testing-react-components-with-enzyme-and-mocha

	beforeEach(function() {
		this.exposedProperties = ["document", "window", "navigator"];

		global.document = jsdom("");

		global.window = global.document.defaultView;

		global.navigator = {
			userAgent: "node.js"
		};

		Object.keys(document.defaultView).forEach(property => {
			if (typeof global[property] === "undefined") {
				this.exposedProperties.push(property);
				global[property] = document.defaultView[property];
			}
		});
	});

	afterEach(function() {
		this.exposedProperties.forEach(property => {
			delete global[property];
		});
	});
}
