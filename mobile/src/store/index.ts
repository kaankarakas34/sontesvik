import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Import slices
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'
import incentivesSlice from './slices/incentivesSlice'
import applicationsSlice from './slices/applicationsSlice'

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
}

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  incentives: incentivesSlice,
  applications: applicationsSlice,
})

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: __DEV__,
})

// Persistor
export const persistor = persistStore(store)

// Types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store