import { toSnakeCase } from './to-snake-case';

describe('toSnakeCase', () => {
  it('should convert object keys to snake_case', () => {
    const input = {
      firstName: 'John',
      lastName: 'Doe',
      emailAddress: 'john@example.com',
    };

    const expected = {
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john@example.com',
    };

    expect(toSnakeCase(input)).toEqual(expected);
  });

  it('should handle nested objects', () => {
    const input = {
      userInfo: {
        fullName: 'John Doe',
        address: {
          streetAddress: '123 Main St',
        },
      },
    };

    const expected = {
      user_info: {
        full_name: 'John Doe',
        address: {
          street_address: '123 Main St',
        },
      },
    };

    expect(toSnakeCase(input)).toEqual(expected);
  });

  it('should handle arrays', () => {
    const input = [{ firstName: 'John' }, { firstName: 'Jane' }];

    const expected = [{ first_name: 'John' }, { first_name: 'Jane' }];

    expect(toSnakeCase(input)).toEqual(expected);
  });

  it('should correctly handle Date objects', () => {
    const date = new Date('2025-03-19T10:46:11.000Z');
    const result = toSnakeCase(date);

    expect(result).toBe('2025-03-19T10:46:11.000Z');
  });
});
