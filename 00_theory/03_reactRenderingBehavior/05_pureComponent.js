/* ==========================================================================================================
   PureComponent in React — Legacy Optimization Concept (Deep, Interview-Ready Explanation)
   ==========================================================================================================

   React.PureComponent is a **class component optimization technique** used BEFORE hooks existed.
   It helps reduce unnecessary re-renders by implementing a built-in shallow comparison of props + state.

   Although it's *legacy* today (functional components + React.memo are preferred), companies still ask
   about PureComponent in interviews — especially when maintaining old codebases.

   Below is a full, modern + historical explanation.
*/


/* ==========================================================================================================
   1) What is React.PureComponent?
   ==========================================================================================================

   React.PureComponent is similar to React.Component, except it automatically implements:

       shouldComponentUpdate(nextProps, nextState)

   with **shallow comparison** of:
       - current props vs next props
       - current state vs next state

   If NOTHING changed (shallow equal), the component SKIPS re-rendering.

   Syntax:
*/
class MyComponent extends React.PureComponent {
  render() {
    console.log("Rendered");
    return <div>{this.props.value}</div>;
  }
}

/*
   Behavior:
     - If props or state are identical by shallow compare → NO re-render.
     - If any prop or state field is changed → re-render.
*/


/* ==========================================================================================================
   2) How shallow comparison works (VERY IMPORTANT)
   ==========================================================================================================

   Shallow compare checks:
     1) Primitives → by value
     2) Objects/Arrays/Functions → by reference

   Example:
     "A" === "A"      → true
     10 === 10        → true

     {a: 1} === {a: 1}      → false (different references)
     [] === []              → false
*/


/* ==========================================================================================================
   3) PureComponent Example — Avoids Unnecessary Re-renders
   ========================================================================================================== */
class Child extends React.PureComponent {
  render() {
    console.log("Child render");
    return <div>{this.props.value}</div>;
  }
}

class Parent extends React.Component {
  state = { count: 0 };

  render() {
    return (
      <>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Parent {this.state.count}
        </button>

        {/* Child receives fixed value → re-render skipped after first render */}
        <Child value="Static"> </Child>
      </>
    );
  }
}

/*
   Because Child is a PureComponent:
     ✔ Parent re-renders
     ✔ Child does NOT re-render because value prop did NOT change
*/


/* ==========================================================================================================
   4) Why PureComponent may not work as expected
   ==========================================================================================================

   Because it only does shallow comparison,
   objects/functions/arrays passed as props will always fail the check.

*/
class ParentBad extends React.Component {
  render() {
    return <Child data={{ a: 1 }} />; // new object EVERY render
  }
}

/*
   PureComponent sees:
     prevProps.data !== nextProps.data
   → re-render EVERY time (no optimization)
*/

//
// FIX: Use stable references
//
// Example:
class ParentGood extends React.Component {
  data = { a: 1 }; // stable reference

  render() {
    return <Child data={this.data} />;
  }
}

/*
   OR in functional components: useMemo()
*/


/* ==========================================================================================================
   5) PureComponent vs React.Component
   ==========================================================================================================

   | Feature                      | React.Component          | React.PureComponent     |
   |------------------------------|---------------------------|---------------------------|
   | shouldComponentUpdate        | always re-renders         | shallow compare           |
   | Performance                  | may re-render often       | avoids unnecessary renders |
   | Comparison type              | none                      | shallow props + state     |
   | Use case                     | default choice            | optimization needed        |
*/


/* ==========================================================================================================
   6) PureComponent vs React.memo (modern functional equivalent)
   ==========================================================================================================

   React.memo is the hook-era replacement for PureComponent.

   | Feature                  | PureComponent (Class)        | React.memo (Function)   |
   |--------------------------|-------------------------------|--------------------------|
   | Component type           | Class-based                   | Functional               |
   | Comparison               | shallow props + state         | props only               |
   | Custom comparator        | ❌ no                         | ✔ yes                    |
   | Recommended today        | ❌ legacy                     | ✔ modern standard         |

   --> PureComponent = React.memo for class components.
*/


/* ==========================================================================================================
   7) When PureComponent is useful (still relevant)
   ==========================================================================================================

   ✔ In legacy class-based codebases  
   ✔ When optimizing heavy subtrees  
   ✔ When props/state are mostly primitives or stable references  
   ✔ When maintaining old enterprise applications  

   NOT ideal when:
     ✖ props often include new objects/functions  
     ✖ state updates use mutable patterns (PureComponent will detect changes incorrectly)  
*/


/* ==========================================================================================================
   8) Pitfalls of PureComponent
   ==========================================================================================================

   ❌ Pitfall 1: Shallow comparison on nested objects fails
---------------------------------------------------------- */
class BadChild extends React.PureComponent {}
<BadChild user={{ name: "John" }} />;
/*
   ALWAYS re-renders because new object every render.
*/

/*
   ❌ Pitfall 2: Mutable state breaks PureComponent
      Changing nested state directly does NOT produce new reference → PureComponent doesn’t detect changes.

   Example:
*/
this.state.profile.age = 20; // ❌ mutation
this.setState({ profile: this.state.profile });

/*
   PureComponent sees SAME object reference → SKIPS re-render → UI won't update
*/


/*
   ❌ Pitfall 3: Overusing PureComponent harms performance
      Shallow comparison cost can outweigh benefits in simple components.
*/


/* ==========================================================================================================
   9) PureComponent with shouldComponentUpdate
   ==========================================================================================================

   PureComponent *automatically* implements shouldComponentUpdate.

   If you need custom logic, use React.Component and write your own shouldComponentUpdate:
*/
class CustomSCU extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.value !== this.props.value; // your own optimization
  }
}


/* ==========================================================================================================
   10) Final Interview Summary
   ==========================================================================================================

   “React.PureComponent is a class-based optimization that skips re-rendering when props and state have
    not changed (shallow comparison). It acts like a built-in shouldComponentUpdate. It improves performance
    when props/state are primitive or stable but fails when props contain new object references or when
    state is mutated. In modern React, React.memo replaces PureComponent for functional components.”

*/
