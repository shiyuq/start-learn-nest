import { AppConfig } from './configuraion/configuration.type';
import { MysqlConfig } from './mysql/mysql.type';

export type AllConfigType = {
  app: AppConfig;
  mysql: MysqlConfig;
};
