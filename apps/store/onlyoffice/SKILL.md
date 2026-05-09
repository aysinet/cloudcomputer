# OnlyOffice — AI Skill

## Capability
Online office suite: create and edit Word, Excel, PowerPoint, PDF documents. Full collaborative editing support.

## Description
OnlyOffice Document Server running as a Docker container (`onlyoffice/documentserver`). Provides web-based editors for DOCX, XLSX, PPTX, PDF, and many other formats. Supports real-time collaborative editing, comments, track changes, and document conversion.

## Supported Formats
- **Documents**: DOCX, DOC, ODT, RTF, TXT, HTML, EPUB
- **Spreadsheets**: XLSX, XLS, ODS, CSV
- **Presentations**: PPTX, PPT, ODP
- **PDF**: PDF viewing and editing

## Docker Configuration
- **Image**: `onlyoffice/documentserver:latest`
- **Container Port**: 80
- **JWT**: Enabled by default for API security
- **Volumes**: Logs, data, lib, and PostgreSQL database persisted

## Auth
JWT token required (configured during installation via `JWT_SECRET`).

## Notes
- OnlyOffice Document Server is a standalone document editing backend
- The example page (when enabled) provides a built-in interface for creating and editing documents
- Large Docker image (~1.5 GB), first pull may take time
- Startup takes ~30 seconds (PostgreSQL, RabbitMQ, and Node.js services need to initialize)
- Supports OOXML formats natively with high fidelity
