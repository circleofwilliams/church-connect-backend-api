const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CHURCH BACKEND REST API',
      version: '1.0.0',
      description:
        'This is backend api documentation for the church connect mvp',
    },
    servers: [
      {
        url: 'http://localhost:6244',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'AUTH',
        description:
          'All authentication and authorization related controllers.',
      },
    ],
    paths: {
      '/auth/signup': {
        post: {
          tags: ['AUTH'],
          summary: 'Signing up a new user',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/user',
                },
              },
            },
            required: true,
          },
          responses: {
            201: {
              description: 'Successful signup',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/successMessage',
                  },
                },
              },
            },
            409: {
              description: 'Conflicting entity',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
            422: {
              description: 'Unprocessable entity',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['AUTH'],
          summary: 'Logging in a user.',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/login',
                },
              },
            },
            required: true,
          },
          responses: {
            200: {
              description: 'Successful login',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/successMessage',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized access',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
            422: {
              description: 'Unprocessable entity',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
          },
        },
      },
      '/auth/logout': {
        delete: {
          tags: ['AUTH'],
          summary: 'Logging out a user.',
        },
        responses: {
          204: {
            description: 'Successful logout',
          },
          401: {
            description: 'Unauthorized access',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/errorMessage',
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/errorMessage',
                },
              },
            },
          },
        },
      },
      '/auth/forgotPassword': {
        post: {
          tags: ['AUTH'],
          summary: 'Forgot password',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/forgotPassword',
                },
              },
            },
            required: true,
          },
          responses: {
            200: {
              description: 'Successful initialization of password reset',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/successMessage',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized access',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
            422: {
              description: 'Unprocessable entity',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
          },
        },
      },
      '/auth/resetPassword/:token': {
        patch: {
          tags: ['AUTH'],
          summary: 'Reseting a new password.',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/resetPassword',
                },
              },
            },
            required: true,
          },
          responses: {
            201: {
              description: 'Successful password change',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/successMessage',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized access',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
            422: {
              description: 'Unprocessable entity',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/errorMessage',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        user: {
          type: 'object',
          required: ['firstname', 'lastname', 'username', 'email', 'password'],
          properties: {
            firstname: {
              type: 'string',
              description:
                "user's firstname, minimum length is 3 and maximum length is 25",
            },
            lastname: {
              type: 'string',
              description:
                "user's lastname, minimum length is 3 and maximum length is 25",
            },
            username: {
              type: 'string',
              description:
                'username for the user, minimum length is 3 and maximum length is 25 and case insensitive',
            },
            email: {
              type: 'string',
              description: "user's email",
            },
            password: {
              type: 'string',
              description: "user's password, mimimum of 6 characters",
            },
          },
        },
        login: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: "user's username",
            },
            password: {
              type: 'string',
              description: "user's password",
            },
          },
        },
        forgotPassword: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: "user's registered email",
            },
          },
        },
        resetPassword: {
          type: 'object',
          properties: {
            newPassword: {
              type: 'string',
              description: "user's new password",
            },
          },
        },
        successMessage: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'shows a true status',
            },
            message: {
              type: 'string',
              description: 'Message sent from the server',
            },
            data: {
              type: 'object',
              description: 'Data returned from server.',
            },
          },
        },
        errorMessage: {
          type: 'object',
          properties: {
            error: {
              type: 'boolean',
              description: 'shows a true status',
            },
            message: {
              type: 'string',
              description: 'Message sent from the server',
            },
            data: {
              type: 'object',
              description: 'Data returned from server.',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/authRoutes.js'],
};

module.exports = options;
