/* ======================================================================================================
   Custom Hooks in React — Logic Abstraction, Reusability, Architecture (Deep Interview-Ready Explanation)
   ======================================================================================================

   Custom Hooks are one of the MOST powerful and important concepts in modern React.
   They solve architectural problems, improve reusability, keep components clean, and
   allow sharing logic without HOCs or Render Props.

   Below is a complete conceptual + practical deep dive.
*/


/* ======================================================================================================
   1) What is a Custom Hook?
   ======================================================================================================
   A **Custom Hook** is a JavaScript function that:

     ✔ Uses one or more built-in React hooks  
     ✔ Starts with the word **"use"**  
     ✔ Encapsulates reusable logic  
     ✔ Returns values or functions for components to use  

   Example (simple):
*/

function useCounter() {
  const [count, setCount] = useState(0);
  function increment() { setCount(c => c + 1); }
  return { count, increment };
}

/*
   Now any component can reuse this logic:
*/
const { count, increment } = useCounter();


/* ======================================================================================================
   2) Why do Custom Hooks exist? (Before & After)
   ======================================================================================================
   BEFORE Hooks (React class components):
     - Reusing logic required:
       ❌ Higher-Order Components (HOCs)
       ❌ Render Props patterns
     - These caused:
       • deeply nested wrapper components (“Wrapper Hell”)  
       • confusing code  
       • naming collisions  
       • harder debugging  

   AFTER Hooks:
     ✔ Logic reuse no longer needs component wrappers  
     ✔ Custom Hooks allow sharing ANY stateful logic  
     ✔ Easy to build well-encapsulated, reusable utilities  
*/


/* ======================================================================================================
   3) Rules for Custom Hooks (VERY IMPORTANT)
   ======================================================================================================
   Custom Hooks must follow React’s “Rules of Hooks”:

   1) Must start with **use**  
      ❌ myHook()     ✔ useMyHook()

   2) Must only call hooks at the **top level**  
      (no loops, no conditions, no nested closures)

   3) Must only call hooks:
      - inside React components, OR
      - inside Custom Hooks

   Violating these rules causes runtime errors.
*/


/* ======================================================================================================
   4) What can Custom Hooks abstract?
   ======================================================================================================
   Custom Hooks can encapsulate ANY logic:
     ✔ State logic
     ✔ Event listeners
     ✔ Data fetching
     ✔ Forms
     ✔ Animations
     ✔ Subscriptions
     ✔ Browser APIs
     ✔ Timers
     ✔ Caching logic

   They help make UI components **focused**, **clean**, and **logic-free**.
*/


/* ======================================================================================================
   5) EXAMPLE: Custom Hook for data fetching
   ====================================================================================================== */
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (!ignore) setData(json);
      });

    return () => { ignore = true }; // cleanup to avoid race
  }, [url]);

  return { data, loading };
}

/*
   Usage:
*/
const { data, loading } = useFetch("/api/users");

/*
   ✔ Component does NOT care how fetching is implemented  
   ✔ Reusable across many components  
*/


/* ======================================================================================================
   6) EXAMPLE: Custom Hook for form logic
   ====================================================================================================== */
function useForm(initial) {
  const [form, setForm] = useState(initial);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return { form, handleChange };
}

// Usage
const { form, handleChange } = useForm({ email: "", password: "" });


/* ======================================================================================================
   7) EXAMPLE: Custom Hook for previous value (classic)
   ====================================================================================================== */
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

const prev = usePrevious(count);


/* ======================================================================================================
   8) EXAMPLE: Custom Hook for window size
   ====================================================================================================== */
function useWindowSize() {
  const [size, setSize] = useState(window.innerWidth);

  useEffect(() => {
    function onResize() { setSize(window.innerWidth); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}


/* ======================================================================================================
   9) Benefits of Custom Hooks (Major Interview Points)
   ======================================================================================================

   ✔ Reusability  
     - Extract logic so multiple components can use it.

   ✔ Separation of concerns  
     - UI components focus on UI, not logic.

   ✔ Cleaner components  
     - No need for long useEffects or complicated state logic inside components.

   ✔ Easily testable  
     - Reducer-like logic can be tested without rendering a UI.

   ✔ No wrapper components  
     - Unlike HOCs or Render Props, hooks don’t modify component hierarchy.

   ✔ Maintainability  
     - Changes to logic are made in ONE place.

   ✔ DRY principles  
     - Avoid copying and pasting logic across components.
*/


/* ======================================================================================================
   10) Returning values from Custom Hooks
   ======================================================================================================

   A custom hook can return:
     ✔ primitive values  
     ✔ objects  
     ✔ arrays  
     ✔ functions  
     ✔ refs  
     ✔ multiple combined hooks  
     ✔ anything a component needs

   Examples:
      return [value, setter]
      return { data, loading, error }
      return { open, close, toggle }
*/


/* ======================================================================================================
   11) Common Pitfalls & Anti-Patterns
   ======================================================================================================

   ❌ 1. Calling hooks conditionally inside custom hook
       Wrong:
         if (flag) useState();
       Right:
         useState(); useEffect(); etc. are always at top level.

   ❌ 2. Writing a custom hook for trivial code
       You DON’T need custom hooks for:
         - one small effect
         - one small setter
         - tiny logic used once

   ❌ 3. Returning unstable values (not memoized)
       If a hook returns functions/objects, consumers may re-render unnecessarily.

       Fix:
         Use useCallback / useMemo *inside the hook* when needed.

   ❌ 4. Assuming custom hooks reduce renders
       Custom hooks do NOT prevent component re-renders on their own.

   ❌ 5. Doing side effects inside reducer (if combining useReducer inside hook)
*/


/* ======================================================================================================
   12) Best Practices for Custom Hooks
   ======================================================================================================

   ✔ Start hook function names with “use”
   ✔ Keep hooks focused on one responsibility
   ✔ Make the return API intuitive and simple
   ✔ Use useMemo/useCallback internally if you return stable values
   ✔ Avoid creating too many nested custom hooks unless needed
   ✔ Document required dependencies in hook code
   ✔ Clean up effects inside the hook instead of forcing the component to do it
*/


/* ======================================================================================================
   13) Final Interview-Worthy Summary
   ======================================================================================================

   “A custom hook is a reusable function that uses React’s built-in hooks to share logic across components.
    It abstracts away complex or repetitive behaviors (fetching, forms, animations, browser events, timers)
    and allows components to stay small, focused, and declarative. Custom hooks follow the Rules of Hooks
    and do not affect the component tree—unlike HOCs or render props. They are the main tool for logic
    reuse in modern React.”
*/


// ======================================================================================================
// End of deep explanation — Custom Hooks
// ======================================================================================================
