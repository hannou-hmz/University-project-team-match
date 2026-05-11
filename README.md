# 🎓 University Students Team Matching Platform

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express.js-Framework-lightgrey)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue)
![EJS](https://img.shields.io/badge/EJS-Templating-orange)

---

## 📌 Overview

TeamMatch is a web-based platform designed to support university students in collaborating on academic projects. The primary purpose of this system is to simplify the process of forming project teams by providing a centralized environment where students can create their own projects or join existing ones.
In many universities, students face difficulties in finding suitable teammates and coordinating project work, especially in large classes. TeamMatch addresses this problem by allowing users to browse available projects, connect with other students who share similar interests, and organize teams more efficiently.
Additionally, the platform enables students to search for academic advisors and send requests for supervision, which is particularly important for projects that require instructor approval. By integrating these features into a single system, TeamMatch improves communication, reduces the time needed to form teams, and enhances the overall project management experience.

---

## 🚀 Live Demo
You can try the project here:  
https://your-railway-app-link

## 📌 How it works
- Sign up as a student or instructor
- Create or join a project as student
- Send and accept requests as student
- accept reject projects as instructor 

### 👨‍🎓 Students
- Create, edit, delete projects
- Specify required skills and team size
- Browse and join projects
- Request advisor for project instucting
- accept or reject other applicants
- View their own projects

### 👨‍🏫 Advisors
- View student project requests
- accept or reject student requests
- Monitor academic work

### 🛠️ Admin
- Manage categories
- Manage announcements
- Manage user roles
- Control platform data

---

## 🧑‍💻 Tech Stack

| Layer      | Technology                       |
|------------|----------------------------------|                
| Frontend   | EJS, HTML, CSS , javascript      |            
| Backend    | Node.js, Express                 |
| Database   | MySQL                            |
| Auth       | Sessions , express rate limiter  |         
| Encryption | Bcrypt                           |
-------------------------------------------------

## Backend Architecture

Server-Side Logic, APIs, and Data Processing
The backend of the TeamMatch system was developed using Node.js and Express.js, which are responsible for handling server-side logic, processing requests, managing sessions, and communicating with the MySQL database. The application follows a modular routing architecture where functionalities are separated into different route files, including authentication, student, advisor, and administrator routes.

-Server-side logic: 
The main server configuration is defined in the server file, where middleware components such as express-session, method-override, and express-rate-limit are configured. Sessions are stored using MySQL Session Store, allowing authenticated users to remain logged in securely. The system also uses middleware functions such as isStudent, isAdvisor, and isAdmin to restrict access to authorized users only.

Authentication route {API}: 
Authentication is managed through dedicated routes that handle user registration, login, and logout processes. During registration, users are inserted into the database and assigned roles such as student or advisor. Separate records are then created in the corresponding tables. During login, the system validates the provided credentials, creates a session, and redirects the user to the appropriate dashboard based on their role.

-Student route {API}: 
The student routes manage the core functionalities of the platform. Students can create projects, browse available projects, submit applications to join teams, manage their own projects, update profile information, and send advisor requests. For example, when a student submits an application to join a project, the server receives the form data, validates it, stores it in the database, and updates the application status accordingly. Similarly, students can request supervision from advisors by selecting a project and sending a request message through the system.

-Advisor route {API}: 
The advisor routes are responsible for handling advisor-related functionalities. Advisors can view pending supervision requests, accept or reject requests, manage their profiles, and view projects assigned to them. When an advisor accepts a request, the request status is updated in the database and the project becomes associated with that advisor.

-Admin route {API}: 
The administrator routes provide management functionalities for the platform. Administrators can manage users, projects, categories, departments, announcements, and user roles. The system also allows administrators to change user roles dynamically, such as promoting a student to an advisor role.

-Data processing
Data processing within the system follows a structured flow. When a user submits a request from the frontend, the request is sent to the Express server using HTTP methods such as GET, POST, PATCH, or DELETE. The server validates the data, executes SQL queries through MySQL helper functions, and returns the processed results to dynamically rendered EJS views.

-Security
To improve security and system reliability, the application implements request limiting using express-rate-limit, secure session handling using express-session, and password protection using encrypted password storage techniques. Overall, the backend architecture ensures secure authentication, organized request handling, and efficient interaction between the frontend and the database.


## 🗄️ Database Structure

<img width="995" height="948" alt="ER-IMG" src="https://github.com/user-attachments/assets/6630bb06-4d6e-4846-b3f4-20b61a3de6cf" />


## 📄 License

Copyright (c) 2026 Hamza Hannou

All rights reserved.

This project and its source code may not be copied, modified, distributed, or used in any form without explicit permission from the author.

