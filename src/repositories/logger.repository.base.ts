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
    let isReplace = false;

    modelClass.observe('before delete', async ctx => {
      const oldData = await ctx.Model.find({
        where: ctx.where
      });
      auditLog.before = JSON.stringify(oldData);
      auditLog.actionType = Action.DELETE_ONE;
      auditLog.modelName = ctx.Model.modelName;
      auditLog.condition = JSON.stringify(ctx.where);
    });

    modelClass.observe('after delete', async ctx => {
      auditLog.impactCount = ctx.info.count;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.auditLogRepository.create(auditLog);
    });

    modelClass.observe('before save', async ctx => {
      // Where is only undefined on Create and PUT request (replaceById)
      // Else this is an update request/ PATCH
      if (ctx.where === undefined) {
        auditLog.payload = JSON.stringify(ctx.instance);

        // If instance.id is not set then it is a create request
        if (ctx.instance.id === undefined) {
          // Create request
          console.log('Create Request')
          auditLog.actionType = Action.INSERT_ONE
        } else {
          // Replace request
          console.log('Replace Request');
          isReplace = true;
          const beforeData = await ctx.Model.findById(ctx.instance.id);
          auditLog.before = JSON.stringify(beforeData);
          auditLog.actionType = Action.UPDATE_ONE;
        }
      } else {
        // Update(One/Many) request
        console.log('Update Request');
        auditLog.actionType = Action.UPDATE_MANY;

        const beforeData = await ctx.Model.find({where: ctx.where});
        auditLog.before = JSON.stringify(beforeData);
        auditLog.condition = JSON.stringify(ctx.where);
      }

      auditLog.modelName = ctx.Model.modelName;
    });

    modelClass.observe('after save', async ctx => {
      let afterData;
      switch (auditLog.actionType) {
        case Action.INSERT_ONE:
          afterData = await ctx.Model.findById(ctx.instance.id);
          auditLog.after = JSON.stringify(afterData);
          auditLog.modelId = JSON.stringify(ctx.instance.id);
          break;

        case Action.UPDATE_ONE:
          if (isReplace) {
            afterData = await ctx.Model.findById(ctx.instance.id);
          } else {
            afterData = await ctx.Model.find({where: ctx.where});
          }
          auditLog.after = JSON.stringify(afterData);
          break;

        case Action.UPDATE_MANY:
          afterData = await ctx.Model.find({where: ctx.where});
          auditLog.after = JSON.stringify(afterData);
          break;
      }
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.auditLogRepository.create(auditLog);
    });
    return modelClass;
  }
}
