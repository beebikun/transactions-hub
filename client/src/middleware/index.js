// ./app/middleware/index.js
import { generateStore, EventActions } from '@drizzle/store';
import drizzleOptions from '../drizzleOptions';


export const loggerMiddleware = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  // console.log('next state', store.getState())
  return result
}

// export { default as userMiddleware } from './userMiddleware';
