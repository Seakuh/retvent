variable "project_id" {
  description = "GCP Project ID"
}

variable "region" {
  description = "GCP Region"
  default     = "europe-west3" # Frankfurt
}

variable "jwt_secret" {
  description = "JWT Secret Key"
}

variable "mongodb_uri" {
  description = "MongoDB Connection URI"
}

variable "mongodb_user" {
  description = "MongoDB Atlas Username"
}

variable "mongodb_password" {
  description = "MongoDB Atlas Password"
  sensitive   = true
}

variable "mongodb_cluster" {
  description = "MongoDB Atlas Cluster Name"
}

variable "mongodb_database" {
  description = "MongoDB Database Name"
  default     = "eventscanner"
} 