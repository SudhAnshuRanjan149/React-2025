/* ==========================================================================================
   Why Child Components Re-render in React — Detailed Explanation (Interview-Ready)
   ==========================================================================================

   Short answer:
     A child component re-renders whenever React decides it must re-run the component function
     to compute a new Virtual DOM. That decision is triggered by state/prop/context/parent updates,
     identity changes of props (objects/functions/arrays), key changes, or explicit force updates.
     Re-rendering is cheap; unnecessary DOM updates are avoided by reconciliation — but re-renders
     still cost CPU (JS work). Understanding WHY re-renders happen lets you avoid wasted renders.

   Below: exhaustive reasons, examples, debugging tips, and mitigation strategies.
*/

/* -----------------------------------------------------------------------------
   1) Primary triggers that cause a child to re-render
   ----------------------------------------------------------------------------- */

/*
  A child component will re-render when ANY of these apply:

  A) Parent re-render
     - When the parent component re-renders, React by default will re-render all children
       (i.e., it will call the child function again) unless the child is memoized and props
       are shallow-equal.

  B) Props change
     - If the parent passes different prop values (by value or by reference), the child
       will re-render. For primitives this is by value; for objects/arrays/functions this
       is by reference (===).

  C) Child's own state changes
     - setState/useReducer inside the child schedules a re-render for that child.

  D) Context value changes (useContext)
     - Any component that reads a context re-renders when the Provider's value changes (reference).
     - All consumers under that Provider will be candidates to re-render.

  E) Key change
     - When React sees a different key for the same element, it unmounts the old and mounts a new,
       i.e., full re-render of that subtree.

  F) External subscriptions / stores
     - Hooks like useSyncExternalStore or custom subscriptions can trigger re-renders when the store changes.

  G) Force update
     - Rare: forceUpdate in class components or throwing a new state reference from a parent.

  H) StrictMode / Dev-only behaviors
     - In development with StrictMode React may double-render component functions (to detect side effects).
*/

/* -----------------------------------------------------------------------------
   2) Common concrete examples (and why they re-render)
   ----------------------------------------------------------------------------- */

/* Example A: Parent re-render causes child to re-run */
function ParentExample() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Parent: {count}</button>
      <ChildStatic />   // ChildStatic will re-run every time ParentExample re-renders unless memoized
    </>
  );
}

/* Example B: Prop identity changes (objects/functions/arrays) */
function ParentWithInlineProp() {
  const [n, setN] = useState(0);
  return (
    <>
      <button onClick={() => setN(x => x + 1)}>++</button>
      <Child obj={{ a: 1 }} onClick={() => console.log('hi')} />
      {/* -> Child re-renders every parent render because { a: 1 } and the function are new references */}
    </>
  );
}

/* Example C: Context change */
const ThemeContext = React.createContext('light');
function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar /> // any consumer under Toolbar using useContext(ThemeContext) will re-render when theme changes
    </ThemeContext.Provider>
  );
}

/* Example D: Key change */
{items.map(item => <Row key={item.id} item={item} />)}
// If key changes (or you use index incorrectly), React may remount the Row causing full re-render and losing local state

/* -----------------------------------------------------------------------------
   3) Subtleties: Re-render ≠ DOM change — why this matters
   ----------------------------------------------------------------------------- */

/*
  - Re-render = React calls the component function and produces a new VDOM tree.
  - DOM update (commit) = React applies minimal DOM mutations after diffing.
  - It is normal (and cheap relative to DOM ops) for React to re-render many components; the real cost
    comes from producing large VDOMs or causing many DOM mutations.

  Example:
    Component renders static markup independent of changing state elsewhere.
    It will still be invoked during parent re-render unless memoized, but reconciliation may find no diff
    and skip DOM writes.
*/

/* -----------------------------------------------------------------------------
   4) Why props that are objects/functions cause re-renders (identity)
   ----------------------------------------------------------------------------- */

/*
  - JS objects/arrays/functions are reference types; equality uses reference (===).
  - Inline definitions create new references each render.
  - React.memo (shallow compare) will fail if references change and thus child re-renders.

  Bad:
    <Child data={{a:1}} />
    const handler = () => { ... }
    <Child onClick={handler} />

  Good:
    const data = useMemo(() => ({a:1}), []);
    const handler = useCallback(() => { ... }, []);
    <Child data={data} onClick={handler} />
*/

/* -----------------------------------------------------------------------------
   5) Context pitfalls — whole subtree re-renders
   ----------------------------------------------------------------------------- */

/*
  - Provider.value is compared by reference. If you pass a new object each render:
      <Provider value={{ user }}>  // new object → all consumers re-render
  - Fix: memoize the provided value:
      const value = useMemo(() => ({ user, login, logout }), [user]);
      <Provider value={value} />
  - If you need fine-grained updates, split context into multiple contexts so a change in one
    value doesn't re-render consumers of unrelated values.
*/

/* -----------------------------------------------------------------------------
   6) React.memo, PureComponent, and shouldComponentUpdate — how they help
   ----------------------------------------------------------------------------- */

/*
  - React.memo(Component) prevents child re-render if props are shallowly equal.
  - PureComponent (class) does shallow prop+state comparison.
  - shouldComponentUpdate gives full control.
  - Use these when children are heavy to render and receive stable props.

  Example:
    const Child = React.memo(function Child({ value }) { ... });

  Note:
    - Memoization has overhead; use it when you measured benefit.
    - If props include unstable references, memo doesn't help without stabilizing them.
*/

/* -----------------------------------------------------------------------------
   7) Other causes: closures & stale functions leading to re-renders
   ----------------------------------------------------------------------------- */

/*
  - Passing a function created inside parent causes new reference each render:
      <Child onSubmit={() => doThing(x)} />
  - Using useCallback to stabilize reference can prevent unnecessary child renders:
      const onSubmit = useCallback(() => doThing(x), [x]);
      <Child onSubmit={onSubmit} />
  - Beware: Overusing useCallback has cost too; only use when needed (e.g., child memoized).
*/

/* -----------------------------------------------------------------------------
   8) Keys and list operations — causing re-mounts (thus re-renders)
   ----------------------------------------------------------------------------- */

/*
  - Keys help React match list items between renders.
  - Bad key choices (index for reorderable lists) cause wrong reuse or full remounts:
      {items.map((item, i) => <Row key={i} ... />)} // bad if items reorder
  - Use stable identifiers: key={item.id}
*/

/* -----------------------------------------------------------------------------
   9) Concurrent mode / startTransition / StrictMode effects on renders
   ----------------------------------------------------------------------------- */

/*
  - Concurrent features allow React to interrupt, pause, or restart renders; your render function may run multiple
    times for the same update (render-phase work may be thrown away).
  - StrictMode in development intentionally double-invokes render functions to detect side-effects.
  - These do not change when the DOM commits; they may increase render counts during dev or concurrent scheduling.
*/

/* -----------------------------------------------------------------------------
   10) Debugging re-renders — practical tools & steps
   ----------------------------------------------------------------------------- */

/*
  1) React DevTools Profiler:
     - See which components re-render and why.
  2) highlight updates (React DevTools) or Shepherd-like overlay to show paints.
  3) Add console.logs inside component body to see renders (but mind StrictMode doubles in dev).
  4) Wrap component in React.memo to test if skipping render solves the issue.
  5) Check prop references — log prevProps vs nextProps or use deep inspection.
  6) For context: inspect Provider value identity; memoize if needed.
*/

/* -----------------------------------------------------------------------------
   11) Mitigation strategies (how to avoid unnecessary child re-renders)
   ----------------------------------------------------------------------------- */

/*
  A) Split components
     - Smaller components localize re-renders to minimal subtrees.

  B) Memoize children
     - React.memo for pure children that receive stable props.

  C) Stabilize prop identity
     - useCallback for functions
     - useMemo for objects/arrays

  D) Avoid passing large objects inline
     - Pass primitives or IDs; let child lookup heavier data.

  E) Use selectors for context/external stores
     - Select only necessary slice of context/store; or split context into multiple contexts.

  F) Use state co-location
     - Keep state as close to where it’s needed as possible to avoid whole-tree updates.

  G) Virtualization for large lists
     - render only visible rows (react-window)

  H) useSyncExternalStore/useSelector
     - subscribe to stores with fine-grained updates instead of re-rendering entire subtree.

  I) Prefer immutable updates (so comparisons work)
     - Always return new object references for changed state; unchanged references for unchanged parts.

  J) Measure before optimizing
     - Use Profiler to find real bottlenecks; premature optimization can add complexity.
*/

/* -----------------------------------------------------------------------------
   12) Examples with fixes
   ----------------------------------------------------------------------------- */

// Problem: passing inline object -> child re-renders
function ParentBad() {
  const [n, setN] = useState(0);
  return (
    <>
      <button onClick={() => setN(x => x + 1)}>++</button>
      <Child data={{ a: 1 }} /> {/* new object each render -> Child always re-renders */}
    </>
  );
}

// Fix: memoize object with useMemo
function ParentFixed() {
  const [n, setN] = useState(0);
  const data = useMemo(() => ({ a: 1 }), []); // stable reference
  return (
    <>
      <button onClick={() => setN(x => x + 1)}>++</button>
      <Child data={data} />
    </>
  );
}

// Problem: passing non-memoized function -> child re-renders
const ChildMemo = React.memo(function ChildMemo({ onClick }) {
  console.log('ChildMemo render');
  return <button onClick={onClick}>Click</button>;
});

function ParentFuncBad() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Parent {count}</button>
      <ChildMemo onClick={() => console.log('hi')} /> {/* new fn each render -> ChildMemo re-renders */}
    </>
  );
}

// Fix: useCallback
function ParentFuncFixed() {
  const [count, setCount] = useState(0);
  const handle = useCallback(() => console.log('hi'), []); // stable reference
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Parent {count}</button>
      <ChildMemo onClick={handle} />
    </>
  );
}

/* -----------------------------------------------------------------------------
   13) Interview short answers — quick bullets you can say
   ----------------------------------------------------------------------------- */

/*
  - "Children re-render when their inputs change (props/state/context) or when their parent re-renders."
  - "Reference equality matters: objects/functions/arrays recreated inline cause re-renders."
  - "React.memo and PureComponent prevent re-render when shallow props are equal."
  - "Context provider value identity drives consumer updates; memoize or split contexts."
  - "Re-rendering is different from DOM updates — reconciliation avoids unnecessary DOM writes."
  - "Measure with Profiler before optimizing; premature memoization can hurt performance."
*/

/* -----------------------------------------------------------------------------
   14) Final concise summary
   ----------------------------------------------------------------------------- */

/*
  - React re-renders children primarily because of state, props, context, parent renders, key changes, and external store updates.
  - Many re-renders are harmless; the goal is to avoid unnecessary work that leads to costly DOM updates or heavy JS computations.
  - Use component splitting, memoization, stable references, selectors, and profiling to prevent wasted re-renders.
*/

/* ==========================================================================================
   End — Why child components re-render (comprehensive)
   ========================================================================================== */
