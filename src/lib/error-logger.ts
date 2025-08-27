export const logDetailedError = (context: string, error: unknown, additionalInfo?: Record<string, any>) => {
  console.error(`ERROR in ${context}:`);
  if (error instanceof Error) {
    console.error(`Name: ${error.name}`);
    console.error(`Message: ${error.message}`);
    if (error.stack) {
      console.error(`Stack: ${error.stack}`);
    }
  } else {
    console.error(`Unknown error type: ${String(error)}`);
  }
  if (additionalInfo) {
    for (const key in additionalInfo) {
      console.error(`${key}: ${additionalInfo[key]}`);
    }
  }
  console.error('---'); // Separador para mayor claridad
};
