# Loopback Logger

[![LoopBack](https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Installation

Install LoggerComponent using `npm`;

```sh
$ npm install @rehansf/logger
```

## Basic Use

Configure and load LoggerComponent in the application constructor
as shown below.

```ts
import {LoggerComponent, LoggerComponentOptions, DEFAULT_LOGGER_OPTIONS} from '@rehansf/logger';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    const opts: LoggerComponentOptions = DEFAULT_LOGGER_OPTIONS;
    this.configure(LoggerComponentBindings.COMPONENT).to(opts);
      // Put the configuration options here
    });
    this.component(LoggerComponent);
    // ...
  }
  // ...
}
```

## How to use it with postgres
Import model in `index.ts` and export it.

```js
export * from '@rehansf/logger/dist/models';
```
