import {inject} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {AuditLog, AuditLogRelations} from '../models';

export class AuditLogRepository extends DefaultCrudRepository<
  AuditLog,
  typeof AuditLog.prototype.id,
  AuditLogRelations
  > {
  constructor(
    @inject('datasources.json') dataSource: juggler.DataSource,
  ) {
    super(AuditLog, dataSource);
  }
}
