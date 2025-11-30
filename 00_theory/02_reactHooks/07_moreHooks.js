/* ============================================================================================================
   All Other Important React Hooks — Detailed Explanations
   ============================================================================================================


   Below are the remaining core hooks + less-common but important ones, 
   explained in deep detail with usage examples and pitfalls.

   Hooks covered below:
     1) useLayoutEffect
     2) useImperativeHandle
     3) useTransition
     4) useDeferredValue
     5) useId
     6) useSyncExternalStore
     7) useInsertionEffect
     8) useDebugValue
     9) useErrorBoundary (React 18+)
     10) Custom Hooks (meta explanation)
*/


/* ============================================================================================================
   1) useLayoutEffect — Synchronous effect before paint
   ============================================================================================================

   useLayoutEffect runs:
     - AFTER DOM mutations
     - BEFORE the browser paints the UI
     - It BLOCKS the paint (synchronous)

   This is different from useEffect which runs AFTER painting.

   Use Cases (when timing matters):
     ✔ Measuring DOM layout (getBoundingClientRect)  
     ✔ Reading styles or scroll positions  
     ✔ Synchronous animations  
     ✔ Updating DOM *before* user sees layout jumps  

   Example:
*/
useLayoutEffect(() => {
  const height = boxRef.current.getBoundingClientRect().height;
  console.log("Height:", height);
}, []);

/*
   ⚠️ DON’T use useLayoutEffect for most side-effects  
      It blocks paint → can harm performance.  
      Prefer useEffect unless you need layout measurement.
*/


/* ============================================================================================================
   2) useImperativeHandle — Customize exposed ref API
   ============================================================================================================

   useImperativeHandle lets you control what a parent receives when using **ref** on a child component.

   Why?
     - Usually refs give access to DOM elements.
     - But sometimes you want a parent to call custom methods on a child.

   Example:
*/
const MyInput = forwardRef((props, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focusInput() {
      inputRef.current.focus();
    },
    scrollToBottom() {
      inputRef.current.scrollTop = inputRef.current.scrollHeight;
    }
  }));

  return <input ref={inputRef} />;
});

// Parent
const parentRef = useRef();
<MyInput ref={parentRef} />;
parentRef.current.focusInput();

/*
   ✔ Only exposes controlled API  
   ✔ Prevents leaking internal details  

   ⚠️ Overuse breaks declarative patterns → use only when needed.
*/


/* ============================================================================================================
   3) useTransition — Mark updates as “not urgent” (Concurrent rendering)
   ============================================================================================================

   useTransition lets you manage slow UI updates without blocking urgent interactions.

   Syntax:
      const [isPending, startTransition] = useTransition();

   Urgent updates:
     - typing
     - clicking
     - cursor movement

   Non-urgent:
     - filtering large lists
     - expensive re-renders
     - background UI updates

   Example:
*/
const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState("");

function handleChange(e) {
  setQuery(e.target.value); // urgent update

  startTransition(() => {
    // non-urgent work
    setFilteredItems(heavyFilter(data, e.target.value));
  });
}

/*
   ✔ Keeps typing responsive  
   ✔ Moves expensive work to low-priority queue  
   ✔ Shows UI hint via isPending  

   ⚠️ Only works in concurrent mode (React 18+).
*/


/* ============================================================================================================
   4) useDeferredValue — Defer expensive recalculations
   ============================================================================================================

   useDeferredValue delays updating a value until higher-priority work is done.

   Useful when:
     - A value changes fast (typing)
     - But you only want slow UI to update later (list filtering)

   Example:
*/
const deferredQuery = useDeferredValue(query);

const filteredItems = useMemo(
  () => heavyFilter(data, deferredQuery),
  [deferredQuery]
);

/*
   ✔ The UI updates slower OR gradually  
   ✔ Keeps main input responsive  
   ✔ Less manual than useTransition  

   ⚠️ Still need memoization to avoid re-filtering unnecessarily.
*/


/* ============================================================================================================
   5) useId — Generate stable random IDs for accessibility
   ============================================================================================================

   useId generates a unique, stable ID guaranteed across renders AND server/client.

   Useful for:
     - linking <label htmlFor="id"> to an <input id="id">
     - accessibility attributes
     - forms

   Example:
*/
// const id = useId();
// <label htmlFor={id}>Name</label>
// <input id={id} />

/*
   ✔ Stable across client/server  
   ✔ Unique across the app  
   ✔ No collisions  

   ⚠️ DO NOT use it for keys in lists → keys must relate to data, not random IDs.
*/


/* ============================================================================================================
   6) useSyncExternalStore — For external state libraries
   ============================================================================================================

   This hook lets React subscribe securely to an external store (Redux, Zustand, custom stores)
   with consistent updates during concurrent rendering.

   Syntax:
      useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)

   Example (simple store):
*/
function useOnlineStatus() {
  return useSyncExternalStore(
    listener => {
      window.addEventListener("online", listener);
      window.addEventListener("offline", listener);
      return () => {
        window.removeEventListener("online", listener);
        window.removeEventListener("offline", listener);
      };
    },
    () => navigator.onLine
  );
}

/*
   ✔ Handles tearing issues in concurrent mode  
   ✔ Accurate external state reading  
   ✔ Modern replacement for older subscription patterns  

   ⚠️ Use for shared stores, not component-local data.
*/


/* ============================================================================================================
   7) useInsertionEffect — For CSS-in-JS libraries (rare)
   ============================================================================================================

   useInsertionEffect runs **before** DOM mutations and before useLayoutEffect.

   Purpose:
     - Injecting dynamic CSS before browser layout calculations
     - Used by emotion, styled-components, compiled CSS-in-JS

   Example:
*/
useInsertionEffect(() => {
  // Insert dynamic style tag before layout
}, []);

/*
   ⚠️ Do NOT use this unless building a styling library  
   ⚠️ Extremely rare in normal apps  
   ⚠️ Blocking and synchronous  
*/


/* ============================================================================================================
   8) useDebugValue — Custom hook debugging helper
   ============================================================================================================

   Used to label custom hooks in React DevTools.

   Example:
*/
function useAuth() {
  const user = useContext(UserContext);
  useDebugValue(user ? "Logged In" : "Logged Out");
  return user;
}

/*
   Only helpful when building reusable custom hooks/packages.
*/


/* ============================================================================================================
   9) useErrorBoundary (React 18+)
   ============================================================================================================

   A hook that lets components imperatively trigger error boundaries.

   Example:
*/
// const [error, resetErrorBoundary] = useErrorBoundary();
/*
   Use Cases:
     - Throwing errors from async events  
     - Resetting error boundary programmatically  

   ⚠️ Requires an ErrorBoundary wrapper  
*/


/* ============================================================================================================
   10) CUSTOM HOOKS — Meta Pattern (VERY IMPORTANT)
   ============================================================================================================

   Custom Hooks are NOT built-in hooks but a pattern built using hooks.

   They allow:
     ✔ reusable logic (fetching, forms, timers)
     ✔ shared functionality across components
     ✔ separation of concerns
     ✔ cleaner components

   Naming rule:
     - Must start with "use" (useFetch, useTheme, useForm)

   Example:
*/
function useWindowSize() {
  const [size, setSize] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setSize(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

/*
   ✔ Encapsulates side effects
   ✔ Reusable across app
*/


/* ============================================================================================================
   FINAL INTERVIEW SUMMARY
   ============================================================================================================

   — useLayoutEffect: synchronous, before paint → for layout measurement  
   — useImperativeHandle: customize ref API → imperative actions  
   — useTransition: mark slow updates as non-blocking  
   — useDeferredValue: defer recalculations for smoother typing  
   — useId: stable unique IDs for accessibility  
   — useSyncExternalStore: reliable subscription to external stores  
   — useInsertionEffect: insert CSS before layout (CSS-in-JS internals)  
   — useDebugValue: debugging for custom hooks  
   — Custom hooks: reusable logic built using hooks  

   These hooks fill the gaps beyond normal state/effects logic and enable advanced patterns,
   performance optimizations, accessibility, and robust architecture.
*/


// ============================================================================================================
// End of detailed explanation of *all other React hooks*
// ============================================================================================================
