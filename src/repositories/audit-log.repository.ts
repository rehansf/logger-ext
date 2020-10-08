import {DefaultCrudRepository} from '@loopback/repository';
import {AuditLog, AuditLogRelations} from '../models';
import {JsonDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AuditLogRepository extends DefaultCrudRepository<
  AuditLog,
  typeof AuditLog.prototype.id,
  AuditLogRelations
> {
  constructor(
    @inject('datasources.json') dataSource: JsonDataSource,
  ) {
    super(AuditLog, dataSource);
  }
}
