import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private activeRequests = 0;
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();

  show(): void {
    this.activeRequests += 1;
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.loadingSubject.next(this.activeRequests > 0);
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
