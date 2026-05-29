import { Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../config/app-config';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  get config(): AppConfig {
    return APP_CONFIG;
  }

  get apiBaseUrl(): string {
    return APP_CONFIG.apiBaseUrl;
  }

  get isProduction(): boolean {
    return APP_CONFIG.appEnv === 'production';
  }
}
