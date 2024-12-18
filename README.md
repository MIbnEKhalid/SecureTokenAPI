# RestApi
## Overview

This project is a REST API built using Express.js. It provides a mechanism to validate domains, hash tokens, and fetch tokens based on platform and type. The API also includes middleware for logging requests and a simple in-memory caching mechanism.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/MIbnEKhalid/RestApi
    ```
2. Navigate to the project directory:
    ```sh
    cd RestApi
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```

## Configuration

Create a `.env` file in the root directory and add the following environment variables or upload to vercel environment var if using public repo:
```env
Auth_TOKEN1=your_auth_token1
Auth_TOKEN2=your_auth_token2
Auth_TOKEN3=your_auth_token3
GITHUB_READ_REPO_TOKEN=your_github_read_repo_token
GITHUB_FULL_ACCESS_TOKEN=your_github_full_access_token
NETLIFY_READ_LOGS_TOKEN=your_netlify_read_logs_token
NETLIFY_FULL_ACCESS_TOKEN=your_netlify_full_access_token
VERCEL_DEPLOY_ACCESS_TOKEN=your_vercel_deploy_access_token
VERCEL_FULL_ACCESS_TOKEN=your_vercel_full_access_token
```

## Usage

Start the server:
```sh
npm start
```

The server will run on `http://localhost:3800`.

## API Endpoints

### Fetch Tokens

- **URL:** `/api`
- **Method:** `GET`
- **Query Parameters:**
  - `token` (required): The platform key (e.g., `github`, `netlify`, `vercel`).
  - `type` (required): The type of token (e.g., `read_repo`, `full_access`).

- **Example Request:**
    ```sh
    curl "http://localhost:3800/api?token=github&type=read_repo"
    ```

- **Response:**
    ```json
    {
        "token": "hashed_token_value"
    }
    ```

## Middleware

- **Domain Validation:** Ensures that requests come from allowed domains.
- **Request Logging:** Logs each request with a timestamp.
- **Caching:** Caches token responses to improve performance.

## License

This project is licensed under the MIT License.