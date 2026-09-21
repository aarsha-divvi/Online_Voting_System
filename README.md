# Online Voting System

A full-stack web-based **Online Voting System** designed to provide a secure, role-based, and user-friendly platform for managing elections, registering voters, managing candidates, casting votes, and viewing election results.
The application is built using **React + Vite** for the frontend and **Spring Boot** for the backend, with **MySQL** for persistent data storage and **JWT-based authentication** for securing protected resources.
---
## 🌐 Live Application
### Live Demo
**[Open Online Voting System](https://online-voting-system-mirf-beta.vercel.app)**

## 📌 Project Overview
The Online Voting System provides a digital platform for conducting elections through a web application.
The system provides separate functionalities for **voters** and **administrators**. Voters can register, authenticate themselves, view available elections, view candidates, cast votes, and view election results.
Administrators can manage elections, candidates, users, election status, and voting-related information through protected administrative functionality.

---

##  Features

### Voter Features
- Voter registration and login
- JWT-based authentication
- Secure access to protected voter pages
- View available elections
- View election details
- View election candidates
- Cast votes in active elections
- View election results
- Role-based access to voter functionality

### Admin Features
- Secure administrator authentication
- Admin dashboard
- Create and manage elections
- Manage candidates
- Activate and deactivate elections
- Manage users
- Monitor voting-related data
- View election results
- Role-based access control for administrative operations

### Security Features
- Spring Security integration
- JWT-based authentication and authorization
- BCrypt password encryption
- Protected API endpoints
- Role-based access control
- Stateless authentication
- CORS configuration for the deployed frontend
- Sensitive configuration managed through environment variables
- Database credentials kept outside the source code
  
## Tech Stack
### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS
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
- Aiven MySQL

### Deployment & Tools
- Vercel – Frontend Deployment
- Render – Backend Deployment
- Docker – Containerization
- Git & GitHub – Version Control
- IntelliJ IDEA – Backend Development
