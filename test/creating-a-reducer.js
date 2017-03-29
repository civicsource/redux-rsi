import { expect } from "chai";
import { createReducer } from "../src";

describe("Creating a reducer", function () {
	beforeEach(function () {
		this.reducer = createReducer("nothing", {
			onThingHappened(state, payload, meta) {
				return `${state}, thing happened with ${payload} & ${meta}`;
			},

			onThingFailed(state, payload, meta) {
				return `${state}, ouch the thing broke with ${payload} & ${meta}`;
			}
		});
	});

	describe("when dispatching nothing", function() {
		it("should return the initial state", function() {
			const state = this.reducer();
			expect(state).to.equal("nothing");
		});
	});

	describe("when dispatching an action the reducer does not handle", function() {
		it("should return the state unchanged", function() {
			const state = this.reducer("this is my current state", {
				type: "SOMETHING_UNRELATED"
			});

			expect(state).to.equal("this is my current state");
		});
	});

	describe("when dispatching a normal action the reducer handles", function() {
		function shouldDispatchToTheCorrectFunction(actionType) {
			it("should dispatch the action to the correct function", function() {
				const state = this.reducer("hi", {
					type: actionType,
					payload: "hello",
					meta: "world"
				});

				expect(state).to.equal("hi, thing happened with hello & world");
			});
		}

		describe("with snake case", function() {
			shouldDispatchToTheCorrectFunction("thing_happened");
		});

		describe("with upper-case snake case", function() {
			shouldDispatchToTheCorrectFunction("THING_HAPPENED");
		});

		describe("with kebab case", function() {
			shouldDispatchToTheCorrectFunction("thing-happened");
		});

		describe("with upper-case kebab case", function() {
			shouldDispatchToTheCorrectFunction("THING-HAPPENED");
		});

		describe("with camel case", function() {
			shouldDispatchToTheCorrectFunction("thingHappened");
		});

		describe("with pascal case", function() {
			shouldDispatchToTheCorrectFunction("ThingHappened");
		});
	});

	describe("when dispatching an error action the reducer handles", function() {
		beforeEach(function() {
			this.state = this.reducer("ohhai", {
				type: "THING_FAILED",
				payload: "goodbye",
				meta: "universe"
			});
		});

		it("should dispatch the action to the handler function", function() {
			expect(this.state).to.equal("ohhai, ouch the thing broke with goodbye & universe");
		});
	});
});