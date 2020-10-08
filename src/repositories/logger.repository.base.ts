import {DefaultCrudRepository, Entity, juggler} from '@loopback/repository';
import {AuditLog} from '../models';
import {Action} from '../models/audit-log.model';
import {AuditLogRepository} from './audit-log.repository';

export abstract class LoggerRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
  > extends DefaultCrudRepository<T, ID, Relations> {
  private auditLogRepository;
  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: juggler.DataSource
  ) {
    super(entityClass, dataSource);
    this.auditLogRepository = new AuditLogRepository(dataSource)
  }

  definePersistedModel(entityClass: typeof Entity) {
    const modelClass = super.definePersistedModel(entityClass);
    debugger
    const auditLog = new AuditLog();
    auditLog.actionTime = new Date().toISOString();

    modelClass.observe('before save', async ctx => {
      // TODO: Write logic to decide action
      if (ctx.isNewInstance) {
        auditLog.actionType = Action.INSERT_ONE
      }
      auditLog.modelName = ctx.Model.modelName
      debugger
      console.log(`going to save ${ctx.Model.modelName}`);
    });

    modelClass.observe('after save', async ctx => {
      debugger
      switch (auditLog.actionType) {
        case Action.INSERT_ONE:
          console.log('Insert one is trigged');
          break;
        case Action.INSERT_MANY:
          console.log('Insert many is trigged ');
          break;
        case Action.UPDATE_ONE:
          console.log('update one is trigged');
          break;
        case Action.UPDATE_MANY:
          console.log('update many is trigged');
          break;
        case Action.DELETE_ONE:
          console.log('delete one is trigged');
          break;
        case Action.DELETE_MANY:
          console.log('delete mnay is trigged');
          break;
      }
      debugger
      console.log(`have been saved ${ctx.Model.modelName}`);
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.auditLogRepository.create(auditLog);

    return modelClass;
  }

  //   modelClass.observe('before save', async ctx => {
  //     // auditLog.modelName = `${ctx.Model.modelName}`
  //     // auditLog.isNewInstance = !!ctx.isNewInstance;
  //     // auditLog.before = "{}";
  //     // if (auditLog.isNewInstance) {
  //     auditLog.payload = JSON.stringify(ctx.instance);
  //     // } else {
  //     //   auditLog.payload = JSON.stringify(ctx.data);
  //     //   auditLog.where = JSON.stringify(ctx.where);
  //     // }
  //   });

  //   modelClass.observe('after save', async ctx => {
  //     console.log('CTX after save', ctx);
  //     console.log('CTX after save as JSON', JSON.stringify(ctx));
  //     // auditLog.modelId = `${ctx.data?.id}`;
  //     // auditLog.after = JSON.stringify(ctx.instance);
  //     // this.auditLogRepository.create(auditLog);
  //   });
  //   return modelClass;
  // }
}
