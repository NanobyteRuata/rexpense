export enum KafkaTopics {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_FETCH_REQUEST = 'user.fetch.request',
  USER_FETCH_RESPONSE = 'user.fetch.response',

  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_UPDATED = 'transaction.updated',
  TRANSACTION_DELETED = 'transaction.deleted',
  TRANSACTION_FETCH_REQUEST = 'transaction.fetch.request',
  TRANSACTION_FETCH_RESPONSE = 'transaction.fetch.response',

  BUDGET_CREATED = 'budget.created',
  BUDGET_UPDATED = 'budget.updated',
  BUDGET_DELETED = 'budget.deleted',
  BUDGET_FETCH_REQUEST = 'budget.fetch.request',
  BUDGET_FETCH_RESPONSE = 'budget.fetch.response',
}
