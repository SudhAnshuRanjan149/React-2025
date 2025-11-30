// ======================================================
// React Component Rendering Cycle — Conceptual Deep Dive
// (Detailed, interview-ready — functional + class mapping)
// ======================================================

/*
  Quick summary (one-liner):
  - A React component's render cycle is the sequence:
  
  React *schedules* work ->
  *render* (produce VDOM) ->
  *reconcile* (diff old vs new VDOM) ->
  *commit* (apply DOM/ref changes and run effects) ->
  repeat on updates ->
  *cleanup* on unmount.

  - React splits that work into a Render Phase (pure, interruptible) and Commit Phase (imperative, final). Hooks and lifecycle methods map into those phases with specific timing guarantees.
*/


// ---------------------------------------------------------------------
// 1) Two high-level phases: Render Phase vs Commit Phase
// ---------------------------------------------------------------------
/*
  Render Phase (also called "reconciliation" or "render work"):
  - Pure, side-effect-free calculation.
  - React calls your component functions (or class render methods) to produce React Elements (VDOM).
  - Can be paused, aborted, restarted or restarted with different priorities (Fiber scheduler).
  - Multiple components may be rendered to build a new VDOM tree.
  - No DOM mutations happen here (shouldn't do DOM-reading/writing or side-effects).

  Commit Phase:
  - Synchronous, performs DOM mutations and ref updates.
  - React applies the minimal set of changes computed by diffing (reconciliation).
  - Lifecycle callbacks that expect DOM to exist run here:
     * Class: componentDidMount, componentDidUpdate, componentWillUnmount (cleanup)
     * Hooks: useLayoutEffect (runs after DOM mutations but before browser paint),
              useEffect (runs after paint; async relative to commit)
  - Errors thrown during Commit are caught by Error Boundaries.
*/


// ---------------------------------------------------------------------
// 2) Main lifecycle "events" in chronological order (Mount -> Update -> Unmount)
// ---------------------------------------------------------------------

/*
  MOUNT (component enters the tree for the first time)
  1) Construction / initialization
     - Class: constructor(props) sets this.state, binds methods.
     - Functional: initialize state via useState, call custom hooks (hooks must run in same order).
  2) Render Phase
     - React calls render() (class) or invokes the function component -> returns new React elements.
  3) Reconciliation (diffs computed against previous null tree)
  4) Commit Phase (DOM created/updated)
     - DOM nodes are inserted.
     - Refs assigned (ref callbacks fire).
     - useLayoutEffect callbacks run (synchronously, before paint).
     - componentDidMount (class) runs after DOM commit.
     - useEffect callbacks are scheduled to run after paint.
*/

//
// UPDATE (component re-renders due to state/props/context change)
// Triggers: setState / state setter, new props from parent, context change, forceUpdate
//
/*
  1) Update scheduled (React receives a state/prop/context change).
  2) React decides priority, may batch updates.
  3) Render Phase: React re-invokes render functions to produce new VDOM (purely).
     - React may bail out early for subtrees if it determines no changes (memoization, PureComponent, shouldComponentUpdate).
  4) Reconciliation: diff old/new VDOM -> compute minimal patches.
  5) Commit Phase:
     - Apply DOM updates.
     - Update/assign refs.
     - run useLayoutEffect callbacks (sync, before paint).
     - run componentDidUpdate (class).
     - schedule useEffect callbacks to run AFTER paint.
*/

//
// UNMOUNT (component removed from tree)
//
/*
  1) Commit Phase: remove DOM nodes.
  2) Cleanup effects:
     - Class: componentWillUnmount invoked during commit (before DOM removal finishes).
     - Hooks: cleanup functions returned from useEffect/useLayoutEffect run during unmount (useLayoutEffect cleanups run before DOM removal finalization; useEffect cleanup runs after paint).
  3) References and event handlers are detached.
*/


// ---------------------------------------------------------------------
// 3) Where hooks & lifecycle methods map in the cycle (timing & order)
// ---------------------------------------------------------------------

/*
  Order (Mount):
    - constructor (class)
    - render()
    - DOM updates + refs set
    - useLayoutEffect() callbacks
    - componentDidMount()
    - After paint -> useEffect() callbacks

  Order (Update):
    - render() (new VDOM)
    - DOM updates + refs updated
    - useLayoutEffect() (cleanup from previous useLayoutEffect runs first, then effect runs)
    - componentDidUpdate()
    - After paint -> useEffect() (cleanup from previous useEffect runs first, then effect runs)

  Important differences:
    - useLayoutEffect runs synchronously after DOM mutations but BEFORE browser paint.
      -> Use for DOM measurements (getBoundingClientRect) or imperative sync mutations.
    - useEffect runs after paint (async relative to the commit) -> best for network requests, subscriptions.
    - Cleanup functions: the previous effect's cleanup runs before the next effect executes (for same effect identity).
*/

// ---------------------------------------------------------------------
// 4) What must NOT happen during render (render-phase constraints)
// ---------------------------------------------------------------------
/*
  - DO NOT perform side effects (network requests, setTimeout side effects, DOM reads/writes that must see final DOM).
  - DO NOT mutate external state or DOM directly.
  - Render must be pure and idempotent (safe to run multiple times).
  - If heavy work is required to compute render output, memoize it (useMemo) or move to an effect / precompute.
*/

// ---------------------------------------------------------------------
// 5) Triggers for re-render (and nuances)
// ---------------------------------------------------------------------
/*
  1) State updates: setState / dispatch (useReducer) with a new value/reference.
     - React may batch multiple state updates into a single render (automatic batching).
     - If the setter receives same reference/value, React may bail out (no update).
  2) Props change: when parent re-renders with different props.
  3) Context change: when a context provider value changes.
  4) Force update (rare / legacy).
  5) Parent re-rendering: causes child to re-render unless memoized (React.memo / PureComponent).
*/

// ---------------------------------------------------------------------
// 6) Reconciliation: how React decides what to update
// ---------------------------------------------------------------------
/*
  - React diffs old VDOM vs new VDOM:
     * If node types match (same element type or same component), React updates props and recurses into children.
     * If types differ, it unmounts the old node and mounts a new one.
     * For arrays/lists, keys are used to match items to minimize moves/removals/creates.
  - Fiber architecture breaks reconciliation into small units; allows interruptible work and priority scheduling.
*/

// ---------------------------------------------------------------------
// 7) Batching, scheduling & concurrency (React 18+ notes)
// ---------------------------------------------------------------------
/*
  - Batching: React groups multiple setState calls inside event handlers into one render pass (automatic batching).
  - With React 18, batching is broader (async tasks, microtasks) in many environments.
  - startTransition marks updates as low-priority (for non-urgent updates like list filtering) so urgent updates (typing) stay responsive.
  - Concurrent features let React interrupt a long render and resume later with a new priority.
  - These features change timing/performance but not component semantics — your effects/commit invariants still hold.
*/

// ---------------------------------------------------------------------
// 8) Performance optimizations related to the render cycle
// ---------------------------------------------------------------------
/*
  - Avoid expensive synchronous work in render().
  - Memoize components (React.memo) to skip rendering children if props are unchanged.
  - Use useCallback / useMemo to preserve references when passing to memoized children (but don't overuse).
  - Use keys correctly for lists to help reconciliation minimize DOM churn.
  - Virtualize large lists (react-window) to reduce number of DOM nodes rendered.
  - Move non-UI work to web workers or to useEffect (async) when possible.
  - Use profiling tools (React DevTools Profiler, browser Performance tab) to see commit/render times.
*/

// ---------------------------------------------------------------------
// 9) Common pitfalls / gotchas (practical interview points)
// ---------------------------------------------------------------------
/*
  - Side-effects in render: causes bugs because render may run many times.
  - Mutating state directly (e.g., arr.push()) breaks change detection — always produce new references.
  - Using array index as key causes incorrect reuse when order changes.
  - Expecting useEffect to run before paint — it's AFTER paint (useLayoutEffect for pre-paint needs).
  - Forgetting to clean up subscriptions in effects → memory leaks or duplicate listeners.
  - Calling state setters unguarded inside render/effect loops causing infinite re-renders:
      // BAD: if effect always sets state unconditionally, it will loop.
*/

// ---------------------------------------------------------------------
// 10) Mini sequence diagram (Mount -> Update -> Unmount) (conceptual)
// ---------------------------------------------------------------------
/*
  Mount:
  [Schedule Mount] -> Render Phase (call render() / function) -> Create VDOM -> Reconcile -> Commit:
     -> create DOM nodes -> set refs -> run useLayoutEffect -> componentDidMount -> after paint run useEffect

  Update:
  [Schedule Update] -> Render Phase (recompute VDOM) -> Reconcile (diff) -> Commit:
     -> apply DOM patches -> update refs -> run useLayoutEffect (cleanup + effect) -> componentDidUpdate
     -> after paint run useEffect (cleanup + effect)

  Unmount:
  [Schedule Unmount] -> Commit: run effect cleanups -> remove DOM nodes -> componentWillUnmount
*/

// ---------------------------------------------------------------------
// 11) Mapping class lifecycle methods ↔ hooks (cheat-sheet)
// ---------------------------------------------------------------------
/*
  - constructor(props)                -> set initial state (useState initializer)
  - render()                         -> function component body returns JSX
  - componentDidMount()              -> useEffect(() => { ... }, [])
  - componentDidUpdate(prevProps, prevState) -> useEffect(() => { ... }, [deps]) (compare prev values with refs)
  - componentWillUnmount()           -> useEffect(() => { return () => cleanup }, [])
  - shouldComponentUpdate(nextProps,nextState) -> React.memo + custom compare / PureComponent
  - getDerivedStateFromProps           -> rare; usually avoid. Use useEffect or derive state at render time.
  - getSnapshotBeforeUpdate            -> useLayoutEffect return or synchronous DOM read before paint
*/

// ---------------------------------------------------------------------
// 12) Debugging tips (how to investigate render cycle issues)
// ---------------------------------------------------------------------
/*
  - Use React DevTools to inspect re-renders (highlight updates).
  - Wrap components with React.memo and add console logs to see renders.
  - Profile with React Profiler to see render and commit durations.
  - Log effects and their cleanups to ensure they run as expected.
  - Check for stale closures: functions closed over old props/state — use refs or include correct deps.
*/

// ---------------------------------------------------------------------
// 13) Final interview-acceptable concise answer
// ---------------------------------------------------------------------
/*
  - React's component rendering cycle has two main phases:
      1) Render Phase: produce VDOM by calling component code (pure, interruptible).
      2) Commit Phase: apply DOM changes, update refs, run synchronous layout effects and lifecycle callbacks. After paint, run normal effects.
  - Re-renders are triggered by state/props/context changes; reconciliation computes minimal patches; Fiber enables scheduling and interruptions.
  - Keep render pure, use useLayoutEffect for sync DOM reads/writes before paint, and useEffect for async side effects after paint.
*/

// ======================================================
// End of Component Rendering Cycle deep dive
// ======================================================
