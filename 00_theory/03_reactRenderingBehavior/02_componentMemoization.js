/* ======================================================================================================
   Component Memoization in React — React.memo Deep Explanation (Behavior, Benefits, Pitfalls)
   ======================================================================================================

   React.memo is a powerful optimization tool that helps prevent **unnecessary re-renders** of functional
   components. Used correctly, it improves performance significantly. Used incorrectly, it can make apps
   slower.

   Below is a complete deep dive suitable for interviews and real-world use.
*/


/* ======================================================================================================
   1) What is React.memo?
   ======================================================================================================

   React.memo is a Higher-Order Component (HOC) that **memoizes** a functional component.

   It prevents re-rendering when:
     ✔ props are the same (shallow comparison)
     ✔ parent re-renders but props did NOT change

   Syntax:
*/
const MemoizedComponent = React.memo(MyComponent);

/*
   Conceptually:
     React.memo(Component) is like “PureComponent” for functional components.
*/


/* ======================================================================================================
   2) Why do we need memoization?
   ======================================================================================================

   React re-renders child components whenever the parent re-renders, EVEN IF:

     - child props didn’t change
     - child uses no state
     - child’s output would be identical

   This produces unnecessary work and affects performance, especially when:
     ✔ components are big  
     ✔ children are many  
     ✔ props contain heavy computations  

   React.memo avoids this by skipping the re-render.
*/


/* ======================================================================================================
   3) How React.memo works internally (Shallow Comparison)
   ======================================================================================================

   React.memo compares **previous props** with **new props** using SHALLOW comparison:

   - Primitives (string, number, boolean) → compared by value
   - Objects, Arrays, Functions → compared by reference

   Example:
*/

{/*

<Child count={1} />      // primitive: equal -> no re-render
<Child data={{a: 1}} />  // new object every render -> NOT equal -> re-render 

*/}

/*
   Beware:
     If props contain *objects or functions*, React.memo will NOT skip re-render
     unless those references are stable (via useMemo/useCallback).
*/


/* ======================================================================================================
   4) Simple Example — React.memo in action
   ====================================================================================================== */
const Child1 = React.memo(function Child({ value }) {
  console.log("Child rendered");
  return <div>{value}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>+</button>
      <Child1 value="Static" /> {/* does NOT re-render because value never changes */}
    </>
  );
}

/*
   ✔ Child renders only once  
   ✔ Parent re-renders but Child skips rendering  
*/


/* ======================================================================================================
   5) Why React.memo may NOT work without memoized functions/objects
   ======================================================================================================

   Example of NO optimization:
*/

// function Parent() {
//   const [count, setCount] = useState(0);
//   const data = { a: 1 }; // NEW object every render

//   return <Child2 data={data} />;
// }

// const Child2 = React.memo(function Child() { ... });



/*
   React.memo sees:
     prev.data !== next.data  (different reference)
   → child re-renders EVERY TIME
*/


/*
   FIX:
     Use useMemo to stabilize object reference
*/
const data1 = useMemo(() => ({ a: 1 }), []);


/* ======================================================================================================
   6) Custom comparison function (Second argument)
   ======================================================================================================

   React.memo supports a custom comparison function:
*/

// const Child3 = React.memo(
//   function Child({ user }) { ... },
//   (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
// );

/*
   You can manually control when a child should re-render.

   ⚠️ WARNING:
       Custom comparators are expensive → use only if needed.
*/


/* ======================================================================================================
   7) When SHOULD you use React.memo? (Best Use Cases)
   ======================================================================================================

   ✔ Components that:
     - render often  
     - receive stable props  
     - contain heavy computations  
     - are deep in the tree  
     - update lists or tables  

   ✔ When parent re-renders frequently (e.g., many setState calls)

   ✔ When passing callbacks that are memoized with useCallback

   ✔ When rendering large, static UI pieces (icons, headers, static cards)
*/


/* ======================================================================================================
   8) When you should NOT use React.memo (Anti-patterns)
   ======================================================================================================

   ❌ When component is simple, tiny, or cheap to render  
   ❌ When props always change (memoization is useless)  
   ❌ When props include non-memoized objects/functions  
   ❌ When used everywhere “just in case” (can hurt performance)  
   ❌ When custom equality logic is expensive  

   Memoization itself has a COST:
     - memory overhead
     - comparator checks
     - increased complexity

   Overusing React.memo → slower app, harder code.
*/


/* ======================================================================================================
   9) React.memo + useCallback + useMemo (the trio)
   ======================================================================================================

   To fully optimize child components:

     - React.memo → prevents re-render
     - useCallback → stable function props
     - useMemo → stable object/array props

   Example combination:
*/

// const Child = React.memo(function Child({ onSave, data }) { ... });

// const onSave = useCallback(() => { ... }, []);
// const data = useMemo(() => ({ id: 1 }), []);

/*
   Now Child will NOT re-render unless onSave or data changes.
*/


/* ======================================================================================================
   10) React.memo vs PureComponent vs shouldComponentUpdate
   ======================================================================================================

   | Feature                | React.memo (Function)         | PureComponent (Class)  | shouldComponentUpdate |
   |------------------------|-------------------------------|-------------------------|------------------------|
   | Component type         | Functional                    | Class                   | Class                  |
   | Comparison             | Shallow on props              | Shallow on props+state  | Full control           |
   | Custom comparator      | Yes, via second argument      | No                      | Yes                    |
   | Use case               | Perf optimization             | Legacy class apps       | Advanced control       |

   Modern React:
     ✔ Prefer React.memo  
     ✔ PureComponent is legacy  
*/


/* ======================================================================================================
   11) Deep Internal Behavior (Advanced)
   ======================================================================================================

   Internally, React.memo:
     - Wraps the component in a fiber with memoized props
     - On every parent render:
         * Compares prevProps vs nextProps
         * If shallow-equal → SKIPS rendering this fiber
         * If not → re-renders normally

   React still traverses the tree, but avoids re-running component code.
*/


/* ======================================================================================================
   12) Final Interview-Ready Summary
   ======================================================================================================

   “React.memo memoizes functional components and skips re-renders when props do not change (shallow
    comparison). It is useful for optimizing performance in components that render frequently or receive
    stable props. However, it should not be overused because memoization has overhead and does not work
    unless props are stable (useCallback/useMemo may be required). Use React.memo when you want to prevent
    unnecessary re-renders, but measure performance before applying it widely.”
*/

