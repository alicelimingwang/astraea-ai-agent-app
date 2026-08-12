variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Project ID for Astraea AI deployment."
  default     = "astraea-ai-production"
}

variable "gcp_region" {
  type        = string
  description = "GCP Region for Cloud Run deployment."
  default     = "us-central1"
}

variable "service_name" {
  type        = string
  description = "Cloud Run service name."
  default     = "astraea-ai-backend"
}

variable "container_image" {
  type        = string
  description = "Docker container image URI in Artifact Registry or gcr.io."
  default     = "gcr.io/astraea-ai-production/astraea-ai-backend:v3.0.0"
}
