terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

# GCP Projekt Konfiguration
provider "google" {
  project = var.project_id
  region  = var.region
}

# Container Registry aktivieren
resource "google_container_registry" "registry" {
  project = var.project_id
}

# Cloud Run Service
resource "google_cloud_run_service" "event_scanner" {
  name     = "event-scanner-api"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/event-scanner:latest"
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }

        env {
          name  = "MONGODB_URI"
          value = "mongodb+srv://event-backend:yn1fVjhhkOXmx7Pp@cluster0.yvxnxgp.mongodb.net/eventscanner"
        }
        env {
          name  = "JWT_SECRET"
          value = var.jwt_secret
        }
        env {
          name  = "NODE_ENV"
          value = "production"
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# IAM Policy für öffentlichen Zugriff
resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.event_scanner.name
  location = google_cloud_run_service.event_scanner.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Cloud Run Autoscaling Policy
resource "google_cloud_run_service" "event_scanner_autoscaling" {
  metadata {
    annotations = {
      "autoscaling.knative.dev/minScale" = "1"
      "autoscaling.knative.dev/maxScale" = "10"
    }
  }
} 