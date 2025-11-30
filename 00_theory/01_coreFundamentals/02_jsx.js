// ==============================
// JSX — How it works & Why it's NOT HTML (detailed, interview-friendly)
// ==============================

/**
 * Short TL;DR:
 *  - JSX is a JavaScript *syntax extension* that looks like HTML but compiles to JS calls that create React elements.
 *  - It's not HTML: it's an expression that returns a lightweight object (a "React element"), has JS semantics, different attribute names,
 *    and is handled by a compiler (Babel/TSX transform) — not the browser's HTML parser.
 *
 * Why this distinction matters:
 *  - Understanding JSX behavior explains how data binding, events, and rendering actually work in React,
 *    and helps avoid common pitfalls (attributes like `className`, style objects, expression evaluation, XSS handling, etc.).
 */

/* ---------------------------
   1) JSX is syntactic sugar
   ---------------------------
   Example JSX:
     const el = <h1 id="g">Hello {name}</h1>

   What it compiles to (classic runtime):
     const el = React.createElement(
       "h1",
       { id: "g" },
       "Hello ",
       name
     )

   What it compiles to (automatic runtime, newer builds):
     import { jsx as _jsx } from "react/jsx-runtime"
     const el = _jsx("h1", { id: "g", children: ["Hello ", name] })

   Important: the result is a plain JS object (React element), not a DOM node.
   React uses that object in reconciliation to decide what to render to the DOM.
*/

/* ---------------------------
   2) JSX is an EXPRESSION — not a template
   ---------------------------
   - You can use it anywhere an expression is allowed (assign to var, return from function, pass as arg).
   - It evaluates at runtime (values inside { } are JS expressions).
   Example:
     function Greeting({ user }) {
       return <div>{user ? `Hi ${user.name}` : <LoginButton />}</div>
     }

   Notes:
   - Curly braces { } let you embed any JS expression: variables, function calls, ternaries, && short-circuit.
   - `null`, `false`, and `true` render nothing (except 0 renders 0).
*/

/* ---------------------------
   3) JSX vs HTML — key differences
   ---------------------------

   1. Attribute names:
      - HTML:     <label for="x" class="btn">...
      - JSX:      <label htmlFor="x" className="btn">...
      Reason: `for` and `class` are reserved/meaningful in JS; JSX follows DOM property names.

   2. style prop:
      - HTML:     <div style="color: red; font-size: 12px"></div>
      - JSX:      <div style={{ color: 'red', fontSize: 12 }} />
      Reason: JSX `style` expects a JS object mapping CSS properties (camelCased) to values.

   3. Boolean/enum attributes:
      - HTML:     <input disabled>
      - JSX:      <input disabled={true} />  // or just disabled
      - For false: <input disabled={false} /> results in no attribute.

   4. Event handlers:
      - HTML:     <button onclick="do()" />
      - JSX:      <button onClick={doSomething} />
      - Events use camelCase and receive functions (not strings).

   5. className not class:
      - Use className to set CSS classes.

   6. Self-closing tags:
      - In JSX every tag must be closed: <img src="..." /> or <div></div>

   7. Comments:
      - HTML comments <!-- --> are not valid inside JSX. Use JS comments inside braces:
        {/ * this is a JSX comment * /} -> space between * and / to avoid closing the comment here.

   8. JSX elements starting with lowercase vs uppercase:
      - lowercase (e.g., 'div') -> treated as DOM tag (string)
      - Uppercase (MyComp)   -> treated as component (variable reference)
      - So `<div />` → "div"; `<MyComp />` → call MyComp (JS function/class)

   9. Spread props:
      - <Comp {...props} extra="x" /> spreads an object into props (convenient, but watch overrides)
*/

/* ---------------------------
   4) JSX is safe by default — XSS protection
   ---------------------------
   - When you put a string into JSX it is escaped:
       const a = "<img src=x onerror=evil()>"
       <div>{a}</div>  // renders the string literally, not the image
   - To intentionally insert raw HTML you must use:
       <div dangerouslySetInnerHTML={{ __html: someHtmlString }} />
     That explicit API signals risk and must be used carefully.
*/

/* ---------------------------
   5) Children rules & arrays
   ---------------------------
   - You can pass strings, numbers, Elements, arrays, null, booleans as children.
   - Arrays are flattened and their items are rendered:
       <ul>{items.map(i => <li key={i.id}>{i.text}</li>)}</ul>
   - Keys are crucial for lists so React can match items during reconciliation.
   - If children are false/null/undefined they are skipped (no DOM output).
*/

/* ---------------------------
   6) JSX produces React ELEMENTS (immutable descriptors)
   ---------------------------
   - A React element is an immutable object: { type, props, key, ref, ... }.
   - When state/props change, React re-runs your component function to produce new element trees (VDOM),
     then it diffs those against previous ones and updates the DOM.
   - Because elements are immutable descriptors, you don't mutate them — you create new ones.
*/

/* ---------------------------
   7) Compile-time transform & tooling
   ---------------------------
   - Browsers don't understand JSX directly; a transpiler (Babel, TypeScript) transforms JSX to JS.
   - Classic transform: JSX -> React.createElement(...)
   - Automatic runtime (React 17+ tooling): JSX -> jsx()/jsxs() calls from 'react/jsx-runtime'
     * automatic runtime removes the need to `import React from 'react'` when just using JSX.
   - TSX: TypeScript variant of JSX; files end in .tsx and typing rules apply.
   - You can change pragma (what function JSX compiles to) if using other libraries (e.g., Preact).
*/

/* ---------------------------
   8) Examples (illustrative)
   --------------------------- */

//// Basic expression with children
const name = "Alex"
const greeting = <h1>Hello, {name}</h1>
// classic -> React.createElement("h1", null, "Hello, ", name)

//// Conditional rendering
function Welcome({ user }) {
  return (
    <div>
      {user ? <p>Welcome back, {user.name}</p> : <button>Sign in</button>}
    </div>
  )
}

//// List with keys (good)
const todos = [{ id: 5, text: "Buy" }, { id: 9, text: "Read" }]
const list = <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>

//// Style object
const box = <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>Box</div>

//// Event handler
function Clicker() {
  return <button onClick={() => console.log("clicked")}>Click</button>
}

//// Fragment shorthand (no extra DOM node)
const f = <>
  <h2>Title</h2>
  <p>Paragraph</p>
</>

/* ---------------------------
   9) Common pitfalls & interview gotchas
   ---------------------------
   - Using array index as key when list order can change → leads to unexpected DOM reuse and state bugs.
   - Forgetting to close tags: <input> is invalid, must be <input /> in JSX.
   - Using `class` or `for` (use className, htmlFor).
   - Passing functions incorrectly to event handlers: onClick={do()} executes immediately; use onClick={do}.
   - Expecting JSX to be a template language that auto-updates variables — it's just JS expressions; updates happen when React re-renders.
   - Mutating props or elements (they're immutable descriptors); instead derive new props/state.
   - Assuming JSX adds performance cost — creating the VDOM is cheap relative to DOM updates; however, render work can be expensive if you do heavy computation in render (useMemo etc. where necessary).
*/

/* ---------------------------
   10) Practical tips & best practices
   ---------------------------
   - Keep JSX small and declarative: prefer extracting logic to helpers/hooks, keep render focused on "what" to show.
   - Use descriptive keys (stable ids) in lists.
   - Avoid large inline style objects recreated every render if performance matters — memoize or use class-based styling.
   - Use fragments to avoid unnecessary wrapper DOM nodes.
   - Prefer event handler function references (useCallback when passing to deep children that rely on referential equality).
   - Use TypeScript (TSX) for safer prop typing in larger codebases.
*/

/* ---------------------------
   11) One-line canonical answer for interviews
   ---------------------------
   - JSX is a JavaScript syntax extension that looks like HTML but compiles to JS calls producing React element objects.
   - It's not HTML: it's typed JS, uses JS expressions, different attribute names (className/htmlFor), style objects, and must be transformed by a compiler before executing.
*/

/* ==============================
   End of JSX explanation
   ============================== */
