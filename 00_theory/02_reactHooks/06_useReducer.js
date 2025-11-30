/* =====================================================================================================
   useReducer in React — Deep Explanation (Why, How, When to Use It Instead of useState)
   =====================================================================================================

   useReducer is a powerful hook designed for **complex state logic**, **state transitions**, and
   situations where multiple state updates depend on each other.

   It is React’s equivalent to a mini-Redux reducer inside your component.

   This guide covers:
     ✔ What useReducer is  
     ✔ How it works  
     ✔ Why it’s used instead of useState  
     ✔ Reducer pattern, dispatch, actions  
     ✔ Examples (simple → complex)  
     ✔ Best practices  
     ✔ Common pitfalls  
*/


/* =====================================================================================================
   1) What is useReducer?
   =====================================================================================================
   useReducer is a hook that manages state using a **reducer function** instead of individual setters.

   Syntax:
      const [state, dispatch] = useReducer(reducer, initialState);

   Where:
      - state     → current state
      - dispatch  → function to send actions
      - reducer   → function describing HOW state changes
*/


/* =====================================================================================================
   2) Reducer Function — Core Concept
   =====================================================================================================
   A reducer takes TWO arguments:
      reducer(state, action) → returns newState

   It is a PURE function:
     - No side effects
     - No async work inside reducer
     - No modifying existing state (immutable)
*/
function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };

    case "decrement":
      return { count: state.count - 1 };

    default:
      return state;
  }
}


/* =====================================================================================================
   3) Simple Example (Counter)
   ===================================================================================================== */
const initialState = { count: 0 };

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+1</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-1</button>
    </>
  );
}

/*
   ✔ dispatch sends an "action"
   ✔ reducer inspects action.type
   ✔ reducer returns updated state
*/


/* =====================================================================================================
   4) Why useReducer instead of useState? (VERY IMPORTANT)
   =====================================================================================================

   ❌ useState is NOT ideal when:
     - state transitions depend on previous state
     - state is an object with many fields
     - multiple events must update state consistently
     - multiple pieces of state are interdependent
     - logic becomes scattered across many setters

   ✔ useReducer is great when:
     - you want centralized state logic
     - you want predictable state transitions
     - state updates are complex or multi-step
     - your code resembles Redux-style patterns
     - you want testable logic (reducers are easy to unit-test)

   With useState:
      setCount(count + 1)
      setCount(count + 1)
      setCount(count + 1)

   With useReducer:
      dispatch({ type: "increment" })
      dispatch({ type: "increment" })
      dispatch({ type: "increment" })

   The reducer handles logic in ONE place.
*/


/* =====================================================================================================
   5) Complex Example — Todo App Logic with useReducer
   ===================================================================================================== */

const todoInitial = { todos: [] };

function todoReducer(state, action) {
  switch (action.type) {
    case "add":
      return {
        ...state,
        todos: [...state.todos, { id: Date.now(), text: action.text }],
      };

    case "remove":
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.id),
      };

    case "clear":
      return { ...state, todos: [] };

    default:
      return state;
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, todoInitial);

  return (
    <>
      <button onClick={() => dispatch({ type: "add", text: "New Task" })}>
        Add
      </button>

      <button onClick={() => dispatch({ type: "clear" })}>
        Clear
      </button>

      <ul>
        {state.todos.map(t => (
          <li key={t.id}>
            {t.text}{" "}
            <button onClick={() => dispatch({ type: "remove", id: t.id })}>
              ❌
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

/*
   ✔ All logic is centralized
   ✔ Adding/removing/clearing todos uses consistent rules
   ✔ Reproducible and testable (like Redux)
*/


/* =====================================================================================================
   6) useReducer with lazy initialization (optimization)
   ===================================================================================================== */
function init(initialCount) {
  return { count: initialCount };
}

function reducer2(state, action) {
  switch (action.type) {
    case "reset":
      return init(action.payload);
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer2, 0, init);

/*
   Lazy initialization is used when:
   - computing initial state is expensive
   - you want custom initialization logic
*/


/* =====================================================================================================
   7) State Immutability — HUGE concept
   =====================================================================================================
   Reducers MUST be immutable.

   ❌ WRONG:
      state.count++
      return state

   ✔ RIGHT:
      return { ...state, count: state.count + 1 }
*/


/* =====================================================================================================
   8) Common Pitfalls + How to Avoid Them
   ===================================================================================================== */

/*
   PITFALL 1 — Doing side effects inside reducer
   ❌ WRONG:
      reducer(state, action) {
        fetch()...
      }

   ✔ FIX:
      Side effects belong inside useEffect, not reducer.
*/


/*
   PITFALL 2 — Forgetting to return state by default
*/
function reducerBad(state, action) {
  if (action.type === "add") return { ...state, x: 1 };
  // ❌ returns undefined — causes crash
}

/*
   FIX:
      Always return state in default case
*/


/*
   PITFALL 3 — Bloated reducer
   - Too many cases in one giant reducer
   - Hard to maintain
   FIX:
      Split reducers or organize actions more cleanly
*/


/* =====================================================================================================
   9) When to choose useReducer vs useState (interview-ready)
   =====================================================================================================

   Use **useState** when:
     ✔ State is simple (boolean, string, number)
     ✔ Updates are straightforward
     ✔ No complex transitions

   Use **useReducer** when:
     ✔ State has multiple related fields
     ✔ Complex update logic
     ✔ Many actions modify state
     ✔ You want centralized state logic
     ✔ You want testable state transitions
     ✔ You want Redux-like behavior
*/


/* =====================================================================================================
   10) Performance Notes
   =====================================================================================================
   - dispatch is stable (its reference NEVER changes)
   - state updates may still cause re-renders (like useState)
   - useReducer does NOT inherently improve performance
   - Reducer helps with organization and predictability, not raw speed
*/


/* =====================================================================================================
   11) Final Interview Summary (One-Liner)
   =====================================================================================================
   “useReducer is an alternative to useState for complex state logic. Instead of multiple setters,
    it centralizes updates into a reducer function that receives actions and returns the next state.
    It is ideal for complex transitions, related state fields, and testable state logic, similar to Redux
    but scoped to a component.”
*/

