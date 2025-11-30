/* ==============================================================  
   Props vs State in React — Detailed, Interview-Grade Explanation  
   ============================================================== */

/**
 * ------------------------------------------------------------
 * 1) What are PROPS? (Parent → Child data)
 * ------------------------------------------------------------
 * - Props = **inputs passed into a component**.
 * - They are **read-only**, **immutable**, and **controlled by the parent**.
 * - Used to configure a component or pass data down the tree.
 * - A component cannot modify its own props.
 *
 * Analogy:
 *   - Props are like function parameters.
 *   - The parent decides the values; the child only reads them.
 *
 * Example:
 */
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}
// Usage: <Greeting name="Alex" />
// Here: name prop = "Alex"

/**
 * Key Characteristics of Props:
 * - Passed from parent to child
 * - Immutable inside the child
 * - Help make components reusable
 * - Cause a re-render when parent passes new values
 *
 * Props DO NOT:
 * - Store local data
 * - Change internally
 */

/**
 * ------------------------------------------------------------
 * 2) What is STATE? (Internal data of a component)
 * ------------------------------------------------------------
 * - State = **data managed inside a component**.
 * - A component can **read AND update** its own state.
 * - When state changes → component re-renders.
 * - State is fully local; parents don't control it directly.
 *
 * Analogy:
 *   - State is like variables inside a function that persist across renders.
 *
 * Example:
 */
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0); // state

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

/**
 * Key Characteristics of State:
 * - Mutable (updated using setState/useState)
 * - Stored within the component instance
 * - Triggers re-render on update
 * - Used for interactive, changing data (input values, toggles, API data)
 */

/**
 * ------------------------------------------------------------
 * 3) Props vs State — Side-by-Side Comparison
 * ------------------------------------------------------------
 *
 * | Feature                | Props                              | State                                  |
 * |------------------------|-------------------------------------|----------------------------------------|
 * | Who owns it?           | Parent component                    | Component itself                       |
 * | Read/Write?            | Read-only                           | Read + Write (mutable via setter)      |
 * | Can child modify it?   | ❌ No                               | ✔ Yes                                  |
 * | Triggers re-render?    | ✔ Yes (when new props are passed)   | ✔ Yes (when setState/useState called)  |
 * | Purpose                | Configure component                 | Manage local dynamic data              |
 * | Analogy                | Function parameters                 | Local variables that persist           |
 * | Immutable?             | ✔ Yes                               | ❌ No (but updated immutably!)         |
 */

/**
 * ------------------------------------------------------------
 * 4) How Props & State Work Together
 * ------------------------------------------------------------
 * - Props supply **external data** into the component.
 * - State manages **internal data** inside the component.
 *
 * Example: parent passes initial value → child manages updates.
 */
function Parent() {
  return <Counter initial={5} />;
}

function Counter({ initial }) {
  const [count, setCount] = useState(initial);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

/**
 * Parent controls the initial value (prop).
 * Component controls updates to that value (state).
 */

/**
 * ------------------------------------------------------------
 * 5) Immutable vs Mutable (Very Important Concept)
 * ------------------------------------------------------------
 * Props:
 *   - Immutable inside child.
 *   - If parent changes props → child re-renders.
 *
 * State:
 *   - You MUST update it immutably:
 *       setItems([...items, newItem])  // correct
 *       items.push(newItem); setItems(items) // ❌ mutation leads to bugs
 */

/**
 * ------------------------------------------------------------
 * 6) Common Interview Questions (with answers)
 * ------------------------------------------------------------
 *
 * Q1: Why are props immutable?
 * A: To maintain one-way data flow. Child should not change parent-owned values.
 *
 * Q2: Does updating state always trigger a re-render?
 * A: Yes, if the new state is different (React skips if same reference/value).
 *
 * Q3: Can props be defaulted?
 * A: Yes using default parameters or defaultProps (legacy).
 *
 * Q4: Should props be used to store component-specific data?
 * A: No. Use state for internal data that changes.
 *
 * Q5: Can state be passed to children?
 * A: Yes—via props. Parents can pass state down, but children cannot modify it directly.
 *
 * Q6: What if the child needs to update parent state?
 * A: Parent passes a callback as prop:
 *       <Child onChange={setValue} />
 */

/**
 * ------------------------------------------------------------
 * 7) Practical Example — Props + State in action
 * ------------------------------------------------------------
 */
function TodoApp() {
  const [todos, setTodos] = useState([]);

  function addTodo(text) {
    setTodos([...todos, { id: Date.now(), text }]);
  }

  return (
    <>
      <TodoInput onAdd={addTodo} />                {/* passing callback as prop */}
      <TodoList items={todos} />                   {/* passing data as props */}
    </>
  );
}

function TodoInput({ onAdd }) {
  const [text, setText] = useState("");

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => onAdd(text)}>Add</button>
    </div>
  );
}

function TodoList({ items }) {
  return <ul>{items.map(t => <li key={t.id}>{t.text}</li>)}</ul>;
}

/**
 * Here:
 * - Parent holds todos (state).
 * - Child receives items via props (read-only).
 * - Child updates parent state via onAdd callback.
 */

/**
 * ------------------------------------------------------------
 * 8) Final Interview-Friendly Summary
 * ------------------------------------------------------------
 * - Props are external, read-only inputs passed from parent to child.
 * - State is internal, mutable data managed by the component itself.
 * - Props help configure a component; state makes components interactive.
 * - State updates cause re-renders. Props change when parent re-renders.
 * - React’s one-directional data flow: parent → child via props.
 *
 * One-liner:
 *   “Props are how components receive data; state is how
 *    components manage and update their own data.”
 */

// ==============================
// End of Explanation
// ==============================
