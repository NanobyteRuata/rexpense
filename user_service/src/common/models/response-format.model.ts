import { IPaginationMeta } from 'nestjs-typeorm-paginate';

export class ResponseFormat<T = object> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: object;
  pagination?: IPaginationMeta;

  constructor({
    status,
    message,
    data,
    error,
    pagination,
  }: Partial<ResponseFormat<T>>) {
    this.status = status ?? 'success';
    this.message =
      message ?? (error ? 'Server error' : 'Request completed successfully');
    this.data = data;
    this.error = error;
    this.pagination = pagination;
  }
}
