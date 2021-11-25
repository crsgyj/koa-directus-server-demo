import log4js, { Logger } from 'log4js';
import path from 'path';

/** 日志类型 */
export enum LOGGER_TYPES {
  default = 'default',
  schedule = 'schedule',
}
export type AppLoggers = Record<LOGGER_TYPES, Logger>;

export const logLevels = log4js.levels;

interface LoggerConfig {
  logDir: string;
  level: string;
}
export function getLogger({
  logDir,
  level = 'debug'
}: LoggerConfig): AppLoggers {
  log4js.configure({
    appenders: {
      accessDateFile: {
        type: 'dateFile',
        filename: path.join(logDir, 'access.log'),
        pattern: '.yyyy-MM-dd',
        alwaysIncludePattern: true,
        keepFileExt: true,
        daysToKeep: 20,
      },
      scheduleDateFile: {
        type: 'dateFile',
        filename: path.join(logDir, 'schedule.log'),
        pattern: '.yyyy-MM-dd',
        alwaysIncludePattern: true,
        keepFileExt: true,
        daysToKeep: 20,
      },
      console: {
        type: 'console'
      }
    },
    categories: {
      [LOGGER_TYPES.default]: {
        appenders: ['console', 'accessDateFile'],
        level: level
      },
      [LOGGER_TYPES.schedule]: {
        appenders: ['console', 'accessDateFile'],
        level: log4js.levels.ALL.levelStr,
      },
    },
    pm2: false
  });

  return Object.values(LOGGER_TYPES) 
    .reduce((state, name) => {
      const l = log4js.getLogger(name);
      if (l) {
        state[name] = l;
      }
      return state;
    }, {} as AppLoggers);
}