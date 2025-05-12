import { toCamelCase } from './to-camel-case';

describe('toCamelCase', () => {
  it('should convert object keys from snake_case to camelCase', () => {
    const input = {
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john@example.com',
    };

    const expected = {
      firstName: 'John',
      lastName: 'Doe',
      emailAddress: 'john@example.com',
    };

    expect(toCamelCase(input)).toEqual(expected);
  });

  it('should handle nested objects', () => {
    const input = {
      user_info: {
        full_name: 'John Doe',
        address: {
          street_address: '123 Main St',
        },
      },
    };

    const expected = {
      userInfo: {
        fullName: 'John Doe',
        address: {
          streetAddress: '123 Main St',
        },
      },
    };

    expect(toCamelCase(input)).toEqual(expected);
  });

  it('should handle arrays', () => {
    const input = {
      user_list: [
        { first_name: 'John', last_name: 'Doe' },
        { first_name: 'Jane', last_name: 'Smith' },
      ],
    };

    const expected = {
      userList: [
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Smith' },
      ],
    };

    expect(toCamelCase(input)).toEqual(expected);
  });

  it('should handle null and undefined values', () => {
    expect(toCamelCase(null)).toBeNull();
    expect(toCamelCase(undefined)).toBeUndefined();
  });

  it('should return primitives as is', () => {
    expect(toCamelCase('test')).toBe('test');
    expect(toCamelCase(123)).toBe(123);
    expect(toCamelCase(true)).toBe(true);
  });

  it('should handle empty objects', () => {
    expect(toCamelCase({})).toEqual({});
  });

  it('should handle empty arrays', () => {
    expect(toCamelCase([])).toEqual([]);
  });

  it('should handle objects with already camelCase keys', () => {
    const input = {
      firstName: 'John',
      lastName: 'Doe',
    };

    expect(toCamelCase(input)).toEqual(input);
  });

  it('should not handle mixed case formats', () => {
    const input = {
      first_name: 'John',
      lastName: 'Doe',
      EMAIL_ADDRESS: 'john@example.com',
      PhoneNumber: '123-456-7890',
    };

    const expected = {
      firstName: 'John',
      lastName: 'Doe',
      EMAIL_ADDRESS: 'john@example.com',
      PhoneNumber: '123-456-7890',
    };

    expect(toCamelCase(input)).toEqual(expected);
  });
});
