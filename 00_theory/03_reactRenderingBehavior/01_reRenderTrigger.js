/* =====================================================================================================
   How Rendering Works in React — Re-render Triggers, Flow, and Deep Internal Concepts (Detailed Guide)
   =====================================================================================================

   This is a complete conceptual explanation of *how React decides to re-render* and *how rendering works*
   under the hood. This topic is heavily asked in interviews and is important for understanding performance.
*/


/* =====================================================================================================
   1) What is “Rendering” in React?
   =====================================================================================================

   Rendering = the process where React CALLS your component function to produce a NEW Virtual DOM tree.

   Rendering DOES NOT mean:
     ✖ Updating the real browser DOM  
     ✖ Drawing UI on the screen  
     ✖ Running effects  

   Rendering ONLY means:
     → React runs your component → returns JSX → forms a Virtual DOM (VDOM) description  
*/


/* =====================================================================================================
   2) Rendering Phases (Two-phase architecture)
   =====================================================================================================

   React rendering has two main phases:

   PHASE 1 — Render Phase (Pure)
     - React calls your components
     - Builds NEW VDOM
     - Pure calculation (NO DOM updates)
     - Can be paused, aborted, re-started (Concurrent mode)

   PHASE 2 — Commit Phase (Side-effects happen)
     - React updates the REAL DOM
     - Sets refs
     - Runs useLayoutEffect
     - Browser paints
     - Then runs useEffect
*/


/* =====================================================================================================
   3) What triggers a re-render in React?
   =====================================================================================================

   A component re-renders when ANY of these happen:

   1) **Its state changes**
        setState(x) or dispatch() → triggers re-render of that component.

   2) **Its props change**
        If parent re-renders and gives NEW props → child re-renders.

   3) **Its context value changes**
        Any component using useContext() re-renders when Provider’s value changes.

   4) **Parent re-renders**
        React renders children by default, even if props did not change (unless memoized).

   5) **External store changes** (React 18+)
        useSyncExternalStore detects external subscriptions.

   6) **Force Update**
        Rare, but can force re-render with special APIs in class components.

   ✔ That's it. NOTHING else causes re-renders.
*/


/* =====================================================================================================
   4) What DOES NOT trigger a re-render?
   =====================================================================================================

   ❌ Mutating a variable  
   ❌ Mutating an object/array directly  
   ❌ Updating a ref (ref.current = …)  
   ❌ Calling a function  
   ❌ Changing a value that is NOT state/props/context  

   Example:
*/
let x = 0;
x = 5;  // ❌ does NOT re-render

const ref = useRef(0);
ref.current = 10; // ❌ does NOT re-render

/*
   React ONLY reacts to:
   ✔ setState
   ✔ props from parent
   ✔ context changes  
*/


/* =====================================================================================================
   5) Step-by-step: What happens when a component re-renders?
   =====================================================================================================

   Suppose a user clicks a button:

   1) setCount(count + 1) is called  
   2) React schedules an update (may batch it)  
   3) React re-runs the component → produces NEW VDOM  
   4) React compares new VDOM with old VDOM (diffing)  
   5) If differences exist → minimal DOM updates created  
   6) DOM updates applied in Commit phase  
   7) useLayoutEffect runs  
   8) Browser paints  
   9) useEffect runs  

   Rendering → Diffing → Committing → Effects
*/


/* =====================================================================================================
   6) Why EVERY render executes the entire component function?
   =====================================================================================================

   React’s component function is **a pure function**:
      UI = f(state, props)

   On each render:
     - The entire function runs from top to bottom
     - All hooks are re-executed (but React preserves their internal state)
     - All JSX recomputed
     - All event handlers recreated (unless memoized)

   THIS IS NORMAL — React is fast because:
     - VDOM calculations are cheap
     - DOM updates are minimal (only differences applied)
*/


/* =====================================================================================================
   7) Parent Render → Child Render (Propagation Rules)
   =====================================================================================================

   When a parent component re-renders:
     ✔ All its children re-render *by default*
     ✔ Even if props didn't change
     ✔ Unless wrapped in React.memo()

   Example:
*/
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <Child /> {/* re-renders every time parent re-renders */}
    </>
  );
}

const Child = React.memo(() => {
  console.log("Child render"); // only renders if parent sends new props
  return <div>Child</div>;
});


/* =====================================================================================================
   8) Why memoization is sometimes required
   =====================================================================================================

   Without memoization:
     - new props references = child renders

   Example:
*/
<Child data={{ x: 1 }} />  // new object EVERY render → always re-renders

/*
   To prevent this:
     - useMemo for stable objects  
     - useCallback for stable functions  
     - React.memo for child components  
*/


/* =====================================================================================================
   9) Re-render vs DOM update (CRITICAL INTERVIEW DISTINCTION)
   =====================================================================================================

   Re-render = React recomputes VDOM  
   DOM update = React changes the actual DOM  

   They are NOT the same.

   React may:
     - Re-render component (VDOM changes)
     - But find no DOM differences → NO DOM updates
*/

function App() {
  const [count, setCount] = useState(0);
  return <div>Static</div>;
}
/*
   Set count → Re-render happens  
   DOM is NOT changed at all  
*/


/* =====================================================================================================
   10) Why React re-renders but avoids unnecessary DOM writes
   =====================================================================================================

   React optimizes DOM work because:
     - DOM operations are expensive  
     - JS calculations are cheap  

   So React prefers to:
     ✔ Re-run component logic (cheap)  
     ✔ Avoid DOM mutations unless necessary (expensive)  
*/


/* =====================================================================================================
   11) What about asynchronous rendering (Concurrent Mode)?
   =====================================================================================================

   In React 18+:

   - Rendering may be interrupted.
   - Rendering may be paused.
   - Rendering may be thrown away and restarted.
   - Rendering may run multiple times (for correctness).

   BUT effects and DOM commits always happen in order and are never interrupted.

   This is why render-phase MUST be pure:
     - no side effects
     - no DOM access
     - no data mutations
*/


/* =====================================================================================================
   12) Why React might double-render in development mode? (Strict Mode)
   =====================================================================================================

   In React.StrictMode:
     - React intentionally double-invokes render functions (DEV ONLY)
     - Purpose: detect unsafe side-effects in render-phase

   PRODUCTION does NOT double-render.
*/


/* =====================================================================================================
   13) Final Interview-Ready Summary
   =====================================================================================================

   ❖ A component re-renders when:
       - state changes
       - props change
       - context value changes
       - parent re-renders

   ❖ Rendering is pure — React recomputes VDOM  
   ❖ Commit phase updates real DOM and runs layout/effects  
   ❖ Parent re-renders cause child re-renders (unless memoized)  
   ❖ Re-render does NOT necessarily mean DOM update  
   ❖ React batches updates and optimizes DOM work  
   ❖ In React 18+, rendering is async, interruptible, restartable  
   ❖ StrictMode double-renders in dev to catch side-effects  
*/

