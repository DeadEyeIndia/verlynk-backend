# BLOG API

This is a RESTful API for managing users, blog posts and comments. It provides endpoints for user registration, login, profile management, CRUD operations for blog posts and commenting functionalities.

## Table of contents

- [Features](#features)
- [Technologies used](#technologies-used)
- [Setup Instructions](#setup-instructions)
  - [List of npm packages](#list-of-npm-packages)
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
- [MongoDB GridFS](https://www.mongodb.com/docs/manual/core/gridfs/)
- [Typescript](https://www.typescriptlang.org/)

## Setup Instructions

### List of npm packages

- express - `^4.19.2`
- bcryptjs - `^2.4.3`
- body-parser - `^1.20.2`
- cookie-parser - `^1.4.6`
- cors - `^2.8.5`
- dotenv - `^16.4.5`
- jsonwebtoken - `^9.0.2`
- mongodb - `^6.5.0`
- multer - `^1.4.5-lts.1`

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

  | Method | URL            | Protected Route | Description                  | Required                  |
  | ------ | -------------- | --------------- | ---------------------------- | ------------------------- |
  | `POST` | `/api/signup`  | No              | Create a new user.           | fullname, email, password |
  | `POST` | `/api/signin`  | No              | Login with user credentials. | email, password           |
  | `GET`  | `/api/me`      | Yes             | Get current logged in user   |                           |
  | `POST` | `/api/signout` | Yes             | User Logout.                 |                           |

- Blog Post Management:

> Note: For file upload [MongoDB GridFS](https://www.mongodb.com/docs/manual/core/gridfs/) comes in picture, if you want to no more about this click on link.

| Method   | URL                             | Protected Route | Description                  | Required                                                                                      |
| -------- | ------------------------------- | --------------- | ---------------------------- | --------------------------------------------------------------------------------------------- |
| `POST`   | `/api/create/post`              | Yes             | Add a new blog post.         | title, postimage, intro, quickintrotitle, quickintrolist, resulttitle, resultlist, conclusion |
| `GET`    | `/api/post/:postid`             | No              | Get blog post.               | postid                                                                                        |
| `PATCH`  | `/api/edit/post/:postid`        | Yes             | Edit a blog post.            | postid, title, intro, quickintrotitle, quickintrolist, resulttitle, resultlist, conclusion    |
| `PATCH`  | `/api/edit/post/upload/:postid` | Yes             | Edit image of a blog post.   | postid, postimage                                                                             |
| `DELETE` | `/api/delete/post/:postid`      | Yes             | Delete image of a blog post. | postid                                                                                        |

- Comment Management:

  | Method   | URL                                      | Protected Route | Description                      | Required            |
  | -------- | ---------------------------------------- | --------------- | -------------------------------- | ------------------- |
  | `POST`   | `/api/add/comment/:postid`               | Yes             | Add comment on blog post.        | commenttext, postid |
  | `GET`    | `/api/comments/:postid`                  | No              | Get all comments on blog post.   | postid              |
  | `DELETE` | `/api/delete/comment/:postid/:commentid` | Yes             | Delete a comment from blog post. | postid              |

## Authentication

- Some API uses JWT (JSON Web Tokens) for authentication.
- Protected routes require a valid JWT token to access. Users must include the token in the Authorization header of the HTTP request.

## Error Handling

- The API handles errors gracefully and provides informative error messages.
- Input data is validated to ensure consistency and prevent potential errors.
