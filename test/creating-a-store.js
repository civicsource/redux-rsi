import { expect } from "chai";
import { createStore, registerReducer } from "../src";
import registry from "../src/registry";

describe("Creating a store", function() {
	const increment = () => ({ type: "INCREMENT" });
	const decrement = () => ({ type: "DECREMENT" });

	beforeEach(function() {
		registry.reset();

		this.reducer = (state, { type }) => {
			if (state === undefined) return 0;

			if (type === "INCREMENT") return state + 1;
			if (type === "DECREMENT") return state - 1;

			return state;
		};
	});

	describe("when creating a store before any reducer registrations", function() {
		beforeEach(function() {
			this.store = createStore();
		});

		it("should return an empty state", function() {
			const state = this.store.getState();
			expect(state).to.deep.equal({});
		});

		it("should still return empty state after dispatching", function() {
			this.store.dispatch(increment());
			expect(this.store.getState()).to.deep.equal({});
		});

		describe("and then registering a reducer", function() {
			beforeEach(function() {
				registerReducer("counter", this.reducer);
			});

			it("should return non-empty state", function() {
				const state = this.store.getState();
				expect(state).to.deep.equal({ counter: 0 });
			});

			it("should handle dispatches", function() {
				this.store.dispatch(increment());
				expect(this.store.getState()).to.deep.equal({ counter: 1 });
			});
		});
	});

	describe("when creating a store after reducer registrations", function() {
		beforeEach(function() {
			registerReducer("count", this.reducer);
			this.store = createStore();
		});

		it("should return non-empty state", function() {
			const state = this.store.getState();
			expect(state).to.deep.equal({ count: 0 });
		});

		it("should handle dispatches", function() {
			this.store.dispatch(decrement());
			expect(this.store.getState()).to.deep.equal({ count: -1 });
		});
	});

	describe("when creating a store with inital state before any reducer registrations", function() {
		beforeEach(function() {
			this.store = createStore({ count: 68 });
		});

		it("should return initial state", function() {
			const state = this.store.getState();
			expect(state).to.deep.equal({ count: 68 });
		});

		it("should still return initial state after dispatching", function() {
			this.store.dispatch(increment());
			expect(this.store.getState()).to.deep.equal({ count: 68 });
		});

		describe("and then registering a reducer", function() {
			beforeEach(function() {
				registerReducer("count", this.reducer);
			});

			it("should handle dispatches", function() {
				this.store.dispatch(increment());
				expect(this.store.getState()).to.deep.equal({ count: 69 });
			});
		});
	});
});
