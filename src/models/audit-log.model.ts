import {Entity, model, property} from '@loopback/repository';

export enum Action {
  INSERT_ONE = 'INSERT_ONE',
  UPDATE_ONE = 'UPDATE_ONE',
  UPDATE_MANY = 'UPDATE_MANY',
  DELETE_ONE = 'DELETE_ONE', // Working as expected
  DELETE_MANY = 'DELETE_MANY', // Is not created by default crud
}

@model()
export class AuditLog extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(Action)
    }
  })
  actionType: Action;

  @property({
    type: 'date',
    required: true,
  })
  actionTime: string;

  @property({
    type: 'string',
    required: true,
  })
  modelName: string;

  @property({
    type: 'string',
  })
  impactCount?: number;

  @property({
    type: 'string',
  })
  tag?: string;

  @property({
    type: 'string',
  })
  modelId: string;

  @property({
    type: 'string',
  })
  actor?: string;

  @property({
    type: 'string',
  })
  condition?: string;

  @property({
    type: 'string',
  })
  payload?: string;

  @property({
    type: 'string',
  })
  before?: string;

  @property({
    type: 'string',
  })
  after?: string;

  constructor(data?: Partial<AuditLog>) {
    super(data);
  }
}

export interface AuditLogRelations {}

export type AuditLogWithRelations = AuditLog & AuditLogRelations;
