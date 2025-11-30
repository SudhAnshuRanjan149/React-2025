// =============================================================
// React Components: Functional vs Class Components (In Detail)
// Focus on Functional Components (modern React)
// =============================================================

/**
 * ------------------------------------------------------------
 * 1) What is a Component in React?
 * ------------------------------------------------------------
 * - A component is a reusable, independent piece of UI.
 * - It returns React elements (via JSX) describing what should
 *   appear on the screen.
 * - Components receive inputs called "props" and can have state.
 *
 * Two types historically:
 *   1. Functional Components (modern, preferred)
 *   2. Class Components (older, legacy, still seen in codebases)
 *
 * Today → **Functional Components + Hooks** are standard.
 */

/* ============================================================
   2) Functional Components (Modern React Standard)
   ============================================================ */

/**
 * Functional components are:
 * - Plain JavaScript functions.
 * - Receive props as arguments.
 * - Return JSX.
 * - Use Hooks for state, effects, refs, context, memoization, etc.
 *
 * Example:
 */
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}

/**
 * -----------------------------
 * Characteristics of Functional Components
 * -----------------------------
 * 1) Simpler, cleaner syntax (just functions).
 * 2) Hooks enable:
 *      - useState() → state management
 *      - useEffect() → side effects (fetching, subscriptions)
 *      - useContext() → read context
 *      - useRef() → mutable references
 *      - useMemo(), useCallback() → performance optimizations
 *      - custom hooks → reuse logic easily
 *
 * 3) Avoid complexity of `this` binding (common class pitfalls).
 *
 * 4) Better performance optimizations:
 *      - React can skip re-renders more aggressively.
 *      - Concurrency & scheduling (React 18 features)
 *        primarily target functional components.
 *
 * 5) More composable:
 *      - Hooks let you share logic without HOCs or render props.
 *
 * 6) React recommends functional components for ALL new code.
 */

/**
 * -----------------------------
 * Functional Component with State + Effects
 * -----------------------------
 */
import { useState, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Counter updated:", count);
  }, [count]); // runs whenever count changes

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

/**
 * -----------------------------
 * Functional Component with custom hook
 * -----------------------------
 */
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}

function ShowWidth() {
  const width = useWindowWidth();
  return <p>Width: {width}px</p>;
}

/**
 * -----------------------------
 * Why Functional Components dominate modern React
 * -----------------------------
 * - Hooks replaced lifecycle methods with a unified abstraction.
 * - Class components are harder to optimize, read, test.
 * - No `this`, no binding headaches.
 * - Smaller and more expressive.
 * - Better interop with concurrent features, transitions, Suspense.
 *
 * React team officially recommends functional components for new apps.
 */

/* ============================================================
   3) Class Components (Legacy) — Still seen in older projects
   ============================================================ */

/**
 * Class Components:
 * - Use ES6 classes.
 * - Extend React.Component.
 * - Manage state with this.state and this.setState().
 * - Use lifecycle methods (componentDidMount, shouldComponentUpdate).
 * - Cannot use Hooks.
 *
 * Example:
 */
import React from "react";

class CounterClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 }
  }

  componentDidMount() {
    console.log("Mounted");
  }

  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        Count: {this.state.count}
      </button>
    );
  }
}

/**
 * -----------------------------
 * Problems with Class Components (why avoided)
 * -----------------------------
 * 1) `this` is confusing:
 *      - Methods need binding: this.handleClick = this.handleClick.bind(this)
 *      - Mistakes cause undefined values.
 *
 * 2) Lifecycle methods often become bloated:
 *      - Too much logic in componentDidMount / componentDidUpdate.
 *      - Hard to split logic across methods cleanly.
 *
 * 3) Hard to share logic:
 *      - Required HOCs, render props — messy patterns.
 *      - Hooks solved this elegantly.
 *
 * 4) Not ideal for React’s concurrent rendering.
 */

/* ============================================================
   4) Functional vs Class — Side-by-Side Comparison
   ============================================================ */

//
//  Feature / Aspect               Functional                 Class
// -----------------------------------------------------------------------------
//  Syntax                         Simple functions           ES6 classes
//  State                          useState/useReducer        this.state + setState
//  Effects                        useEffect                  componentDidMount/Update
//  Refs                           useRef                     createRef
//  Lifecycle                      Unified via hooks          Many lifecycle methods
//  Logic reuse                    Custom hooks               HOCs, render props
//  'this' binding                 None                       Required
//  Performance                    Easier to optimize         Can be harder
//  Recommended by React?          YES (default choice)       Legacy only
//

/**
 * Key interview line:
 * “Functional components are the modern React standard. They are simpler, rely on Hooks for state and lifecycle logic, allow easy logic reuse via custom hooks, and work best with React’s concurrent features. Class components are older, rely on lifecycle methods, and are no longer needed for new development.”
 */

/* ============================================================
   5) When Class Components Still Appear
   ============================================================
 * - Old codebases / enterprise projects
 * - Libraries written years ago
 * - Some legacy patterns (Error Boundaries must still use class,
 *   although React may change this in future versions)
 *
 * But: Most interviews expect functional components knowledge.
 */

/* ============================================================
   6) Mini FAQ (Interview-Ready)
   ============================================================
 *
 * Q: Why did React introduce Hooks?
 * A: To let functional components use state & lifecycle logic, avoid class complexity, and enable better logic reuse.
 *
 * Q: Can functional components replace class components completely?
 * A: Yes for almost all cases. Only Error Boundaries currently require class components.
 *
 * Q: Are functional components faster?
 * A: Yes in many cases, due to simpler instantiation & better optimization by React’s scheduler.
 *
 * Q: Do functional components re-render more?
 * A: They re-render when state/props change—React.memo/useCallback/useMemo help optimize.
 *
 */

/* ============================================================
   7) Final Interview-Ready Summary
   ============================================================
 * Functional components:
 * - Are just JS functions that return JSX.
 * - Use Hooks for state, effects, refs, context, performance.
 * - Are simpler, cleaner, faster to write, and recommended by React.
 *
 * Class components:
 * - Use ES6 classes, lifecycle methods, and this.state.
 * - More complicated and mostly legacy today.
 *
 * React prefers functional components for all new development.
 */

// ==============================
// End of Explanation
// ==============================
