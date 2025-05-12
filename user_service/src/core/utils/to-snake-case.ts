import { snakeCase } from 'lodash';

export function toSnakeCase(obj: any): unknown {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj instanceof Date) {
    return obj.toISOString();
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        snakeCase(key),
        toSnakeCase(value),
      ]),
    );
  }
  return obj;
}
