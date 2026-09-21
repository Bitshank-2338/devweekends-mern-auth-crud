// Shows an error to the user instead of hiding it in the console.
export function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="alert alert-error" role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="alert-close" onClick={onDismiss} aria-label="Dismiss error">
          &times;
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
