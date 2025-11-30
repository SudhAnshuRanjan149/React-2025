/* ==================================================================================================
   useMemo & useCallback in React — Deep Explanation + When NOT to Use Them (Interview Perfect)
   ==================================================================================================

   These two hooks are often misunderstood. Many developers overuse them thinking
   they always improve performance — but misusing them can make performance WORSE.

   This guide explains:
     ✔ What useMemo does  
     ✔ What useCallback does  
     ✔ Why they exist  
     ✔ How React memoization works  
     ✔ When NOT to use them (VERY important interview topic)  
*/


/* ==================================================================================================
   1) What is useMemo?
   ==================================================================================================
   useMemo memoizes **computed values**.

   Syntax:
      const memoizedValue = useMemo(() => compute(value), [deps]);

   Purpose:
      - Prevent EXPENSIVE calculations from re-running unnecessarily.
      - Runs the function only when dependencies change.

   Example:
*/
const expensiveResult = useMemo(() => {
  console.log("expensive work running...");
  return heavyComputation(data); // imagine 1M iterations
}, [data]);
/*
   Without useMemo: heavyComputation runs every render.
   With useMemo: it runs ONLY when `data` changes.
*/


/* ==================================================================================================
   2) What is useCallback?
   ==================================================================================================
   useCallback memoizes **functions**.

   Syntax:
      const memoizedFn = useCallback(() => doSomething(), [deps]);

   Purpose:
      - Avoid re-creating the same function on every render.
      - Useful when passing functions to:
         ✔ React.memo components  
         ✔ useEffect dependencies  
         ✔ optimized child components  
*/
const handleClick = useCallback(() => {
  console.log("clicked");
}, []);
/*
   Each render → same function reference.
*/


/* ==================================================================================================
   3) Relationship between useMemo & useCallback
   ==================================================================================================
   useCallback(fn, deps) is equivalent to:

      useMemo(() => fn, deps)

   So:
      useMemo → memoizes a VALUE  
      useCallback → memoizes a FUNCTION  
*/


/* ==================================================================================================
   4) Why React needs memoization at all?
   ==================================================================================================
   React re-runs components on every state/prop change.

   That means:
     - Computations re-run
     - New functions get re-created
     - Child components may re-render due to changed function references  
*/


/* ==================================================================================================
   5) useMemo Example — Optimizing Expensive Computation
   ================================================================================================== */
function FilteredList({ items, query }) {
  const filtered = useMemo(() => {
    console.log("Filtering list...");
    return items.filter(item => item.includes(query));
  }, [items, query]);

  return <ul>{filtered.map(i => <li key={i}>{i}</li>)}</ul>;
}
/*
   Runs filtering ONLY when items or query changes.
*/


/* ==================================================================================================
   6) useCallback Example — Preventing Unnecessary Child Re-Renders
   ================================================================================================== */
const Child = React.memo(function Child({ onClick }) {
  console.log("Child render");
  return <button onClick={onClick}>Child Button</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // Without useCallback -> new function every render -> child re-renders
  const handleClick = useCallback(() => {
    console.log("child action");
  }, []);

  return (
    <>
      <Child onClick={handleClick} />
      <button onClick={() => setCount(count + 1)}>Parent</button>
    </>
  );
}


/* ==================================================================================================
   7) WHEN NOT TO USE useMemo / useCallback — MOST IMPORTANT SECTION
   ==================================================================================================

   ❌ WRONG: Using them “just in case”
   ❌ WRONG: Memoizing small or cheap values
   ❌ WRONG: Memoizing inline functions that are NOT passed to memoized children
   ❌ WRONG: Adding useMemo/useCallback everywhere for "performance" without proof

   Memoization has a COST:
      - memory usage  
      - dependency checks  
      - comparison logic  
      - maintaining caches

   OVER-MEMOIZATION = SLOWER APP.

   Let's break it down:
*/


/* ==================================================================================================
   8) When NOT to use useMemo
   ==================================================================================================
   ❌ When computation is cheap (small loops, simple expressions)
*/
const doubled = useMemo(() => value * 2, [value]); // ❌ BAD — multiply is cheap

/*
   ❌ When the memoized value is rarely re-used
   ❌ When dependencies change frequently → memoization becomes useless
   ❌ When readability decreases without performance gains

   ✔ GUIDELINE:
      Use useMemo ONLY when you have a **MEASURABLY expensive computation**.
*/


/* ==================================================================================================
   9) When NOT to use useCallback
   ==================================================================================================
   ❌ When your function is not passed as a prop
*/
const handleClick2 = useCallback(() => setCount(c => c + 1), []); // ❌ useless if not passed to child

/*
   ❌ When child is NOT memoized
   ❌ When callback logic is trivial
   ❌ When dependencies change often → makes memoization pointless

   ✔ GUIDELINE:
     Use useCallback ONLY when:
       1) Passing function to React.memo child, OR
       2) Passing to useEffect (dependency), OR
       3) Function creation causes meaningful re-renders or performance issues
*/


/* ==================================================================================================
   10) Real Explanation for Interviews
   ==================================================================================================
   Why useCallback might hurt performance:
     - Storing functions in memory  
     - Comparing dependency arrays  
     - Recomputing memoization logic  
     - Additional React internal overhead  

   Why useMemo might hurt performance:
     - Running the memoization setup costs CPU  
     - Keeping values in memory  
     - Checking dependencies  

   Using them blindly = SLOWER APP.
*/


/* ==================================================================================================
   11) Good Rule of Thumb (VERY interview-friendly)
   ==================================================================================================

   ✔ Use useMemo for EXPENSIVE calculations  
   ✔ Use useCallback for STABLE function references *only when passing to optimized children*  
   ✔ DO NOT use them for every prop or value  
   ✔ Only optimize AFTER you measure performance issues  
*/


/* ==================================================================================================
   12) Best Use Cases (Practical)
   ==================================================================================================
   useMemo:
     - heavy filtering / sorting
     - expensive loops
     - formatting large data sets
     - caching expensive components (React.memo + useMemo)

   useCallback:
     - functions passed to React.memo children
     - functions listed in useEffect dependencies
     - avoiding re-renders in deep component trees
*/


/* ==================================================================================================
   13) Final Interview Summary (One-Liners)
   ==================================================================================================
   “useMemo memoizes expensive computed values; useCallback memoizes function references.  
    They are optimization tools, NOT default choices.  
    You should avoid using them unless the benefits outweigh the overhead, such as preventing 
    re-renders in memoized children or avoiding expensive recalculations.”  
*/