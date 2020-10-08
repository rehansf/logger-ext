import {Entity, model, property} from '@loopback/repository';

export enum Action {
  'INSERT_ONE',
  'INSERT_MANY',
  'UPDATE_ONE',
  'UPDATE_MANY',
  'DELETE_ONE',
  'DELETE_MANY',
}

@model()
export class AuditLog extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  id?: number;

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
  tag?: string;

  @property({
    type: 'string',
    required: true,
  })
  entityId: string;

  @property({
    type: 'string',
  })
  actor?: string;

  @property({
    type: 'string',
    required: true,
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
