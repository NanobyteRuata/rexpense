import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { toSnakeCase } from '../utils/to-snake-case';
import { ResponseFormat } from 'src/common/models/response-format.model';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((response: object) => {
        if (response instanceof ResponseFormat) {
          return toSnakeCase(response);
        }

        return new ResponseFormat({
          message: 'Request completed successfully',
          data: toSnakeCase(response) ?? undefined,
        });
      }),
    );
  }
}
