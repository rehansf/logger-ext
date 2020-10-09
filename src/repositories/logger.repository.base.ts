import {DefaultCrudRepository, Entity, juggler} from '@loopback/repository';
import {AuditLog} from '../models';
import {Action} from '../models/audit-log.model';
import {AuditLogRepository} from './audit-log.repository';

export abstract class LoggerRepository<
  T extends Entity, ID, Relations extends object = {}
  > extends DefaultCrudRepository<T, ID, Relations> {

  private auditLogRepository;
  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: juggler.DataSource,
  ) {
    super(entityClass, dataSource);
    this.auditLogRepository = new AuditLogRepository(dataSource)
  }

  definePersistedModel(entityClass: typeof Entity) {
    const modelClass = super.definePersistedModel(entityClass);
    const auditLog = new AuditLog();
    auditLog.actionTime = new Date().toISOString();

    modelClass.observe('before delete', async ctx => {
      console.log('Before delete is triggerd');
      auditLog.actionType = Action.DELETE_ONE;
      auditLog.modelName = ctx.Model.modelName;
      auditLog.condition = JSON.stringify(ctx.where);
    });

    modelClass.observe('after delete', async ctx => {
      console.log('After delete is triggerd');
      auditLog.impactCount = ctx.info.count;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.auditLogRepository.create(auditLog);
    });

    modelClass.observe('before save', async ctx => {
      if (ctx.isNewInstance) {
        auditLog.actionType = Action.INSERT_ONE
        auditLog.payload = JSON.stringify(ctx.instance);
      } else {
        if (ctx.where === undefined /* PUT Request */) {
          console.log('This is a put request');
          auditLog.actionType = Action.UPDATE_ONE;
        } else {
          console.log('This is a probably a patch request')
          auditLog.actionType = Action.UPDATE_ONE;
          auditLog.condition = JSON.stringify(ctx.where);
        }
      }
      auditLog.modelName = ctx.Model.modelName;

      console.log(`going to save ${ctx.Model.modelName}`);
    });

    modelClass.observe('after save', async ctx => {
      console.log(ctx);
      switch (auditLog.actionType) {
        case Action.INSERT_ONE:
          auditLog.after = JSON.stringify(ctx.instance);
          auditLog.modelId = JSON.stringify(ctx.instance.id);
          break;
        case Action.UPDATE_ONE:
          console.log('update one is triggerd');
          break;
        case Action.UPDATE_MANY:
          console.log('update many is triggerd');
          break;
        case Action.DELETE_ONE:
          console.log('delete one is triggerd');
          break;
      }
      console.log(`have been saved ${ctx.Model.modelName}`);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.auditLogRepository.create(auditLog);
    });
    return modelClass;
  }
}
