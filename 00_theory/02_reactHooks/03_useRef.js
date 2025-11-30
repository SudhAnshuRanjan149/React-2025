/* ====================================================================================================
   useRef in React — DOM Refs vs Storing Mutable Values (Deep, Interview-Level Explanation)
   ====================================================================================================

   useRef is one of the most misunderstood React hooks. It has TWO major uses:
   1) Accessing DOM elements (DOM refs)
   2) Storing mutable values that survive re-renders (mutable refs)

   Both use the SAME hook, but their behavior + purpose are VERY different.
*/


/* ====================================================================================================
   1) What is useRef?
   ====================================================================================================
   useRef creates a **mutable object** with a single property `.current`.

   Example:
*/
const myRef = useRef(initialValue);

/*
   - myRef = { current: initialValue }
   - The object returned by useRef **NEVER changes its identity between renders**.
   - Updating myRef.current **does NOT trigger a re-render**.
*/


/* ====================================================================================================
   2) useRef #1 — DOM REFS (Accessing DOM Elements)
   ====================================================================================================
   This is the most common use case.

   Goal:
   - Imperatively access DOM nodes (e.g., focus input, measure div size, scroll div).
   - NOT used for state.

   Example:
*/
function InputFocus() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus(); // Access the actual DOM element
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>Focus Input</button>
    </>
  );
}

/*
   KEY points:
   ✔ ref={myRef} attaches the DOM node to myRef.current
   ✔ React sets inputRef.current = <input DOM element>
   ✔ DOM refs are assigned at **commit phase**, not during render
   ✔ Useful for: focus(), scroll(), measurements, animations, canvas, video, etc.
*/


/* ====================================================================================================
   3) useRef #2 — Storing Mutable Values (NOT DOM)
   ====================================================================================================
   A ref can store any value that you want to persist across renders WITHOUT causing re-renders.

   Example: store previous value
*/
function RenderCounter() {
  const countRef = useRef(0);

  useEffect(() => {
    countRef.current += 1;
  });

  return <p>Rendered {countRef.current} times</p>;
}

/*
   IMPORTANT:
   - Updating countRef.current does NOT cause a re-render.
   - It behaves like a box that you can mutate freely.
   - Great for:
       ✔ storing values between renders  
       ✔ storing timers  
       ✔ storing previous props/state  
       ✔ storing large objects or caches  
       ✔ avoiding re-renders caused by useState  
*/


/* ====================================================================================================
   4) Why useRef does NOT cause re-render (important concept)
   ====================================================================================================
   - React triggers re-renders ONLY when state or props change.
   - useRef gives you a mutable object that React ignores.

   So:
      setState → causes re-render
      ref.current change → DOES NOT re-render
*/


/* ====================================================================================================
   5) DOM Refs vs Mutable Refs (Side-by-side comparison)
   ====================================================================================================

   | Feature                          | DOM Ref                                 | Mutable Value Ref                       |
   |----------------------------------|-------------------------------------------|---------------------------------------|
   | Purpose                          | Access DOM elements                       | Persist data across renders           |
   | set via "ref" attribute?         | YES: <input ref={ref} />                  | NO                                    |
   | Holds DOM node?                  | YES                                       | NO (stores any JS value)              |
   | Triggers re-render when changed? | NO                                        | NO                                    |
   | When updated?                    | After commit phase                        | Anytime                               |
   | Example use                      | focus(), measure element                  | storing prev state, timers, counters  |


/* ====================================================================================================
   6) Example: Timer stored in ref (common interview example)
   ====================================================================================================
*/
function Timer() {
  const intervalRef = useRef(null);

  function start() {
    intervalRef.current = setInterval(() => {
      console.log("Tick");
    }, 1000);
  }

  function stop() {
    clearInterval(intervalRef.current);
  }

  return (
    <>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}

/*
   Why useRef?
   - A timer ID shouldn't cause a component to re-render.
   - useRef preserves interval ID across renders.
*/


/* ====================================================================================================
   7) Example: Storing previous props/state using useRef
   ====================================================================================================
*/
function ShowPrevCount({ count }) {
  const prevCount = useRef();

  useEffect(() => {
    prevCount.current = count; // store previous value
  }, [count]);

  return (
    <p>
      Now: {count}, Previous: {prevCount.current}
    </p>
  );
}

/*
   Here:
   - prevCount.current is preserved between renders
   - but does NOT cause re-renders
*/


/* ====================================================================================================
   8) Common Mistakes & Pitfalls (VERY IMPORTANT)
   ==================================================================================================== */

/*
   ❌ Mistake 1: Expecting ref changes to trigger re-renders
   ---------------------------------------------------------
*/
ref.current = 10;
console.log(ref.current);
// UI does NOT update.
/*
   Fix:
      Use setState if you want UI to re-render.
*/


/*
   ❌ Mistake 2: Using ref when value should cause UI updates
   ---------------------------------------------------------
*/
const nameRef = useRef("John");
// Changing nameRef.current won't update UI.
/*
   Fix:
      useState for UI-related data.
*/


/*
   ❌ Mistake 3: Mutating DOM directly in render (wrong)
   ---------------------------------------------------------
   DOM operations MUST be inside effects or event handlers.
*/


/*
   ❌ Mistake 4: Unstable ref assignment inside render
   ---------------------------------------------------------
*/
const myRef2 = { current: null }; // WRONG — breaks React rules
/*
   Only use useRef() to create stable ref objects.
*/


/* ====================================================================================================
   9) Best Practices (Interview Answers)
   ====================================================================================================
   ✔ useRef for DOM access  
   ✔ useRef to store data that does NOT affect rendering  
   ✔ useState for data that SHOULD cause a UI update  
   ✔ refs do NOT re-run the component; avoid using them like state  
   ✔ cleanup when using refs for timers, subscriptions  
   ✔ do NOT read ref in render unless intended — value may not be set yet  
   ✔ prefer useLayoutEffect for DOM measurements where timing matters  


/* ====================================================================================================
   10) Final concise interview answer
   ====================================================================================================
   “useRef returns a mutable object whose .current property persists across renders. It is used for 
    two main things: (1) referencing DOM elements imperatively (focus, measure, scroll), and 
    (2) storing mutable values that should not trigger re-renders, such as timers, previous state, 
    or cached objects. Updating ref.current does not cause a re-render, which makes it ideal for 
    non-UI state.”
*/
