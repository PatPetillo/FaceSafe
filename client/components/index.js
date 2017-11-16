/**
 * `components/index.js` exists simply as a 'central export' for our components.
 * This way, we can import all of our components from the same place, rather than
 * having to figure out which file they belong to!
 */
export { default as Main } from './Main';
export { default as WelcomeScreen } from './WelcomeScreen';
export { default as UserHome } from './UserHome';
export { default as EditForm } from './EditForm';

export { Login, Signup } from './auth-form';
