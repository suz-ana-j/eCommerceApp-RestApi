# E-Commerce App

This project is a full-stack E-Commerce application that allows users to register accounts, browse products, manage carts, and place orders. The app is built with PostgreSQL for the database, Express for the backend, and Node.js for the server-side logic. It also includes a REST API for managing products, user accounts, carts, and orders.

## Features

- **User Registration & Authentication**: Users can create an account, log in, and securely manage their session.
- **Product Management**: Users can browse and search for products in the store.
- **Cart Management**: Users can add products to their cart and manage the items before checkout.
- **Order Management**: Users can place orders and view order history.
- **REST API**: The app exposes a REST API for handling CRUD operations on products, user accounts, carts, and orders.
- **Swagger Documentation**: API documentation is available via Swagger for easy reference and testing.

## What I Learned

- **Building a REST API**: This project allowed me to deepen my understanding of building RESTful APIs with Express, handling HTTP requests, and structuring routes for CRUD operations.
- **PostgreSQL Integration**: I gained experience in connecting a PostgreSQL database with an Express app, performing SQL queries, and managing relationships between tables.
- **Authentication & Authorization**: Implementing user authentication with JWT tokens taught me about securely handling user sessions and protecting routes.
- **API Documentation with Swagger**: I learned how to use Swagger to document and test my API, which is essential for developers and consumers of the API.
- **End-to-End Full-Stack Development**: This project helped me connect the dots between front-end and back-end development, from creating API routes to connecting them to the frontend for a seamless user experience.

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- JWT (JSON Web Tokens)
- Swagger UI

## Installation

Follow the instructions below to set up the project locally.

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/ecommerce-app.git
    ```

2. Install the dependencies:

    ```bash
    cd ecommerce-app
    npm install
    ```

3. Set up your PostgreSQL database (refer to the steps below for your database setup).

4. Update the database credentials in `config.js` or your relevant configuration file.

5. Run the app:

    ```bash
    npm start
    ```

6. Access the Swagger documentation at `http://localhost:3000/api-docs`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


