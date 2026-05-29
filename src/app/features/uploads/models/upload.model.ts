export interface FileImportApiResponse {
  insureds: number;
  policies: number;
  vehicles: number;
  providers: number;
  claims: number;
  assessments: number;
  message: string;
  datasets: Record<string, number>;
  filename: string;
}

export interface UploadError {
  row: number;
  field: string;
  message: string;
}

export interface UploadDatasetResponse {
  fileName: string;
  message: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  createdInsureds: number;
  createdPolicies: number;
  createdVehicles: number;
  createdProviders: number;
  createdClaims: number;
  createdAssessments: number;
  datasets: Record<string, number>;
  errors: UploadError[];
}

export interface BatchAssessmentResult {
  processed: number;
  message: string;
}

export function mapUploadResponseFromApi(dto: FileImportApiResponse): UploadDatasetResponse {
  const totalRows = Object.values(dto.datasets ?? {}).reduce((sum, value) => sum + value, 0);

  return {
    fileName: dto.filename,
    message: dto.message,
    totalRows,
    validRows: totalRows,
    invalidRows: 0,
    createdInsureds: dto.insureds,
    createdPolicies: dto.policies,
    createdVehicles: dto.vehicles,
    createdProviders: dto.providers,
    createdClaims: dto.claims,
    createdAssessments: dto.assessments,
    datasets: dto.datasets,
    errors: [],
  };
}
