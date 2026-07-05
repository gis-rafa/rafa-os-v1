import { toast } from "sonner";

export function handleClientError(error: unknown, context: string = "An unexpected error occurred") {
  console.error(context, error);

  let errorMessage = "Something went wrong.";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  toast.error(context, {
    description: errorMessage,
  });
}

export function handleServerError(error: unknown, context: string = "An unexpected server error occurred") {
  console.error(context, error);

  let errorMessage = "Something went wrong on the server.";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  // For server errors, we might not want to expose raw error messages to the client
  // but rather a generic message, or log it more extensively.
  // For now, we'll use toast as a client-side indicator.
  toast.error(context, {
    description: errorMessage,
  });
}
