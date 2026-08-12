output "cloud_run_url" {
  value       = google_cloud_run_v2_service.astraea_backend.uri
  description = "Public URL of deployed Astraea AI Cloud Run backend service."
}

output "service_account_email" {
  value       = google_service_account.astraea_sa.email
  description = "Astraea AI Backend Service Account Email."
}

output "secret_id" {
  value       = google_secret_manager_secret.gemini_api_key.secret_id
  description = "Secret Manager Secret ID for Gemini API Key."
}
