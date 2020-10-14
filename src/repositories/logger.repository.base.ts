import {DefaultCrudRepository, Entity, Getter, juggler} from '@loopback/repository';
import {AuditLog} from '../models';
import {Action} from '../models/audit-log.model';
import {AuditLogRepository} from './audit-log.repository';

export interface IAuthUser {
  id: number | string;
}

export abstract class LoggerRepository<
  T extends Entity, ID, Relations extends object = {}
  > extends DefaultCrudRepository<T, ID, Relations> {

  private auditLogRepository;
  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: juggler.DataSource,
    protected readonly getCurrentUser?: Getter<
      IAuthUser | undefined
    >,
  ) {
    super(entityClass, dataSource);
    this.auditLogRepository = new AuditLogRepository(dataSource)
  }

  definePersistedModel(entityClass: typeof Entity) {
    const modelClass = super.definePersistedModel(entityClass);

    modelClass.observe('before delete', async ctx => {
      ctx.hookState.auditLog = new AuditLog();
      ctx.hookState.auditLog.actionTime = new Date().toISOString();
      const oldData = await ctx.Model.find({
        where: ctx.where
      });

      if (oldData) {
        if (oldData.length === 1) {
          ctx.hookState.auditLog.before = JSON.stringify(oldData[0]);
          ctx.hookState.auditLog.actionType = Action.DELETE_ONE;
        } else {
          ctx.hookState.auditLog.before = JSON.stringify(oldData);
          ctx.hookState.auditLog.actionType = Action.DELETE_MANY;
        }
      }
      ctx.hookState.auditLog.modelName = ctx.Model.modelName;
      ctx.hookState.auditLog.condition = JSON.stringify(ctx.where);
      if (this.getCurrentUser) {
        const currentUser = await this.getCurrentUser();
        if (currentUser) {
          ctx.hookState.auditLog.actor = `${currentUser.id}`
        }
      }
    });

    modelClass.observe('after delete', async ctx => {
      ctx.hookState.auditLog.impactCount = ctx.info.count;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.auditLogRepository.create(ctx.hookState.auditLog);
    });

    modelClass.observe('before save', async ctx => {
      ctx.hookState.auditLog = new AuditLog();
      ctx.hookState.auditLog.actionTime = new Date().toISOString();
      ctx.hookState.isReplace = false;


      // Where is only undefined on Create and PUT request (replaceById)
      // Else this is an update request/ PATCH
      if (ctx.where === undefined) {
        ctx.hookState.auditLog.payload = JSON.stringify(ctx.instance);

        // If instance.id is not set then it is a create request
        if (ctx.instance.id === undefined) {
          // Create request
          console.log('Create Request')
          ctx.hookState.auditLog.actionType = Action.INSERT_ONE
        } else {
          // Replace request
          console.log('Replace Request');
          ctx.hookState.isReplace = true;
          const beforeData = await ctx.Model.findById(ctx.instance.id);
          ctx.hookState.auditLog.before = JSON.stringify(beforeData);
          ctx.hookState.auditLog.actionType = Action.UPDATE_ONE;
        }
      } else {
        // Update(One/Many) request
        console.log('Update Request');
        ctx.hookState.auditLog.actionType = Action.UPDATE_MANY;

        const beforeData = await ctx.Model.find({where: ctx.where});
        if (beforeData) {
          if (beforeData.length === 1) {
            ctx.hookState.auditLog.before = JSON.stringify(beforeData[0]);
            ctx.hookState.auditLog.actionType = Action.UPDATE_ONE;
          } else {
            ctx.hookState.auditLog.before = JSON.stringify(beforeData);
            ctx.hookState.auditLog.actionType = Action.UPDATE_MANY;
          }
        }

        ctx.hookState.auditLog.condition = JSON.stringify(ctx.where);
        if (this.getCurrentUser) {
          const currentUser = await this.getCurrentUser();
          if (currentUser) {
            ctx.hookState.auditLog.actor = `${currentUser.id}`
          }
        }
      }

      ctx.hookState.auditLog.modelName = ctx.Model.modelName;
    });

    modelClass.observe('after save', async ctx => {
      let afterData;
      switch (ctx.hookState.auditLog.actionType) {
        case Action.INSERT_ONE:
          afterData = await ctx.Model.findById(ctx.instance.id);
          ctx.hookState.auditLog.after = JSON.stringify(afterData);
          ctx.hookState.auditLog.modelId = JSON.stringify(ctx.instance.id);
          break;

        case Action.UPDATE_ONE:
          if (ctx.hookState.isReplace) {
            afterData = await ctx.Model.findById(ctx.instance.id);
          } else {
            afterData = await ctx.Model.findOne({where: ctx.where});
          }
          ctx.hookState.auditLog.after = JSON.stringify(afterData);
          break;

        case Action.UPDATE_MANY:
          afterData = await ctx.Model.find({where: ctx.where});
          ctx.hookState.auditLog.after = JSON.stringify(afterData);
          break;
      }
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.auditLogRepository.create(ctx.hookState.auditLog);
    });
    return modelClass;
  }
}
