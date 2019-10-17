module.exports = {
  types: [
    {
      value: 'build',
      name: 'build: Build a project or change external dependencies',
    },
    { value: 'ci', name: 'ci: Configure CI and working with scripts' },
    { value: 'docs', name: 'docs: Updating docs' },
    { value: 'feat', name: 'feat: Add new functionality' },
    { value: 'fix', name: 'fix: Fix bugs' },
    {
      value: 'perf',
      name: 'perf: Optimize perfomance',
    },
    {
      value: 'refactor',
      name: 'refactor: Edit the code without correcting bugs or adding new features',
    },
    { value: 'revert', name: 'revert: Rollback to previous commits' },
    {
      value: 'style',
      name: 'style: Update according to style guide (tabs, indents, points, commas, etc)',
    },
    { value: 'test', name: 'test: Add tests' },
  ],

  scopes: [
    { name: 'routes' },
    { name: 'middlewares' },
    { name: 'validators' },
    { name: 'utils' },
    { name: 'scripts' },
  ],
  messages: {
    type: 'What changes do you make?',
    scope: 'Select the SCOPE, which you changed (optional):',
    customScope: 'Set custom SCOPE (optional):',
    subject: 'Write a short description:',
    body: 'Write detailed description (optional). Use "|" for a new line:',
    footer: 'Meta data (tickets, links, etc). Example: SECRETMRKT-800:',
    confirmCommit: 'Are you satisfied with the resulting commit?',
  },
  allowCustomScopes: true,
  footerPrefix: 'META:',
  subjectLimit: 72,
};
