import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SnakeToCamelMiddleware implements NestMiddleware {
  use(req: Request, _: Response, next: NextFunction) {
    // Transform body
    if (req.body) {
      req.body = this.transformObjectKeys(req.body);
    }

    // Handle query params
    if (req.query) {
      // Create a new object with transformed keys
      const newQuery = {};

      // For each URL query parameter, transform to camelCase
      Object.keys(req.query).forEach((key) => {
        const camelKey = this.snakeToCamel(key);
        newQuery[camelKey] = req.query[key];
      });

      // Use defineProperty to FORCE replace the getter of query
      Object.defineProperty(req, 'query', {
        value: newQuery,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    // Handle route params
    if (req.params) {
      const newParams = {};
      Object.keys(req.params).forEach((key) => {
        const camelKey = this.snakeToCamel(key);
        newParams[camelKey] = req.params[key];
      });

      // Use defineProperty to replace the getter
      Object.defineProperty(req, 'params', {
        value: newParams,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    next();
  }

  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter: string) =>
      letter.toUpperCase(),
    );
  }

  private transformObjectKeys(obj: object): object {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item: object) => this.transformObjectKeys(item));
    }

    const newObj = {};
    Object.keys(obj).forEach((key) => {
      const camelKey = this.snakeToCamel(key);
      newObj[camelKey] = this.transformObjectKeys(obj[key]);
    });

    return newObj;
  }
}
