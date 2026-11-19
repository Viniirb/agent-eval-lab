/** Marks the spots you must implement. Each module has a code like "M03". The validator rejects leftover calls. */
export function todo(module: string, message: string): never {
  throw new Error(`TODO(${module}): ${message}`);
}
