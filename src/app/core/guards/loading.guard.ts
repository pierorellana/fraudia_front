import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { LoadingService } from '../services/loading.service';

export const loadingGuard: CanDeactivateFn<unknown> = () =>
  !inject(LoadingService).isLoading();
