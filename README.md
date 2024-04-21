# BLOG API

This is a RESTful API for managing users, blog posts and comments. It provides endpoints for user registration, login, profile management, CRUD operations for blog posts and commenting functionalities.

## Table of contents

- [Features](#features)
- [Technologies used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## Features

- User Management: Create, read, update and delete user profiles.
- Blog Posts: Create, read, update and delete blog posts.
- Comments: Add, view and delete comments on blog posts.
- Authentication: JWT-based authentication for protected routes.

## Technologies Used

- [Node.js](https://nodejs.org/en)
- [Express.js](https://expressjs.com/)
- [MongoDB (NoSQL database)](https://www.mongodb.com/)
- [Typescript](https://www.typescriptlang.org/)

## Setup Instructions

1. Clone the repository:

```
git clone https://github.com/DeadEyeIndia/verlynk-backend.git
```

2. Navigate to the project directory:

```
cd verlynk-backend
```

3. Install dependencies:

```
npm install
```

> Note: To run above code you need node installed
>
> If not install use below link to install:
> [Node.js](https://nodejs.org/en/download)
> Install LTS version 18.20.2 or newer to run the application properly.

4. Set up environment variables:

> Create a .env file in the root directory and define the following variables:

```
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRE=
DB_NAME=
BUCKET_NAME=
NODE_ENV=
```

> Make sure to add all variables values

5. Build the application:

```
npm run start:build
```

6. Run the application:

```
npm run start
```

> The server will start running on the specified port (default is 3010)

## API Endpoints

All API's are prefixed with `/api/`

- User Management:
  | Method | URL | Description | Required |
  | ------ | ------------- | ---------------------------- | ------------------------------- |
  | `POST` | `/api/signup` | Create a new user. | fullname, email, password |
  | `POST` | `/api/signin` | Login with user credentials. | email, password |
  | `GET` | `/api/me` | Get current logged in user | |
  | `POST` | `/api/signout` | User Logout. | |
