export const warn = (message: string) => (condition: boolean) => {
  if (condition) console.warn(message);
};

export const isString = (x: unknown): x is string => {
  return typeof x === "string";
};
