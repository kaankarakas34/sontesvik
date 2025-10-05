import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// Import reducers directly - using default imports to avoid circular dependency
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import incentivesReducer from './slices/incentivesSlice'
import applicationsReducer from './slices/applicationsSlice'
import ticketReducer from './slices/ticketSlice'

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  incentives: incentivesReducer,
  applications: applicationsReducer,
  tickets: ticketReducer,
})

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
}

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/FLUSH',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PERSIST',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// Persistor
export const persistor = persistStore(store)