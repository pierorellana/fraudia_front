import { environment } from '../../../environments/environment';
import { AppEnvironment } from '../models/common.model';

export interface AppConfig {
  appName: string;
  apiBaseUrl: string;
  appEnv: AppEnvironment;
  enableMockData: boolean;
}

export const APP_CONFIG: AppConfig = {
  appName: 'Fraudia AI',
  apiBaseUrl: environment.apiBaseUrl,
  appEnv: environment.appEnv as AppEnvironment,
  enableMockData: environment.enableMockData,
};
