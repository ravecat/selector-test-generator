// File imitates a module with selectors

// Mock createSelector function from reselect
const createSelector = () => {};
const localState = () => {};
const prop = ({ prop }) => prop;

// eslint-disable-next-line
const unusedSelector = createSelector(
  localState,
  prop('loading'),
);

const getLoading = createSelector(
  localState,
  prop('loading'),
);

const getPatient = createSelector(
  localState,
  prop('loading'),
);

// Set of exported nodes based on createSelector
export const getCustomPatients = createSelector(
  localState,
  prop('loading'),
);

export const getPatients = getLoading;

export { getPatient };

export default createSelector(
  localState,
  prop('loading'),
);
