/* ==================================================================================================
   useContext in React — Avoiding Prop Drilling (Deep, Interview-Ready Explanation)
   ==================================================================================================

   useContext is a hook that allows you to share data *without manually passing props* through every
   level of the component tree.

   It solves a critical problem in React apps: **prop drilling**.
*/


/* ==================================================================================================
   1) What is Prop Drilling?
   ==================================================================================================
   PROP DRILLING happens when:
     - A parent component needs to pass data to a deeply nested component…
     - …and intermediate components pass the same props even though they don’t use them.

   Example:
      <App>
        <Parent theme={theme}>
          <Child theme={theme}>
            <Button theme={theme} />
          </Child>
        </Parent>
      </App>

   Problem:
     - Repetitive props
     - Hard to maintain
     - Unnecessary re-renders
     - Fragile structure (breaks easily when nesting changes)
*/


/* ==================================================================================================
   2) What is useContext? (React’s built-in solution for prop drilling)
   ==================================================================================================
   useContext allows you to:
     ✔ create a “global-ish” value for a subtree  
     ✔ access it from any component in that subtree  
     ✔ avoid passing props through each level  

   It works together with:
     1) React.createContext() → creates context object  
     2) <Context.Provider /> → makes value available  
     3) useContext(Context) → reads the value  
*/


/* ==================================================================================================
   3) Creating a context
   ================================================================================================== */
const ThemeContext = React.createContext("light"); 
// "light" is default value (used if no Provider is present)


/* ==================================================================================================
   4) Providing a value
   ================================================================================================== */
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

/*
   Now every component inside <Provider> can read "dark"
*/


/* ==================================================================================================
   5) Consuming context with useContext
   ================================================================================================== */
function Button() {
  const theme = useContext(ThemeContext); // access context
  return <button className={theme}>Click</button>;
}

/*
   ✔ No need to pass “theme” through props.
   ✔ Access from anywhere inside Provider.
*/


/* ==================================================================================================
   6) Context Flow (Conceptual)
   ==================================================================================================

   [Provider] --makes--> value available
       |
       └── ChildA
             └── ChildB
                   └── ChildC (uses useContext)

   Even if nested deeply, ChildC can read the value WITHOUT prop drilling.
*/


/* ==================================================================================================
   7) Context is NOT global state (important distinction)
   ==================================================================================================
   Context is:
     - scoped to a Provider
     - used for **values that rarely change** (theme, language, auth user)
     - NOT a replacement for state management libraries (like Redux, Zustand)

   Context ≠ Redux.
   Context ≠ store.
   Context ≠ universal global.
*/


/* ==================================================================================================
   8) Example: Avoiding prop drilling (before vs after)
   ================================================================================================== */

// BEFORE — prop drilling
function App() {
  return <Parent theme="dark" />;
}

function Parent({ theme }) {
  return <Child theme={theme} />;
}

function Child({ theme }) {
  return <Button theme={theme} />;
}

function Button({ theme }) {
  return <button className={theme}>Click</button>;
}

// AFTER — useContext, no drilling
const ThemeContext2 = React.createContext();

function App2() {
  return (
    <ThemeContext2.Provider value="dark">
      <Parent2 />
    </ThemeContext2.Provider>
  );
}

function Parent2() { return <Child2 />; }
function Child2() { return <Button2 />; }

function Button2() {
  const theme = useContext(ThemeContext2);
  return <button className={theme}>Click</button>;
}


/* ==================================================================================================
   9) Updating context values (dynamic context)
   ==================================================================================================
   You can store state INSIDE the provider and pass it down.
*/
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = () => setUser({ name: "Alex" });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function Navbar() {
  const { user, login, logout } = useContext(AuthContext);

  return (
    <nav>
      {user ? (
        <>
          Welcome {user.name} <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </nav>
  );
}

/*
   ✔ Any component inside AuthProvider can access user/login/logout
*/


/* ==================================================================================================
   10) Context Re-render Behavior (VERY IMPORTANT INTERVIEW TOPIC)
   ==================================================================================================
   - All consumers re-render when the provider’s value changes.
   - Even if only one field changes (object reference changed) → entire subtree re-renders.

   Optimization trick:
      useMemo to avoid unnecessary re-renders.
*/
const value = useMemo(() => ({ user, login, logout }), [user]);
<AuthContext.Provider value={value}>...</AuthContext.Provider>;


/* ==================================================================================================
   11) When to use context (BEST PRACTICES)
   ==================================================================================================
   ✔ Global configuration values:  
       - theme  
       - language  
       - direction (LTR/RTL)  

   ✔ User/authentication data  

   ✔ App-level settings  

   ✔ Rarely changing values  

   DO NOT use context for:
   ✖ frequently updated values (scroll positions, typing input, timers)  
   ✖ large, high-frequency state (use state managers instead)  
   ✖ performance-critical data without memoization  


/* ==================================================================================================
   12) Common Pitfalls
   ==================================================================================================
   1) Using context for rapidly-changing state → performance issues  
   2) Forgetting to memoize large values → causes re-renders  
   3) Creating context inside component → new context on each render  
   4) Deep updates without splitting context → large re-renders  
   5) Using context as a replacement for all state → misuse  


/* ==================================================================================================
   13) Final Interview-Friendly Summary
   ==================================================================================================
   “useContext lets components access shared values without prop drilling. You wrap part of your app 
    in a Provider and read its value anywhere inside using useContext. It’s ideal for global settings 
    like themes or authentication. However, context causes all consumers to re-render when its value 
    changes, so it should not be used for high-frequency state updates.”
*/

