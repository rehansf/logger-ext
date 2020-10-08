import {
  Application,

  Component,
  config,
  ContextTags,
  CoreBindings,
  inject, injectable
} from '@loopback/core';
import {LoggerComponentBindings} from './keys';
import {DEFAULT_LOGGER_OPTIONS, LoggerComponentOptions} from './types';

// Configure the binding for LoggerComponent
@injectable({tags: {[ContextTags.KEY]: LoggerComponentBindings.COMPONENT}})
export class LoggerComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    private options: LoggerComponentOptions = DEFAULT_LOGGER_OPTIONS,
  ) {}
}
