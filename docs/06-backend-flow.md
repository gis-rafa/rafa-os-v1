# Backend Flow Documentation

## 1. API Endpoints

### `/api/chat`
- **Method:** `POST`
- **Description:** Handles chat requests, sending prompts to the OpenAI API and streaming responses back to the client.
- **Request Flow:**
  - The client sends a `POST` request to `/api/chat` with a JSON body containing a `prompt`.
  - The server extracts the `prompt` from the request body.
  - **Validation:**
    - Checks if `OPENAI_API_KEY` is set in the environment. If not, returns a `500` error.
    - Checks if the `prompt` is provided and not empty. If not, returns a `400` error.
  - **AI Interactions:**
    - Initializes an OpenAI client with the API key.
    - Creates a stream to the OpenAI `responses` endpoint with the provided `prompt` and `model`.
  - **Response Flow:**
    - Streams the OpenAI API responses back to the client.
    - The `Content-Type` header is set to `text/plain; charset=utf-8`.
    - `Cache-Control` is set to `no-cache`.
  - **Error Handling:**
    - Catches errors from the OpenAI API (e.g., `response.output_text.delta`, `error`, `response.failed`).
    - Encodes and enqueues error messages into the response stream.
    - Generic `try-catch` block for unexpected errors during stream processing.

## 2. Server Actions

- Server actions are implemented in `src/app/**/actions.ts` files (e.g., `src/app/brain/actions.ts`). These files contain functions that handle server-side logic triggered by client-side interactions, such as form submissions or button clicks.

### `src/app/brain/actions.ts`
- **Description:** Handles actions related to the Master Brain document, such as saving its content.
- **Functions:**
  - `saveMasterBrain(content: string)`: Saves the provided content to the Master Brain.

### `src/app/notifications/actions.ts`
- **Description:** Handles actions related to user notifications, including fetching, marking as read, and deleting notifications.
- **Functions:**
  - `createNotification(userId: string, data: { type: NotificationType; title: string; message: string; })`: Creates a new notification for a given user.
  - `getNotifications()`: Fetches all notifications for the current user.
  - `markNotificationRead(formData: FormData)`: Marks a specific notification as read.
  - `markAllNotificationsRead()`: Marks all notifications for the current user as read.
  - `deleteNotification(formData: FormData)`: Deletes a specific notification.

## 3. Authentication Flow

- The current `/api/chat` endpoint relies on an `OPENAI_API_KEY` being present in the server's environment variables for authentication with the OpenAI API. There is no explicit user authentication implemented at this API layer.

## 4. Validation

- **API Endpoint (`/api/chat`):**
  - Presence of `OPENAI_API_KEY`.
  - Presence and non-emptiness of the `prompt` in the request body.

## 5. Database Interactions

- The `/api/chat` endpoint does not directly interact with any database. Its primary function is to proxy requests to the OpenAI API.

## 6. AI Interactions

- The `/api/chat` endpoint heavily relies on interactions with the OpenAI API:
  - Initializes `OpenAI` client with `OPENAI_API_KEY`.
  - Calls `client.responses.create` to send the user's `prompt` to the configured `OPENAI_MODEL`.
  - Streams responses from OpenAI back to the client.

## 7. Error Handling

- **API Endpoint (`/api/chat`):**
  - Missing `OPENAI_API_KEY` results in a `500` HTTP response.
  - Missing `prompt` results in a `400` HTTP response.
  - OpenAI API errors (e.g., `response.output_text.delta`, `error`, `response.failed`) are caught and their messages are streamed back to the client.
  - A general `try-catch` block handles unexpected errors during the streaming process.