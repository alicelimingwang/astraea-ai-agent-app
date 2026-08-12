# Terraform IaC Configuration for Astraea AI Cloud Infrastructure
# Provisions Google Cloud Run, Secret Manager, IAM Service Account, and Cloud Trace

terraform {
  required_version = ">= 1.3.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# 1. Service Account for Astraea AI Backend
resource "google_service_account" "astraea_sa" {
  account_id   = "astraea-ai-backend-sa"
  display_name = "Astraea AI Backend Runtime Service Account"
}

# 2. Secret Manager Secret for GEMINI_API_KEY
resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "GEMINI_API_KEY"
  replication {
    auto {}
  }
}

# Grant Service Account access to Gemini API Secret
resource "google_secret_manager_secret_iam_member" "secret_accessor" {
  secret_id = google_secret_manager_secret.gemini_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.astraea_sa.email}"
}

# 3. Google Cloud Run v2 Service
resource "google_cloud_run_v2_service" "astraea_backend" {
  name     = var.service_name
  location = var.gcp_region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.astraea_sa.email

    containers {
      image = var.container_image

      resources {
        limits = {
          cpu    = "2000m"
          memory = "2Gi"
        }
      }

      env {
        name  = "ENVIRONMENT"
        value = "production"
      }

      env {
        name  = "LOG_LEVEL"
        value = "INFO"
      }

      env {
        name  = "OTEL_SERVICE_NAME"
        value = "astraea-ai-backend"
      }

      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.gemini_api_key.secret_id
            version = "latest"
          }
        }
      }

      ports {
        container_port = 8000
      }
    }

    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }
  }
}

# Allow public unauthenticated access to Cloud Run service
resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  location = google_cloud_run_v2_service.astraea_backend.location
  name     = google_cloud_run_v2_service.astraea_backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
