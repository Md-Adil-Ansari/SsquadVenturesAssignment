
Welcome to the Project! This documentation will guide you through cloning, setting up, running, and testing the two primary services included in this project: **User Service** and **Plan Service**.
The repository contains Postman collections for two services.

# Table of Contents

- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Services](#running-services)
- [API Documentation](#api-documentation)
- [Additional Information](#additional-information)
- [Troubleshooting](#troubleshooting)
- [Contact](#contact)

---

## Project-Overview

This project employs a **Microservices Architecture**, comprising two independent services:

### User Service

**Purpose:**  
Manages user registration, authentication, and social connections.

**Features:**  
- Register a new user.  
- Log in a user.  
- Log out a user.  
- Add friends (create friendships).  
- Retrieve user details.  
- View the list of a user's friends.  
- Access the friends of a user's friends.

---

### Plan Service

**Purpose:**  
Handles the creation, retrieval, and filtering of plans.

**Features:**  
- Create a new plan.  
- Retrieve all plans created by the logged-in user.  
- Retrieve all plans across all users.  
- Test API for bulk plan insertion without authentication or validation (useful for testing the filtering API).  
- Filter plans based on:  
  - Participants (people involved).  
  - Location.  
  - Plan category.  
  - Timeline.

A **Shared** directory contains common utilities and configurations used across both services.

Each service runs independently, allowing for scalability, maintainability, and flexibility in deployment.

---

## Folder-Structure

Here's a breakdown of the project's directory structure:

```
root-directory/
├── services/
│   ├── plan-service/
│   │   ├── node_modules/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── app.js
│   │   ├── .env
│   │   ├── .gitignore
│   │   ├── package-lock.json
│   │   └── package.json
│   ├── user-service/
│       ├── node_modules/
│       ├── src/
│       │   ├── controllers/
│       │   ├── middlewares/
│       │   ├── models/
│       │   ├── routes/
│       │   └── app.js
│       ├── .env
│       ├── .gitignore
│       ├── package-lock.json
│       └── package.json
├── shared/
    ├── errors/
    ├── middlewares/
    ├── utils/
    └── .gitignore
```

- **services/**: Contains individual microservices.
  - **plan-service/**: Handles plan-related operations.
  - **user-service/**: Manages user-related functionalities.
- **shared/**: Holds shared utilities, middleware, and configurations.

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Git**: Version control system.
- **Node.js**: JavaScript runtime.
- **npm**: Node package manager (comes with Node.js).
- **Postman**: For testing APIs.

---

## Installation

Follow these steps to clone the repository and set up the project on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/Md-Adil-Ansari/SsquadVenturesAssignment.git
cd SsquadVenturesAssignment
```

### 2. Install Dependencies

Each service has its own set of dependencies. You'll need to install them individually.

#### a. User Service

```bash
cd services/user-service
npm install
```

#### b. Plan Service

```bash
cd ../plan-service
npm install
```

## Configuration

Proper configuration is crucial for the services to communicate effectively. We'll use environment variables to manage configurations.

### 1. Environment Variables

Create a `.env` file in each service with the necessary variables.

#### a. User Service

Create a file named `.env` inside `services/user-service/` with the following content:

```env
PORT=3001
MONGO_URI=mongodb uri with database for example userdb
JWT_SECRET=your_jwt_secret_key
```

*Ensure that `JWT_SECRET` is a strong, unique key in each `.env` file. AND SHOULD BE SAME FOR BOTH THE ENV FILE*

#### b. Plan Service

Create a file named `.env` inside `services/plan-service/` with the following content:

```env
PORT=3002
MONGO_URI=mongodb uri with database for example plandb
JWT_SECRET=your_jwt_secret_key
USER_SERVICE_URL=http://localhost:3001/api/users
```

*Ensure that `JWT_SECRET` is a strong, unique key in each `.env` file. AND SHOULD BE SAME FOR BOTH THE ENV FILE*

---

## Running-Services
### Open different terminals for running different services

### running user-service

- Go to the user-service directory open a terminal and run the command
- `npm run dev`
- On the terminal you will see user service running on port
- Copy that port from the terminal and use that port in the `.env` file of the plan-service and in checking the APIs of the user-service.

### running plan-service

- Go to the plan-service directory open a terminal and run the command
- `npm run dev`
- On the terminal you will see plan service running on port
- Copy that port from the terminal and use that port in checking the APIs of the plan-service.

## API-Documentation

Below are the available APIs for the **User Service** and **Plan Service**. Use **Postman** to interact with these endpoints.

---

### User Service APIs

**Base URL**: `http://localhost:3001/api/users`

#### 1. Register a New User

- **Endpoint**: `/register`
- Complete URL: `http://localhost:3001/api/users/register`
- **Method**: `POST`
- **Description**: Registers a new user.
- **Request Body**:

  ```json
  {
    "username": "ad",
    "email": "ad@example.com",
    "password": "Ad@123"
  }
  ```

- **Response**:

  - **Success (201 Created)**:

    ```json
    {
        "status": "success",
        "data": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...",
            "user": {
                "_id": "673ddc02da9d186f7b7293a1",
                "username": "ad",
                "email": "ad@example.com"
            }
        },
        "message": "User registered successfully"
    }
    ```

  - **Error (400 Bad Request)**:

    ```json
    {
        "status": "error",
        "error": {
            "code": "BAD_REQUEST",
            "message": "User already exists..."
        }
    }
    ```

#### 2. Login User

- **Endpoint**: `/login`
- Complete URL : `http://localhost:3001/api/users/login`
- **Method**: `POST`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:

  ```json
  {
      "email":"ad@example.com",
      "password":"Ad@123"
  }
  ```

- **Response**:

  - **Success (200 OK)**:

    ```json
    {
        "status": "success",
        "data": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user": {
                "_id": "673ddc02da9d186f7b7293a1",
                "username": "ad",
                "email": "ad@example.com"
            }
        },
        "message": "Logged in successfully"
    }
    ```

  - **Error (401 Unauthorized)**:

    ```json
    {
        "status": "error",
        "error": {
            "code": "UNAUTHORIZED",
            "message": "Invalid email or password."
        }
    }
    ```

#### 3. Logout User

- **Endpoint**: `/logout`
- Complete URL: `http://localhost:3001/api/users/logout`
- **Method**: `POST`
- **Description**: Logs out the authenticated user.
- **Headers**:

  ```
  Authorization: Bearer jwt_token_here
  ```

  For example:

  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

- **Response**:

  - **Success (200 OK)**:

    ```json
    {
        "status": "success",
        "data": null,
        "message": "Logged out successfully."
    }
    ```

  - **Error (401 Unauthorized)**:

    ```json
    {
        "status": "error",
        "error": {
            "code": "UNAUTHORIZED",
            "message": "Token has been revoked. Please log in again."
        }
    }
    ```

#### 4. Get User by ID

- **Endpoint**: `/getUser/:id`
- Complete URL: `http://localhost:3001/api/users/getUser/:id`
- **Method**: `GET`
- **Description**: Retrieves user details by user ID.
- **Headers**:

  ```
  Authorization: Bearer jwt_token_here
  ```

- **Parameters**:

  - `id`: `string` - The unique ID of the user.

- **Response**:

  - **Success (200 OK)**:

    ```json
    {
        "status": "success",
        "data": {
            "user": {
                "_id": "673ddc02da9d186f7b7293a1",
                "username": "ad",
                "email": "ad@example.com",
                "createdAt": "2024-11-20T12:54:26.653Z",
                "updatedAt": "2024-11-20T12:54:26.653Z",
                "__v": 0
            }
        },
        "message": "User retrieved successfully."
    }
    ```

  - **Error (404 Not Found)**:

    ```json
    {
        "status": "error",
        "error": {
            "code": "NOT_FOUND",
            "message": "User not found"
        }
    }
    ```

#### 5. Create Connection (Add Friend)

- **Endpoint**: `/connect`
- Complete URL: `http://localhost:3001/api/users/connect`
- **Method**: `POST`
- **Description**: Establishes a connection between two users (e.g., sends a friend request).
- **Headers**:

  ```
  Authorization: Bearer jwt_token_here
  ```

- **Request Body**:

  ```json
  {
      "targetUserId":"673d91340bf28a9920f4b3ad"
  }
  ```

- **Response**:

  - **Success (200 OK)**:

    ```json
    {
        "status": "success",
        "data": {
            "connectionId": "673ddf2a16e599ff06bce02b",
            "connectedUser": {
                "id": "673d91340bf28a9920f4b3ad",
                "username": "g",
                "email": "g@example.com"
            },
            "createdAt": "2024-11-20T13:07:54.936Z"
        },
        "message": "Connection created successfully."
    }
    ```

  - **Error (400 Bad Request)**:

    ```json
    {
        "status": "error",
        "error": {
            "code": "BAD_REQUEST",
            "message": "You cannot connect with yourself."
        }
    }
    ```

  - **Error (400 Bad Request)**:

    ```json
    {
        "status": "error",
        "error": {
            "code": "BAD_REQUEST",
            "message": "Connection already exists."
        }
    }
    ```

#### 6. Get Friends of User

- **Endpoint**: `/:userId/friends`
- Complete URL: `http://localhost:3001/api/users/:userId/friends`
- **Method**: `GET`
- **Description**: Retrieves a list of friends for a specific user.
- **Headers**:

  ```
  Authorization: Bearer jwt_token_here
  ```

- **Parameters**:

  - `userId`: `string` - The unique ID of the user.

- **Response**:

  - **Success (200 OK)**:

    ```json
    {
        "status": "success",
        "data": {
            "friends": [
                {
                    "id": "673d91340bf28a9920f4b3ad",
                    "username": "g"
                }
            ]
        },
        "message": "Friends of the specified user retrieved successfully."
    }
    ```

  - **Error (400 Bad Request)**:

    ```json
    {
        "status": "error",
        "error": {
            "code": "BAD_REQUEST",
            "message": "The user Id entered is not the logged in user..."
        }
    }
    ```

#### 7. Get Friends of Friends

- **Endpoint**: `/:userId/friends-of-friends`
- Complete URL: `http://localhost:3001/api/users/:userId/friends-of-friends`
- **Method**: `GET`
- **Description**: Retrieves a list of friends of friends for a specific user.
- **Headers**:

  ```
  Authorization: Bearer jwt_token_here
  ```

- **Parameters**:

  - `userId`: `string` - The unique ID of the user.

- **Response**:

  - **Success (200 OK)**:

    ```json
    {
        "status": "success",
        "data": {
            "friendsOfFriends": [
                {
                    "id": "673d911b0bf28a9920f4b3a4",
                    "username": "d"
                }
            ]
        },
        "message": "Friends of friends retrieved successfully."
    }
    ```

  - **Error (400 Bad Request)**:

    ```json
    {
        "status": "error",
        "error": {
            "code": "BAD_REQUEST",
            "message": "The user Id entered is not the logged in user..."
        }
    }
    ```

---

### Plan Service APIs

**Base URL**: `http://localhost:3002/api/plans`

#### 1. Create a New Plan

- **Endpoint**: `/create`
- **Method**: `POST`
- **Description**: Creates a new plan.
- **Headers**:

  ```
  Authorization: Bearer jwt_token_here
  ```

- **Request Body**:
- Subcategory is optional

  ```json
  {
     "category": "business",
     "subcategory":"conference",
      "location": { "lat": 41.9028, "lng": 12.4964 },
      "date": "2024-12-05",
      "time": "11:00 AM",
      "people": ["673d91340bf28a9920f4b3ad"] 
  }
  ```

- **Response**:

  - **Success (201 Created)**:

    ```json
    {
        "status": "success",
        "data": {
            "creatorName": "ad",
            "category": "business",
            "subcategory": "conference",
            "location": {
                "lat": 41.9028,
                "lng": 12.4964
            },
            "date": "2024-12-05T00:00:00.000Z",
            "time": "11:00 AM",
            "createdAt": "2024-11-20T13:20:31.027Z",
            "peopleCount": 1,
            "peopleNames": [
                "g"
            ],
            "status": "open"
        },
        "message": "Plan created successfully."
    }
    ```

  - **Error (400 Bad Request)**:

    ```json
    {
        "status": "error",
        "error": {
            "code": "BAD_REQUEST",
            "message": "Plan validation failed: category: Category must be one of the following: travel, shop, socialize, business"
        }
    }
    ```

  - Error (400 Bad Request):

    ```json
    {
        "status": "error",
        "error": {
            "code": "BAD_REQUEST",
            "message": "A plan with the same details already exists.",
            "details": {
                "planId": "673de21f734b2194dc808982"
            }
        }
    }
    ```

  - Error (400 Bad Request):

    ```json
    {
        "status": "error",
        "error": {
            "code": "BAD_REQUEST",
            "message": "One or more user IDs have an invalid format.",
            "details": {
                "invalidFormatIds": [
                    "ajkdjf"
                ]
            }
        }
    }
    ```

  - Error (400 Bad Request):

    ```json
    {
        "status": "error",
        "error": {
            "code": "BAD_REQUEST",
            "message": "Some user IDs are not friends of the creator.",
            "details": {
                "nonFriendIds": [
                    "673d91890bf28a9920f4b3c2"
                ]
            }
        }
    }
    ```

  - Error (400 Bad Request):
  - People array can be empty but the empty array should be provided.

    ```json
    {
        "status": "error",
        "error": {
            "code": "BAD_REQUEST",
            "message": "Category, location, date, time, and people array are required."
        }
    }
    ```

#### 2. Create Multiple Plans - This is just for testing so that you can insert a lot of plans at a time and without authentication and you can check it for the filter API but make sure that the people array should contain the friend ID (because this is just for inserting and testing I am not testing whether the provided people array ID is the logged in user's friends or not)

- **Endpoint**: `/createMany`
- Complete URL: `http://localhost:3002/api/plans/createMany`
- **Method**: `POST`
- **Description**: Inserts multiple plans at once.

- **Request Body**:

  ```json
  {
    "plans": [
      {
        "creatorName": "a",
        "category": "business",
        "subcategory": "conference",
        "location": { "lat": 40.7128, "lng": -74.0060 },
        "date": "2024-12-15",
        "time": "10:00 AM",
        "people": ["673d910b0bf28a9920f4b39e", "673d91120bf28a9920f4b3a1"],
        "createdBy": "673d91000bf28a9920f4b39b",
        "peopleNames": ["b", "c"]
      },
      {
        "creatorName": "b",
        "category": "travel",
        "subcategory": "adventure",
        "location": { "lat": 34.0522, "lng": -118.2437 },
        "date": "2024-11-20",
        "time": "2:00 PM",
        "people": [],
        "createdBy": "673d91000bf28a9920f4b39b",
        "peopleNames": []
      }
      ]
    }
    ```

- **Response**:

  - **Success (201 Created)**:

    ```json
    {
    "status": "success",
    "data": [
        {
            "creatorName": "a",
            "category": "business",
            "subcategory": "conference",
            "location": {
                "type": "Point",
                "coordinates": [
                    -74.006,
                    40.7128
                ]
            },
            "date": "2024-12-15T00:00:00.000Z",
            "time": "10:00 AM",
            "people": [
                "673d910b0bf28a9920f4b39e",
                "673d91120bf28a9920f4b3a1"
            ],
            "createdBy": "673d91000bf28a9920f4b39b",
            "peopleNames": [
                "b",
                "c"
            ],
            "status": "open",
            "_id": "673de4e9734b2194dc808987",
            "__v": 0,
            "createdAt": "2024-11-20T13:32:25.264Z",
            "updatedAt": "2024-11-20T13:32:25.264Z"
        },
        {
            "creatorName": "b",
            "category": "travel",
            "subcategory": "adventure",
            "location": {
                "type": "Point",
                "coordinates": [
                    -118.2437,
                    34.0522
                ]
            },
            "date": "2024-11-20T00:00:00.000Z",
            "time": "2:00 PM",
            "people": [],
            "createdBy": "673d91000bf28a9920f4b39b",
            "peopleNames": [],
            "status": "open",
            "_id": "673de4e9734b2194dc808988",
            "__v": 0,
            "createdAt": "2024-11-20T13:32:25.264Z",
            "updatedAt": "2024-11-20T13:32:25.264Z"
        }
    ],
    "message": "Plans inserted successfully."
    }
    ```

#### 3. Get Available Plans of the logged in user

- **Endpoint**: `/`
- Complete URL: `http://localhost:3002/api/plans`
- **Method**: `GET`
- **Description**: Retrieves all available plans of the logged In User
- **Headers**:

  ```
  Authorization: Bearer jwt_token_here
  ```

- **Response**:

  - **Success (200 OK)**:

    ```json
    {
        "status": "success",
        "data": {
            "plans": [
                {
                    "creatorName": "ad",
                    "category": "business",
                    "location": {
                        "type": "Point",
                        "coordinates": [
                            12.4964,
                            41.9028
                        ]
                    },
                    "date": "2024-12-05T00:00:00.000Z",
                    "time": "11:00 AM",
                    "createdAt": "2024-11-20T13:20:31.027Z",
                    "peopleCount": 1,
                    "peopleNames": [
                        "g"
                    ],
                    "status": "open"
                }
            ],
            "pagination": {
                "total": 1,
                "page": 1,
                "limit": 20,
                "totalPages": 1
            }
        },
        "message": "Available plans retrieved successfully."
    }
    ```

  - **Error (401 Unauthorized)**:

    ```json
    {
        "message": "Invalid or expired token."
    }
    ```

#### 4. Get all available plans of all the user

- **Endpoint**: `/getAllPlansOfAllUsers`
- Complete URL: `http://localhost:3002/api/plans/getAllPlansOfAllUsers`
- **Method**: `GET`
- **Description**: Retrieves all available plans of all users
- **Headers**:

  ```
  Authorization: Bearer jwt_token_here
  ```

- **Response**:
  - Success (200 OK)

    ```json
    {
        "status": "success",
        "data": {
            "plans": [
                {
                    "creatorName": "b",
                    "category": "travel",
                    "location": {
                        "type": "Point",
                        "coordinates": [
                            -118.2437,
                            34.0522
                        ]
                    },
                    "date": "2024-11-20T00:00:00.000Z",
                    "time": "2:00 PM",
                    "createdAt": "2024-11-20T13:32:25.264Z",
                    "peopleCount": 0,
                    "peopleNames": [],
                    "status": "open"
                },
                {
                    "creatorName": "a",
                    "category": "business",
                    "location": {
                        "type": "Point",
                        "coordinates": [
                            -74.006,
                            40.7128
                        ]
                    },
                    "date": "2024-12-15T00:00:00.000Z",
                    "time": "10:00 AM",
                    "createdAt": "2024-11-20T13:32:25.264Z",
                    "peopleCount": 2,
                    "peopleNames": [
                        "b",
                        "c"
                    ],
                    "status": "open"
                },
                {
                    "creatorName": "ad",
                    "category": "business",
                    "location": {
                        "type": "Point",
                        "coordinates": [
                            12.4964,
                            41.9028
                        ]
                    },
                    "date": "2024-12-05T00:00:00.000Z",
                    "time": "11:00 AM",
                    "createdAt": "2024-11-20T13:20:31.027Z",
                    "peopleCount": 1,
                    "peopleNames": [
                        "g"
                    ],
                    "status": "open"
                }
            ],
            "pagination": {
                "total": 3,
                "page": 1,
                "limit": 20,
                "totalPages": 1
            }
        },
        "message": "Available plans retrieved successfully."
    }
    ```

#### 5. Filter Plans

- **Endpoint**: `/filter`
- Example of complete URL: `http://localhost:3002/api/plans/filter?page=8&limit=2&people=friends&people=friendsOfFriends`
- **Method**: `GET`
- **Description**: Filters plans based on various criteria.
- **Headers**:

  ```
  Authorization: Bearer jwt_token_here
  ```

- **Query Parameters**:

  - `people`: friends (e.g., `friends`, `friendsOfFriends`, `global`)
  - `category`: String
  - `subcategory`: String
  - `location`: JSON string (e.g., `{"lat":40.7128,"lng":-74.0060}`)
  - `distance`: Number (in km)
  - `timelineStatus`: `active` | `upcoming`
  - `withinValue`: Number
  - `withinUnit`: `days` | `weeks` | `months`
  - `afterValue`: Number
  - `afterUnit`: `days` | `weeks` | `months`
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10)

- **Example Request**:

  ```bash
  http://localhost:3002/api/plans/filter?category=shop
  ```

- **Response**:

  - **Success (200 OK)**:

    ```json
    {
        "status": "success",
        "data": {
            "plans": [
                {
                    "creatorName": "d",
                    "category": "shop",
                    "subcategory": "fashion",
                    "location": {
                        "lat": 41.9028,
                        "lng": 12.4964
                    },
                    "date": "2024-12-05T00:00:00.000Z",
                    "time": "11:00 AM",
                    "createdAt": "2024-11-20T10:17:03.331Z",
                    "peopleCount": 2,
                    "peopleNames": [
                        "e",
                        "b"
                    ],
                    "status": "open"
                },
                {
                    "creatorName": "f",
                    "category": "shop",
                    "subcategory": "books",
                    "location": {
                        "lat": 40.4168,
                        "lng": -3.7038
                    },
                    "date": "2024-12-28T00:00:00.000Z",
                    "time": "3:45 PM",
                    "createdAt": "2024-11-20T10:17:03.331Z",
                    "peopleCount": 0,
                    "peopleNames": [],
                    "status": "open"
                },
                {
                    "creatorName": "c",
                    "category": "shop",
                    "subcategory": "electronics",
                    "location": {
                        "lat": 51.5074,
                        "lng": -0.1278
                    },
                    "date": "2024-12-01T00:00:00.000Z",
                    "time": "1:00 PM",
                    "createdAt": "2024-11-20T10:17:03.330Z",
                    "peopleCount": 1,
                    "peopleNames": [
                        "b"
                    ],
                    "status": "open"
                }
            ],
            "pagination": {
                "total": 3,
                "page": 1,
                "limit": 10,
                "totalPages": 1
            }
        },
        "message": "Plans retrieved successfully with applied filters."
    }
    ```

  - **Error (400 Bad Request)**:

    ```json
    {
        "status": "error",
        "error": {
            "code": "BAD_REQUEST",
            "message": "Invalid category: HelloWorld. Allowed categories are business, travel, socialize, shop."
        }
    }
    ```

---

## Additional-Information

### 1. Shared Utilities

Common utilities, middleware, and configurations are stored in the `shared/` directory, ensuring code reuse and consistency across services.

- **middleware/**: Contains middleware functions like authentication.
- **utils/**: Holds utility functions and helpers.

## Troubleshooting

### 1. Common Issues

- **Ports Already in Use**: Make sure to enter the port number that is displayed in the terminal once you start both the services.

- **Database Connection Errors**: Verify that MongoDB is running and accessible. Check the `MONGO_URI` in your `.env` files.

- **Authentication Failures**: Ensure that the JWT token is correctly generated and included in the `Authorization` header.

---

## Contact

For any questions or support, please contact [adil9304784417@gmail.com](mailto:adil9304784417@gmail.com).

---
