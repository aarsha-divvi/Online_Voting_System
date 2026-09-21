# Online Voting System

A full-stack web-based Online Voting System designed to provide a secure, role-based, and user-friendly platform for managing elections, registering voters, managing candidates, casting votes, and viewing election results.
The application is built using React + Vite for the frontend and Spring Boot for the backend, with MySQL for persistent data storage and JWT-based authentication for securing protected resources.

## Features

### Voter Features
- Voter registration and login
- JWT-based authentication
- Secure access to protected voter pages
- View available elections
- View election candidates
- Cast votes in active elections
- View election results
- Role-based access to voter functionality

### Admin Features
- Secure administrator authentication
- Admin dashboard
- Create and manage elections
- Manage candidates
- Manage election status
- Monitor voting-related data
- View election results
- Role-based access control for administrative operations

### Security
- Spring Security integration
- JWT-based authentication and authorization
- Protected API endpoints
- Role-based access control
- Sensitive configuration managed through environment variables
- Database credentials kept outside the source code

---

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS3
- Fetch API

### Backend
- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- Gradle

### Database
- MySQL

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: Aiven MySQL
- Containerization: Docker
- Source Control: Git & GitHub
