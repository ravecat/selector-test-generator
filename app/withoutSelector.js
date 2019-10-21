// File imitates a module without selectors

export const prop = prop => state => state[prop] || 'defaultValue';
