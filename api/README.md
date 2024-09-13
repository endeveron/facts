**DB** authapi

**Base URL** http://localhost:8000/api

**SignUp**

_POST_ http://localhost:8000/api/auth/signup
_Content-Type: application/json_

_Request Example_

    {
      "name": "...",
      "email": "...",
      "password": "..."
    }

_Response Example_

    {
      "data": {
        "token": "...",
        "user": {
          "_id": "...",
          "account": {
            "name": "...",
            "email": "..."
          },
          "role": {
            "index": 1,
            "name": "user"
          }
        }
      }
    }

or

    {
      "error": {
        "message": "Email in use",
        "statusCode": 409
      }
    }

**SignIn**

_POST_ http://localhost:8000/api/auth/signin
_Content-Type: application/json_

_Request Example_

    {
      "email": "...",
      "password": "..."
    }

_Response Example_

    {
      "data": {
        "token": "...",
        "user": {
          "_id": "...",
          "account": {
            "name": "...",
            "email": "..."
          },
          "role": {
            "index": 1,
            "name": "user"
          }
        }
      }
    }

or

    {
      "error": {
        "message": "Invalid password",
        "statusCode": 401
      }
    }
