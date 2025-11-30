/* ==========================================================================================================
   Context API in React — Use Cases + Performance Issues (Deep, Interview-Ready Explanation)
   ==========================================================================================================

   The Context API allows React components to share values across the component tree WITHOUT passing props
   manually at every level (avoiding “prop drilling”). It is one of the most powerful but commonly misused
   APIs in React.

   Below is a complete, deeply detailed explanation:
      ✔ What Context is
      ✔ Why it exists
      ✔ How it works internally
      ✔ Best use cases
      ✔ Performance issues (very important)
      ✔ How to optimize context usage
*/


/* ==========================================================================================================
   1) What is the Context API?
   ==========================================================================================================

   The Context API provides:

      1) A way to create a shared “global-ish” value
      2) A Provider component to supply the value
      3) A Consumer (or useContext) to read the value anywhere below it

   Example:
*/
const ThemeContext1 = React.createContext("light"); // default value

function App() {
  return (
    <ThemeContext1.Provider value="dark">
      <Toolbar />
    </ThemeContext1.Provider>
  );
}

function Button() {
  const theme = useContext(ThemeContext1);
  return <button className={theme}>Click</button>;
}

/*
   ✔ No prop drilling needed
   ✔ Any child can access theme
*/


/* ==========================================================================================================
   2) What does Context actually solve?
   ==========================================================================================================

   Context solves the problem of:
      ❌ Passing props through multiple layers of components just to reach a deeply nested child

   For example:
      <App>
        <Layout theme={theme}>
          <Sidebar theme={theme}>
            <Button theme={theme} />
          </Sidebar>
        </Layout>
      </App>

   With context:
      <ThemeProvider>
        <App>
          <Layout>
            <Sidebar>
              <Button />
            </Sidebar>
          </Layout>
        </App>
      </ThemeProvider>
*/


/* ==========================================================================================================
   3) Use Cases — When Context is the right tool
   ==========================================================================================================

   ✔ Use context when values are *global and stable*:

   (A) **Theme**
        - Dark/light mode
        - Typography, colors, spacing

   (B) **Localization (i18n)**
        - Current language
        - Text direction (LTR/RTL)

   (C) **Authentication**
        - Current user object
        - Login/logout state

   (D) **Application environment**
        - Feature flags
        - Config values
        - Permissions

   (E) **Global UI state (but not too dynamic)**
        - Modal open/close
        - Sidebar toggle

   (F) **Forms composed of many nested inputs** (conceptually similar to Formik, React Hook Form)

   Key rule:
     → If many components need access to the same value *and the value rarely changes* → Context is perfect.
*/


/* ==========================================================================================================
   4) Important Concept: Context = “Value propagation mechanism”
   ==========================================================================================================

   Context is *NOT* state management.
   Context is *NOT* an alternative to Redux/Zustand/Recoil.

   Context merely *PROVIDES* values — it does NOT manage state transitions.

   But you can combine:
      • Context → provides a store
      • useReducer or external store → manages logic
*/


/* ==========================================================================================================
   5) PERFORMANCE ISSUE #1 — Context makes ALL consumers re-render
   ==========================================================================================================

   Whenever Provider.value changes:

      🔥 EVERY COMPONENT using useContext(YourContext) re-renders

   regardless of:
      - whether they use the updated field
      - how deep the component is
      - how big the subtree is
      - even if the value change is irrelevant to them

   Example:
*/
const AuthContext1 = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const value = { user, setUser }; // ❗ new object every render

  return (
    <AuthContext1.Provider value={value}>
      <Navbar />        // re-renders
      <Sidebar />       // re-renders
      <Content />       // re-renders
    </AuthContext1.Provider>
  );
}

/*
   Even a small state update (setUser) re-renders the ENTIRE subtree.

   This is the #1 performance pitfall of Context.
*/


/* ==========================================================================================================
   6) PERFORMANCE ISSUE #2 — Provider value identity matters
   ==========================================================================================================

   If you pass an object/function in `value`, React compares by reference:

      <Provider value={{ a: 1 }}>   // new object EVERY render → ALL consumers re-render

   FIX:
      useMemo for stable reference
*/
const value1 = useMemo(() => ({ user, setUser }), [user]);
<AuthContext1.Provider value={value1}>...</AuthContext1.Provider>;

/*
   ✔ Now context updates only when user changes, not on every App render
*/


/* ==========================================================================================================
   7) PERFORMANCE ISSUE #3 — Too much data inside one context
   ==========================================================================================================

   Example of BAD context:
*/
const AppContext1 = React.createContext({
  user: null,
  theme: "dark",
  language: "en",
  cart: [],
  notifications: []
});

/*
   If ANY of these fields change → ALL consumers re-render.

   This leads to huge wasted rendering work.
*/


/* ==========================================================================================================
   8) BEST PRACTICE — SPLIT CONTEXTS (granular contexts)
   ==========================================================================================================

   Instead of one giant context:

   ❌ BAD:
*/
const AppContext = React.createContext();

/*
   ✔ GOOD — break into focused contexts:
*/
const AuthContext = React.createContext();
const ThemeContext = React.createContext();
const LanguageContext = React.createContext();
const CartContext = React.createContext();

/*
   Each value now only re-renders its OWN consumers.
*/


/* ==========================================================================================================
   9) PERFORMANCE ISSUE #4 — Frequent state changes inside context
   ==========================================================================================================

   If context provider updates state very frequently:
      - typing input
      - scrolling
      - timers
      - animation frames

   → All consumers re-render on every frame

   WRONG:
*/
const MouseContext = React.createContext();

function App() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <MouseContext.Provider value={pos}>
      <CursorFollower />  // re-renders 60 times/sec
      <AnalyticsTracker />
      <Sidebar />
    </MouseContext.Provider>
  );
}

/*
   This destroys performance.

   FIX:
     - Do NOT use context for HIGH-FREQUENCY state
     - Use event emitter, subscription, or local state
*/


/* ==========================================================================================================
   10) PERFORMANCE OPTIMIZATION STRATEGIES
   ==========================================================================================================

   Strategy A — useMemo for Provider value
   --------------------------------------- */
const value = useMemo(() => ({ user, login, logout }), [user]);


/*
   Strategy B — Split contexts into multiple providers
   --------------------------------------------------- */
<ThemeProvider>
  <AuthProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </AuthProvider>
</ThemeProvider>


/*
   Strategy C — Selectors + external store instead of pure context
   ----------------------------------------------------------------
   Use libraries that allow fine-grained subscription:

     - Zustand
     - Jotai
     - Redux Toolkit (with useSelector)
     - Recoil
     - Valtio

   These avoid re-rendering entire subtrees.
*/


/*
   Strategy D — Component splitting + memoization
   ---------------------------------------------- */
const UserName = React.memo(function UserName() {
  const { user } = useContext(AuthContext);
  return <span>{user.name}</span>;
});


/*
   Strategy E — useSyncExternalStore (React 18+)
   --------------------------------------------- */
const online = useSyncExternalStore(subscribe, getSnapshot);


/* ==========================================================================================================
   11) Real-World Examples of Context Usage
   ==========================================================================================================

   GOOD use cases:
      ✔ ThemeProvider (dark/light)
      ✔ AuthProvider (current user)
      ✔ LanguageProvider (i18n)
      ✔ FeatureFlagProvider
      ✔ Global config provider
      ✔ React Router (internally uses context)

   BAD use cases:
      ✖ storing large dynamic lists
      ✖ frequent updates: mouse position, scroll position
      ✖ storing form fields that change rapidly
      ✖ passing huge objects or functions without memoization
*/


/* ==========================================================================================================
   12) FINAL INTERVIEW SUMMARY
   ==========================================================================================================

   “The Context API allows you to avoid prop drilling by passing values deeply through the component tree.
    Context is ideal for global configuration-like values (theme, auth, locale). However, context has major
    performance pitfalls: ANY change to the Provider's value re-renders ALL consumers. To avoid performance
    issues, memoize provider values, split large contexts into smaller ones, avoid passing new object references,
    and avoid storing high-frequency state in context.”

*/