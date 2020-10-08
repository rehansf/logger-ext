import {BindingKey, CoreBindings} from '@loopback/core';
import {LoggerComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace LoggerComponentBindings {
  export const COMPONENT = BindingKey.create<LoggerComponent>(
    `${CoreBindings.COMPONENTS}.LoggerComponent`,
  );
}
