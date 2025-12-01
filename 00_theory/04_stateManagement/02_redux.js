/* ==========================================================================================================
   Redux Toolkit (RTK) — Modern Redux for React (Deep, Interview-Ready Explanation)
   ==========================================================================================================

   Redux Toolkit (RTK) is the **official, recommended** way to write Redux code today.
   It solves almost every pain point of old Redux:

     ❌ too much boilerplate  
     ❌ manual immutable updates  
     ❌ action types & switch reducers  
     ❌ many files for simple logic  
     ❌ complicated store setup

   RTK provides:
     ✔ simple APIs  
     ✔ predictable patterns  
     ✔ built-in Immer for immutability  
     ✔ built-in Thunks for async logic  
     ✔ built-in DevTools & middleware  
     ✔ slices that combine actions + reducers

   This is a complete, deep explanation with examples.
*/


/* ==========================================================================================================
   1) Why Redux Toolkit exists (The Problem with Classic Redux)
   ==========================================================================================================

   Before RTK, Redux required:

     - create actions
     - create action types
     - create reducers with switch statements
     - write immutable updates manually
     - configure middleware manually
     - write async thunks by hand
     - keep logic separated across many files

   Example (classic Redux) — extremely verbose:
*/

// actions.js
export const INCREMENT = "INCREMENT";
export function increment() { return { type: INCREMENT }; }

// reducer.js
export function counterReducer(state = {value:0}, action) {
  switch(action.type) {
    case INCREMENT:
      return {...state, value: state.value + 1};
    default:
      return state;
  }
}

// store.js
const store1 = createStore(counterReducer);

/*
   Redux Toolkit fixes all this.
*/


/* ==========================================================================================================
   2) RTK Core Concepts:
   ==========================================================================================================

   A) createSlice  
   B) configureStore  
   C) createAsyncThunk  
   D) Immer immutability  
   E) RTK Query (data fetching)  

   Let’s go one by one.
*/


/* ==========================================================================================================
   3) createSlice — reducer + actions together (most important)
   ==========================================================================================================

   A slice = state + reducers + actions, all in one file.
*/

import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      // ✔ Mutating state is allowed
      // RTK uses Immer to convert this into an immutable update
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
    increaseBy(state, action) {
      state.value += action.payload;
    }
  }
});

// Slice automatically generates actions
export const { increment, decrement, increaseBy } = counterSlice.actions;

// And reducer
// export default counterSlice.reducer;

/*
   ✔ No switch statements
   ✔ No action type strings
   ✔ No manual immutability
*/


/* ==========================================================================================================
   4) configureStore — simplified store setup
   ========================================================================================================== */

import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer
  }
});

/*
   configureStore automatically sets up:
     ✔ Redux DevTools
     ✔ Redux Thunk middleware
     ✔ Useful warnings about mistakes
*/


/* ==========================================================================================================
   5) Using Redux Toolkit in React with the Hooks API
   ==========================================================================================================

   RTK works perfectly with react-redux hooks:
     - useSelector()
     - useDispatch()

   Example:
*/

import { useSelector, useDispatch } from "react-redux";

function Counter() {
  const value = useSelector(state => state.counter.value);
  const dispatch = useDispatch();

  return (
    <>
      <div>Value: {value}</div>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(decrement())}>-1</button>
      <button onClick={() => dispatch(increaseBy(5))}>+5</button>
    </>
  );
}

/*
   ✔ Minimal code
   ✔ Easy state selection
*/


/* ==========================================================================================================
   6) Async Logic with createAsyncThunk (Fetch API Example)
   ========================================================================================================== */

import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    return res.json();
  }
);

/*
   createAsyncThunk generates:
     - pending action
     - fulfilled action
     - rejected action
*/


/* ==========================================================================================================
   7) Handling Async Actions in Slices (extraReducers)
   ========================================================================================================== */

const usersSlice = createSlice({
  name: "users",
  initialState: { list: [], status: "idle" },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending, state => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "success";
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, state => {
        state.status = "error";
      });
  }
});

export default usersSlice.reducer;

/*
   ✔ Reduced boilerplate
   ✔ Auto async statuses
   ✔ Cleaner async handling
*/


/* ==========================================================================================================
   8) Immer — automatic immutability
   ==========================================================================================================

   RTK uses Immer under the hood.

   This means you CAN write:
     state.value += 1

   And RTK converts it to:
     state = { ...state, value: state.value + 1 }

   Immer protects immutability automatically.

   Benefits:
     ✔ Less code  
     ✔ Fewer bugs  
     ✔ Faster development  
     ✔ Immutable state ensured  
*/


/* ==========================================================================================================
   9) RTK Query — built-in data fetching and caching (advanced)
   ==========================================================================================================

   RTK Query is a **powerful data-fetching library** built into Redux Toolkit.

   Features:
     ✔ automatic caching
     ✔ automatic refetching
     ✔ request deduplication
     ✔ loading/error states handled automatically
     ✔ extremely small API surface

   Example:
*/

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: builder => ({
    getUsers: builder.query({
      query: () => "/users"
    })
  })
});

export const { useGetUsersQuery } = usersApi;

/*
   Use it in a component:
*/
function Users() {
  const { data, isLoading } = useGetUsersQuery();

  if (isLoading) return <p>Loading...</p>;
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

/*
   ✔ No reducers needed
   ✔ No actions needed
   ✔ No thunks
   ✔ No boilerplate
*/


/* ==========================================================================================================
   10) Advantages of Redux Toolkit (why it's the recommended standard)
   ==========================================================================================================

   ✔ Less boilerplate  
   ✔ Built-in Immer immutable updates  
   ✔ Built-in async thunks  
   ✔ Slices organize your code cleanly  
   ✔ configureStore includes DevTools + middleware  
   ✔ TypeScript-friendly  
   ✔ RTK Query is extremely efficient  
   ✔ Simplified patterns for large apps  
   ✔ Easier onboarding for new developers  

   Classic Redux required ~4 files for simple logic → RTK reduces it to ~1 file.
*/


/* ==========================================================================================================
   11) Common Pitfalls to Avoid
   ==========================================================================================================

   ❌ Creating new object/function inside Provider value without useMemo  
   ✔ RTK is forgiving because reducer logic uses Immer → but components may re-render unnecessarily.

   ❌ Mutating state incorrectly outside reducers  
   ✔ Always mutate only inside RTK reducers (immer applied automatically).

   ❌ Using "vanilla Redux" pattern inside RTK slices  
   ✔ Do not return new state when mutating — choose one pattern, not both.

   WRONG:
     return {...state, value: state.value + 1}; AND also mutate state

   ❌ Too many slices  
   ✔ Split slices by “domain logic”, not by components.
*/


/* ==========================================================================================================
   12) Interview-Ready Summary
   ==========================================================================================================

   “Redux Toolkit is the official modern way to write Redux. It reduces boilerplate by using createSlice,
    provides configureStore with defaults, uses Immer for immutable updates, and includes powerful async
    tools like createAsyncThunk and RTK Query. It is cleaner, safer, easier, and faster than classic Redux,
    and is now the recommended standard for all Redux apps.”

*/


// ==========================================================================================================
// End — Redux Toolkit (Modern Redux) Deep Explanation
// ==========================================================================================================
