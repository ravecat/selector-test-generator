// File imitates a module with selectors

// Mock createSelector function from reselect
const createSelector = () => {};
const localState = () => {};
const prop = ({ prop }) => prop;

// eslint-disable-next-line
export const unusedSelector = createSelector(
  localState,
  prop('loading'),
);
