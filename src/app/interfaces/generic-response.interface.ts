export interface GenericRecordsPayload<T> {
  records: T[];
  count: number;
}

export interface GenericMultiRecordsPayload<T> {
  records: T[][];
  count: number;
}

export interface GenericMutationPayload {
  message?: string;
  affected?: number;
  insertId?: number;
  deleted?: number;
}
