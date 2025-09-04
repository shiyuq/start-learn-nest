import { AppConfig } from './configuration.type';
import { MysqlConfig } from './mysql.type';

export type AllConfigType = {
  app: AppConfig;
  mysql: MysqlConfig;
};
