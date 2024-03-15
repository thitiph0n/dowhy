interface SendMessageRequest {
  webhookUrl: string;
  message: string;
}

export async function sendMessageToDiscord(request: SendMessageRequest) {
  await fetch(request.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: request.message,
    }),
  });
}
