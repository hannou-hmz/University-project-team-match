

=======
# 🎓 University Students Team Matching Platform

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express.js-Framework-lightgrey)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue)
![EJS](https://img.shields.io/badge/EJS-Templating-orange)

---

## 📌 Overview

This platform is designed to help university students both **find suitable teammates** and **connect with advisors** for their academic projects.

Students can create , aapply , and publish projects, specify required skills, and build teams, while also searching for advisors to supervise their work.  
Advisors can browse student projects and choose to advise projects that match their expertise.

The system aims to simplify collaboration and improve the quality of student projects by combining **team formation** and **advisor matching** in one platform.

---

## 🧑‍💻 Tech Stack
Frontend:
- EJS (templating engine)
- CSS
- JavaScript

Backend:
- Node.js
- Express.js
- MySQL

Authentication & Security:
- bcrypt (password hashing)
- express-session / cookies (session management)
- rate limiter (brute-force protection)

Email Service
- Nodemailer (sending verification / reset emails)
  
Other Middleware
- method-override (HTTP method support for forms)

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

### 🔐 Password Reset System
This project includes a secure password reset feature that allows users to recover access to their accounts through email verification.

How It Works:
- The user requests a password reset using their registered email address.
- The system checks whether a previous reset code exists for the user. If one exists, it is deleted before generating a new code.
- A new 6-digit verification code is generated.
- The verification code is hashed using bcrypt before being stored in the database.
- The code is sent to the user's email using Nodemailer.
- The user enters the received code to verify their identity.
- Verification codes expire after 5 minutes.
- Failed verification attempts are limited to reduce brute-force attacks.
- After successful verification, the reset code is deleted and the user is allowed to create a new password.
- Once the password is successfully updated, the reset process is completed.
- Security Measures
- Only one active reset code is allowed per user.
- Reset codes are stored as bcrypt hashes rather than plain text.
- Verification codes automatically expire after 5 minutes.
- Rate limiting restricts password reset requests to a maximum of 5 attempts.
- Used verification codes are immediately removed from the database.
- Users must successfully verify ownership of their email address before changing their password.

---

## 🗄️ Database Structure

Main tables:
- `roles`
- `categories`
- `departments`
- `users`
- `students`
- `advisors`
- `student_projects`
- `categories`
- `advisor_requests`
- `Admins`
- `advisors`
- `students`
- `Announcements`
- `Applications`
- `Sessions` 

Relationships:
Initial ER diagram (There are changes ..)
<img width="1241" height="690" alt="Screenshot 2026-04-21 165732" src="https://github.com/user-attachments/assets/f8ef2140-b848-4510-b817-100346b08d4f" />
---

## 📄 License

Copyright (c) 2026 Hamza Hannou

All rights reserved.

This project and its source code may not be copied, modified, distributed, or used in any form without explicit permission from the author.

>>>>>>> 5d7083a (Auth routes : simplification of extra line of codes)
