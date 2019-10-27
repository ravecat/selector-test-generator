// File imitates a module with selectors
import { createSelector } from 'reselect';

// eslint-disable-next-line
const unusedSelector = createSelector(
  ({ sub }) => sub,
  ({ loading }) => loading,
);

const implicityUsedSelector = createSelector(
  ({ sub }) => sub,
  ({ loading }) => loading,
);

const explicitlyUsedSelector = createSelector(
  ({ sub }) => sub,
  ({ property }) => property,
);

export const explicitlyUsedSelector2 = createSelector(
  ({ sub }) => sub,
  ({ undefinedProperty }) => undefinedProperty,
);

export const implicityUsedSelectorProxy = implicityUsedSelector;

export { explicitlyUsedSelector };

export default createSelector(
  ({ sub }) => sub,
  ({ loading }) => loading,
);
