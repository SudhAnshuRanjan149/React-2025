/* ==========================================================================================
   React useEffect — Dependency Array, Cleanup, and Common Pitfalls (Deep Explanation)
   ==========================================================================================

   useEffect is one of the most misunderstood but MOST IMPORTANT hooks in React.
   This guide explains HOW it works, WHY it works this way, and ALL the interview-critical details.
*/

/* ==========================================================================================
   1) What is useEffect?
   ==========================================================================================
   useEffect lets you perform *side effects* after React renders the component.

   Side effects include:
   - fetching data
   - setting subscriptions
   - adding event listeners
   - timers (setInterval / setTimeout)
   - manually manipulating DOM
   - logging values, analytics
*/
useEffect(() => {
  console.log("Effect ran");
});


/* ==========================================================================================
   2) When does useEffect run?
   ==========================================================================================
   useEffect runs **after render + after DOM has been updated + after paint**.

   That means:
     - The UI is already visible on the screen.
     - It is asynchronous relative to the commit phase.
     - It is NOT blocking the UI.

   Sequence on mount:
      render → commit DOM → paint → useEffect(callback)
*/


/* ==========================================================================================
   3) Dependency Array (VERY IMPORTANT)
   ==========================================================================================
   Signature:
      useEffect(callback, dependencyArray)

   The dependency array decides WHEN the effect runs.

   1) No dependency array  → runs after EVERY render
*/
useEffect(() => {
  console.log("runs on mount + every update");
});

/*
   2) Empty dependency array [] → runs ONLY on mount
*/
useEffect(() => {
  console.log("runs only once (mounted)");
}, []);

/*
   3) With dependencies → runs on mount + whenever dependencies change
*/
useEffect(() => {
  console.log("runs when 'count' changes");
}, [count]);


/* ==========================================================================================
   4) How React checks dependencies? (Shallow comparison)
   ==========================================================================================
   - React compares dependencies using *Object.is* (similar to === for most values).
   - For objects, arrays, or functions → the reference must be identical.

   Example:
*/
useEffect(() => {
  console.log("runs every render because obj is new each time");
}, [{ a: 1 }]); // BAD — new object every render


/* ==========================================================================================
   5) Cleanup function (returned from the effect)
   ==========================================================================================
   The effect can return a cleanup function:

*/
useEffect(() => {
  console.log("effect: subscribing");

  return () => {
    console.log("cleanup: unsubscribing");
  };
}, []);

/*
   When does cleanup run?

   - On unmount
   - Before the next effect runs (for same effect)

   Order:
     (previous cleanup) → (new effect execution)

   Example: window resize listener
*/
useEffect(() => {
  function handleResize() {
    console.log(window.innerWidth);
  }

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);


/* ==========================================================================================
   6) Cleanup solves memory leaks
   ==========================================================================================
   Effects like setInterval, WebSocket, event listeners MUST be cleaned up or they leak.

*/
useEffect(() => {
  const id = setInterval(() => {
    console.log("timer running");
  }, 1000);

  return () => clearInterval(id);
}, []);


/* ==========================================================================================
   7) Common Pitfalls (VERY Frequently Asked in Interviews)
   ========================================================================================== */


/* -------------------------------------
   PITFALL 1: Missing dependencies
   -------------------------------------
   Example:
*/
useEffect(() => {
  fetch("/api/data?query=" + query);
}, []); // WRONG — query is used but NOT listed in dependency array

/*
   Why wrong?
   - Effect never re-runs when query changes.
   - Creates stale values.

   FIX:
*/
useEffect(() => {
  fetch("/api/data?query=" + query);
}, [query]);


/* -------------------------------------
   PITFALL 2: Infinite loops
   -------------------------------------
*/
useEffect(() => {
  setCount(count + 1);  // ❌ BAD
}, [count]);

/*
   Why?
   - Effect updates state → state change triggers effect → infinite loop.

   FIX:
   - Put state updates inside events or use functional updater if needed.
*/


/* -------------------------------------
   PITFALL 3: Stale closures
   -------------------------------------
*/
useEffect(() => {
  setInterval(() => {
    console.log(count); // count is stale (always initial value)
  }, 1000);
}, []);

/*
   FIX:
     Option A) Functional updater:
*/
useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1); // uses fresh state
  }, 1000);
  return () => clearInterval(id);
}, []);

/*
     Option B) Put 'count' in dependency array (but interval recreated each change)
*/


/* -------------------------------------
   PITFALL 4: Unstable functions as dependencies
   -------------------------------------
   Functions are recreated on every render → effect re-runs every time.
*/
useEffect(() => {
  console.log("runs every time!");
}, [handleSave]); // handleSave is recreated each render

/*
   FIX:
     useCallback to stabilize function reference:
*/
const handleSave = useCallback(() => { 
  // something
}, []);


/* -------------------------------------
   PITFALL 5: Using objects/arrays as dependencies
   -------------------------------------
*/
useEffect(() => {
  console.log("runs every time because arr is new");
}, [[1, 2, 3]]);

/*
   FIX:
     Move them outside or memoize:
*/
const arr = useMemo(() => [1, 2, 3], []);
useEffect(() => { console.log("correct"); }, [arr]);


/* ==========================================================================================
   8) useEffect vs useLayoutEffect (Conceptual)
   ==========================================================================================
   useEffect:
     - Runs AFTER paint.
     - Non-blocking.
     - Best for async operations, fetching, subscriptions.

   useLayoutEffect:
     - Runs BEFORE paint (after DOM mutation but before browser paints).
     - Blocks visual updates.
     - Use only for DOM measurements (scrollHeight, boundingRect).
*/


/* ==========================================================================================
   9) Best Practices (Interview-ready)
   ==========================================================================================
   ✔ Always include ALL reactive values in dependency array  
   ✔ Use useCallback/useMemo to stabilize functions/objects  
   ✔ Cleanup side effects to prevent memory leaks  
   ✔ Avoid doing state updates inside effects unless intentional  
   ✔ Understand stale closures in timers and async callbacks  
   ✔ Prefer functional updaters when depending on previous state  
   ✔ useLayoutEffect only for DOM measurement or mandatory sync logic  
*/


/* ==========================================================================================
   10) One-line interview-friendly summary
   ==========================================================================================
   “useEffect runs after React renders and is used for side effects. The dependency array 
    controls when it runs, the cleanup function prevents memory leaks and runs before the 
    next effect or unmount, and common pitfalls include stale closures, missing 
    dependencies, infinite loops, and unstable references.”
*/

