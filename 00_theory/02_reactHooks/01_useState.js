/* ====================================================================================
   React useState — Updater Function, Batching, and “Async” Behavior (Deep Explanation)
   ====================================================================================

   This is one of the MOST asked interview topics in React.
   Below is an in-depth, practical, and conceptual explanation.
*/

/* ===========================================================
   1) What is useState?
   ===========================================================
   - useState is a React Hook used to add state to functional components.
   - It returns a *state value* and a *setter function*.
   - Calling the setter triggers a re-render (if new value is different).
*/
const [count, setCount] = useState(0);

/*
   Setter signature:
      setCount(newValue)
      setCount(prev => newValueFromPrev)
*/


/* ===========================================================
   2) Two ways to update state
   ===========================================================
   (A) Direct value update:
      setCount(5)

   (B) Functional updater (VERY important for interviews):
      setCount(prev => prev + 1)

   Functional updater is required when:
   - the new state depends on the previous state
   - multiple state updates happen in one event
   - batching or concurrency may reorder updates
*/


/* ===========================================================
   3) Why functional updater is necessary? (core concept)
   ===========================================================
   Example:
*/
setCount(count + 1);
setCount(count + 1);
/*
   Many beginners think it becomes +2. But it becomes +1.
   Why? Because BOTH calls read the same stale value of count.

   React doesn't update state immediately.
   It *queues* updates and applies them during the next render.

   FIX:
      setCount(prev => prev + 1);
      setCount(prev => prev + 1);
   Now count increments twice.
*/


/* ===========================================================
   4) Batch updates (React 18: Automatic Batching Everywhere)
   ===========================================================
   Batching = React groups multiple state updates into a SINGLE re-render
   to improve performance.

   Before React 18:
     - Batching happened only inside event handlers.
     - setTimeout, promises, etc. did NOT batch by default.

   After React 18:
     - Batching happens everywhere (events, timeouts, promises, fetch, etc.).

   Example:
*/
console.log("start", count);
setCount(count + 1);
setCount(count + 1);
console.log("end", count);
/*
   Output:
     start 0
     end 0    ← state does NOT update immediately!

   After re-render: count becomes 1 (not 2).
*/


/* ===========================================================
   5) Why setState is NOT “async” but feels async
   ===========================================================
   Important clarification:

   - setState (useState setter) is NOT actually asynchronous.
   - It does NOT return a promise.
   - It is *deferred* until after the current render/event finishes.
   - That's why logs after setState show stale values.

   Conceptually:
      - You schedule an update.
      - React processes it later.
*/


/* ===========================================================
   6) How does React apply multiple updates?
   ===========================================================
   Case 1: Using direct value updates
*/
setCount(count + 1);  // suppose count = 0
setCount(count + 1);  // also 0 + 1
/*
   React merges updates → final state = 1
*/


/* ===========================================================
   Case 2: Using functional updater (correct way)
=========================================================== */
setCount(prev => prev + 1); // prev = 0 -> returns 1
setCount(prev => prev + 1); // prev = 1 -> returns 2
/*
   React applies updates sequentially → final state = 2
*/


/* ===========================================================
   7) Why functional updater ALWAYS works (even in concurrency)
   ===========================================================
   Because React guarantees:
      functional updates run in order → each receives the latest value.

   This avoids stale state problems.
*/


/* ===========================================================
   8) Common Pitfall — console.log after setState
   ===========================================================
*/
setCount(1);
console.log(count); // prints OLD value

/*
   Reason:
     - A new render hasn’t happened yet.
     - The state update is queued.
*/


/* ===========================================================
   9) Multiple state updates in same component
   ===========================================================
*/
setCount(prev => prev + 1);
setName(prev => prev + "!");

/*
   React batches them into one render.
*/


/* ===========================================================
   10) Using setState inside effects
   ===========================================================
*/
useEffect(() => {
  setCount(prev => prev + 1); // safe
}, []);
/*
   - Effects run AFTER render & commit.
   - React batches state updates inside effects in React 18.
*/


/* ===========================================================
   11) Stale closures (INTERVIEW GOLD)
   ===========================================================
*/
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      // ❌ WRONG: 'count' is stale (always 0)
    //   setCount(count + 1);

      // ✔ CORRECT
      setCount(prev => prev + 1);
    }, 1000);
  }, []);

  return <div>{count}</div>;
}

/*
   Why?
     - The interval callback closes over the initial count value.
     - Functional update ensures fresh state.
*/


/* ===========================================================
   12) React may skip state updates if value is the same
   ===========================================================
*/
setCount(5);
setCount(5);
/*
   React compares old vs new.
   If identical → no re-render.
*/


/* ===========================================================
   13) Best Practices Summary (Interview-ready)
   ===========================================================
   ✔ Always use functional updater when new state depends on old state  
   ✔ Don’t rely on console.log immediately after state change  
   ✔ Remember batching: multiple updates → one render  
   ✔ React doesn’t update state immediately (deferred)  
   ✔ For intervals/timeouts → use functional updater to avoid stale closures  
   ✔ State updates are queued, not async Promises  
*/


/* ===========================================================
   14) Final concise interview answer
   ===========================================================
   “useState updates are asynchronous in the sense that they are deferred
    until after the render completes, and React batches multiple updates 
    for performance. Direct updates like setX(x + 1) can cause stale values 
    when multiple updates happen in the same event. Instead, use functional 
    updaters (setX(prev => prev + 1)) which React guarantees to run in order 
    with the most recent state, even in concurrent mode.”
*/
 