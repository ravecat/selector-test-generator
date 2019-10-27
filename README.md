Test generator for selectors based on [reselect](https://www.npmjs.com/package/reselect) library.

## Motivation

Writing unit-test for selectors based on [reselect](https://www.npmjs.com/package/reselect) library depends on lot of boilerplate code. The sample selector test code looks like this

```js
import state from <path_to_mocked_state>;
import { selector, anotherSelector } from <path_to_selector_folder>;

describe('Application/Selectors', () => {
  it('<selector>', () => {
    const received = selector(state);
    const expected = true;

    expect(received).toEqual(expected);
  });

  it('<anotherSelector>', () => {
    const received = anotherSelector(state);
    const expected = false;

    expect(received).toEqual(expected);
  });
});
```

The current pattern is repeated for most selectors, it takes a lot of time and demotivates writing simple unit tests, which can be quite a lot on a project.

`selector-test-generator` is trying to solve this problem by generating a file with jest tests for available selectors.

## Using

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm install --save-dev selector-test-generator
```

or [`yarn add` command](https://yarnpkg.com/lang/en/docs/cli/add/#toc-adding-dependencies):

```bash
yarn add --dev selector-test-generator
```

`selector-test-generator` ready to use as [npm-script](https://docs.npmjs.com/misc/scripts)

```bash
selector-test-generator [selector-path-arg] [...options]
```

Also `selector-test-generator` run through npx without installing

```bash
npx selector-test-generator [selector-path-arg] [...options]
```

### Options

- `selector-path-arg` - define selector path in which the utility will search for selectors and generate tests. Optional argument, default value - current execution folder.
- `-s, --state <path>` - set the mocked state location. Necessary argument

## Features

`selector-test-generator` recursively walk though all directories starting from the execution folder or directory that is set as `selector-path-arg`. Then search for files with exported selectors. For exported selectors it creates `__test__` folder with tests in current file directory. B

For example, we have a folder with selectors in the root project directory

```bash
<project>/
├── dir
│   └── withSelectorNested.js
├── state.js
├── withoutSelector.js
├── withSelector.js
└── withSelectorSecond.js

```

and after running the script

```js
npx selector-test-generator <project>/ -s <project>/state.js
```

we get the following result

```bash
<project>/
├── dir
│   ├── __test__
│   │   └── withSelectorNested.js
│   └── withSelectorNested.js
├── state.js
├── __test__
│   ├── withSelector.js
│   └── withSelectorSecond.js
├── withoutSelector.js
├── withSelector.js
└── withSelectorSecond.js
```

of course, your test framework should be configured to search for tests in `__test__` folder.

Tests are generated for explicitly and implicitly exported selectors.

For file `withSelectors.js`

```js
import { createSelector } from 'reselect';

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
```

Selectors for which tests will be generated are `createSelector, explicitlyUsedSelector, implicityUsedSelector, explicitlyUsedSelector2`

Generated test `selectors/__test__/withSelectors.js`

```js
import {
  explicitlyUsedSelector2,
  implicityUsedSelectorProxy,
  explicitlyUsedSelector,
} from '../withSelector.js';
import createSelector from '../withSelector.js';
import state from '../state.js';

describe('Application/Selectors/withSelector.js', () => {
  it('explicitlyUsedSelector2', () => {
    const received = explicitlyUsedSelector2(state);
    const expected = undefined;

    expect(received).toEqual(expected);
  });

  it('implicityUsedSelectorProxy', () => {
    const received = implicityUsedSelectorProxy(state);
    const expected = true;

    expect(received).toEqual(expected);
  });

  it('explicitlyUsedSelector', () => {
    const received = explicitlyUsedSelector(state);
    const expected = 'property';

    expect(received).toEqual(expected);
  });

  it('createSelector', () => {
    const received = createSelector(state);
    const expected = true;

    expect(received).toEqual(expected);
  });
});
```

## License

[MIT](LICENSE)
