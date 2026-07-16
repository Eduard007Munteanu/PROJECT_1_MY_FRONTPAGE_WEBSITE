# Portfolio Website

Personal portfolio website for presenting academic and personal projects in one place.

## What it includes

- Home page with site overview and contact section
- Project browsing split into personal and academic work
- Project detail pages with descriptions, documentation, media, and external links
- Admin-oriented local editing workflow for managing project content
- Static showcase export for free hosting scenarios

## Tech stack

- Frontend: HTML, CSS, JavaScript, Node.js static server
- Backend: Spring Boot
- Database: PostgreSQL
- Optional local orchestration: Docker Compose

## Local environment

The backend expects its database password through an environment variable.

Copy `.env.example` to `.env` and set your local values before running Docker Compose, or provide the equivalent environment variables manually when running the backend outside Docker.

## Static showcase

The `static-showcase/` folder contains an exportable guest-view snapshot of the site for simple static hosting.

## Notes

- Uploaded media is stored locally and is intentionally not committed as part of the repository payload.
- Some project entries can include external references such as GitHub repositories, YouTube demos, or Itch.io pages.
