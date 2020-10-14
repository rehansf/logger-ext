import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param
} from '@loopback/rest';
import {AuditLog} from '../models';
import {AuditLogRepository} from '../repositories';

export class AuditLogController {
  constructor(
    @repository(AuditLogRepository)
    public auditLogRepository: AuditLogRepository,
  ) {}

  @get('/audit-logs/count', {
    responses: {
      '200': {
        description: 'AuditLog model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(AuditLog) where?: Where<AuditLog>,
  ): Promise<Count> {
    return this.auditLogRepository.count(where);
  }

  @get('/audit-logs', {
    responses: {
      '200': {
        description: 'Array of AuditLog model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(AuditLog, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(AuditLog) filter?: Filter<AuditLog>,
  ): Promise<AuditLog[]> {
    const logs = await this.auditLogRepository.find(filter);
    return logs.map(log => {
      if (log.before) {
        log.before = JSON.parse(log.before);
      }
      if (log.after) {
        log.after = JSON.parse(log.after);
      }
      if (log.payload) {
        log.payload = JSON.parse(log.payload);
      }
      if (log.condition) {
        log.condition = JSON.parse(log.condition);
      }
      return log;
    })
    // return this.auditLogRepository.find(filter);
  }

  @get('/audit-logs/{id}', {
    responses: {
      '200': {
        description: 'AuditLog model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(AuditLog, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(AuditLog, {exclude: 'where'}) filter?: FilterExcludingWhere<AuditLog>
  ): Promise<AuditLog> {
    return this.auditLogRepository.findById(id, filter);
  }

  @del('/audit-logs/{id}', {
    responses: {
      '204': {
        description: 'AuditLog DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.auditLogRepository.deleteById(id);
  }
}
