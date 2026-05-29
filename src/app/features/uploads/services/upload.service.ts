import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { HttpClientService } from '../../../core/services/http-client.service';
import {
  FileImportApiResponse,
  UploadDatasetResponse,
  mapUploadResponseFromApi,
} from '../models/upload.model';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private http: HttpClientService) {}

  uploadDataset(file: File, dataset?: string): Observable<UploadDatasetResponse> {
    return this.http
      .uploadFile<FileImportApiResponse>(API_ENDPOINTS.uploads.dataset, file, {
        dataset: dataset === 'auto' ? undefined : dataset,
      })
      .pipe(map(mapUploadResponseFromApi));
  }
}
