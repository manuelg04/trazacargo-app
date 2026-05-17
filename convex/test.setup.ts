type TestImportMeta = ImportMeta & {
  glob(patterns: string | string[]): Record<string, () => Promise<unknown>>;
};

export const modules = (import.meta as TestImportMeta).glob([
  './**/*.ts',
  '!./**/*.test.ts',
  '!./test.setup.ts',
  '!./schema.ts',
  '!./auth.config.ts',
]);
