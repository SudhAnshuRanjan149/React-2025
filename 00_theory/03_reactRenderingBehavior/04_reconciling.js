/* ==============================================================================================
   Reconciling Elements with Keys in React — Deep, Interview-Ready Explanation
   ==============================================================================================

   Keys are one of the MOST misunderstood concepts in React. They directly affect how React
   performs *reconciliation* — the algorithm that determines how the Virtual DOM updates the
   REAL DOM with minimal changes.

   Understanding how keys work will:
     ✔ prevent bugs
     ✔ fix UI glitches
     ✔ avoid unnecessary re-renders
     ✔ preserve component state correctly
     ✔ increase performance

   This is a complete explanation.
*/


/* ==============================================================================================
   1) What is Reconciliation?
   ==============================================================================================

   Reconciliation = React’s diffing algorithm that compares:
     - previous Virtual DOM tree
     - new Virtual DOM tree

   Goal:
     → Apply *minimal DOM updates* while keeping UI correct.

   React attempts to *match* elements from the old tree to those in the new tree.
   If React thinks an element is “the same,” it will:
     - reuse DOM nodes
     - preserve component state
     - only apply necessary prop changes

   Keys help React correctly identify which items match.
*/


/* ==============================================================================================
   2) Why Keys Exist (REAL Answer)
   ==============================================================================================

   Keys let React **uniquely identify elements in a list**.

   Keys help React decide:
     ✔ which items stayed the same  
     ✔ which items changed  
     ✔ which items moved  
     ✔ which items were added or removed  

   Without keys, React guesses based on index — and it guesses WRONG when lists mutate.
*/


/* ==============================================================================================
   3) How React Reconciles Lists Without Keys
   ==============================================================================================

   Example (bad practice):
*/
const items = ["A", "B", "C"];
items.map((item, index) => <li key={index}>{item}</li>);

/*
   If you add/remove/reorder items, React assumes:
     - index 0 old item → index 0 new item = SAME
     - index 1 old item → index 1 new item = SAME
     - ... even when they changed

   This causes:
     ❌ Wrong component state reassignment  
     ❌ Incorrect animations  
     ❌ Input fields swapping values  
     ❌ Performance issues due to remounting  
*/


/* ==============================================================================================
   4) How React Reconciles Lists WITH Keys (Correct)
   ============================================================================================== */

const items1 = [
  { id: 101, name: "A" },
  { id: 102, name: "B" },
  { id: 103, name: "C" },
];
items1.map(item => <li key={item.id}>{item.name}</li>);

/*
   Keys allow React to do identity-based diffing:

   Old VDOM: [101, 102, 103]
   New VDOM: [103, 101, 102]

   React sees:
     - 103: move it
     - 101: move it
     - 102: move it

   DOM nodes reused ✔
   Internal state preserved ✔
   Minimal updates applied ✔
*/


/* ==============================================================================================
   5) What happens when keys change? (VERY IMPORTANT)
   ==============================================================================================

   If the key of an element changes, React treats it as:

       Old element = removed (unmount)
       New element = created (mount)

   Effect:
     - Component state is lost
     - useEffect cleanup runs
     - New component instance is created

   Example:
*/
function Example({ id }) {
  return <Child key={id} />;
}

/*
   If `id` changes → Child is destroyed & remounted.
*/


/* ==============================================================================================
   6) Why "index as key" is problematic
   ==============================================================================================

   Using index as key:

      key={index}

   Problems arise when:
     ✔ item order changes  
     ✔ items are inserted or removed  
     ✔ items are filtered  
     ✔ items are sorted  

   Example of bug:
     - You have a list of input fields
     - You type into item 2
     - User inserts a new item at top
     - Input you typed shifts incorrectly because React reused wrong DOM node

   This happens because:
     old index 1 → new index 1  
     React assumes SAME item → state reused incorrectly  
*/


/* ==============================================================================================
   7) When index AS key is okay (rare, but valid)
   ==============================================================================================

   Using index is acceptable only when:
     ✔ list NEVER reorders  
     ✔ list NEVER filters  
     ✔ list NEVER sorts  
     ✔ items are static (one-time render only)  
     ✔ items are guaranteed stable

   Example:
      Rendering 3 static cards in a fixed order → index is fine.
*/


/* ==============================================================================================
   8) Best Key Choices
   ==============================================================================================

   ✔ Use unique stable IDs from the data:
      key={item.id}

   If no id exists:
     ✔ generate stable id when data is created (UUID / nanoid)
     ✔ use database ID
     ✔ use a combination of fields to form a stable key

   NEVER use:
     ✖ random keys (Math.random())  
     ✖ unstable values that change every render  
     ✖ array index (except static lists)  
*/


/* ==============================================================================================
   9) Component State + Keys (CRITICAL)
   ==============================================================================================

   Local component state is stored by React *under the key*.

   Example:
*/
function Row({ item }) {
  const [value, setValue] = useState(item.name);
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}

{items.map(item => <Row key={item.id} item={item} />)}

/*
   If keys are correct → state sticks to correct item.
   If keys are BAD (like index):
     - internal state gets PASSED to a different item
     - producing extremely confusing bugs
*/


/* ==============================================================================================
   10) How React matches old & new elements (Detailed Algorithm)
   ==============================================================================================

   React reconciles lists in two passes:

   PASS 1 — Match by keys:
     - Compare old keys vs new keys
     - Reuse nodes with matching keys
     - Mark unmatched ones for deletion or creation

   PASS 2 — Detect moves:
     - If order changed, React moves DOM nodes
     - Still MUCH cheaper than remounting

   Keys allow React to perform:
     ✔ identity matching  
     ✔ stable state mapping  
     ✔ minimal DOM operations  
*/


/* ==============================================================================================
   11) Example — Bad Keys Causing UI Jumps
   ============================================================================================== */

function App() {
  const [list, setList] = useState(["A", "B", "C"]);

  return list.map((item, index) => (
    <input key={index} defaultValue={item} />
  ));
}

/*
   When item is inserted at top:
     - All inputs shift down
     - DOM nodes reused wrongly
     - Text typed in input #2 moves to input #3
*/


/* ==============================================================================================
   12) Example — Good Keys Fix Everything
   ============================================================================================== */

function App() {
  const [list, setList] = useState([
    { id: 101, value: "A" },
    { id: 102, value: "B" },
    { id: 103, value: "C" }
  ]);

  return list.map(item => (
    <input key={item.id} defaultValue={item.value} />
  ));
}

/*
   Now even if order changes:
     - each input keeps its own DOM element
     - state preserved
     - no UI glitches
*/


/* ==============================================================================================
   13) Keys also help performance
   ==============================================================================================

   With good keys:
     - React reuses nodes efficiently
     - Only minimal DOM patches applied
     - No unnecessary unmount/mount operations
     - Fewer effects cleanup + mount cycles
*/


/* ==============================================================================================
   14) Final Interview-Ready Summary
   ==============================================================================================

   ✔ Keys allow React to identify list items between renders  
   ✔ Keys must be unique, stable, and tied to the data  
   ✔ Avoid using array index as key (unless list is static)  
   ✔ Keys prevent bugs like incorrect state reuse and UI jumps  
   ✔ Changing a key forces React to unmount & remount a component  
   ✔ Keys power reconciliation and efficient DOM diffing  
   ✔ Correct keys → minimal updates, preserved state, best performance  

   One-liner:
     “Keys tell React which items are the same, enabling efficient reconciliation and correct
      component state preservation. Without stable keys, React may misalign items, cause bugs,
      and perform unnecessary DOM work.”
*/
