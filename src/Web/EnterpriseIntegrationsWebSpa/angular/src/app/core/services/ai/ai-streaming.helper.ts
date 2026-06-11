/**
 * Reads an SSE chat-completions stream and returns concatenated text deltas.
 * The parser expects `data:` lines and stops when it sees `[DONE]`.
 */
export async function readChatCompletionText(url: string, body: unknown): Promise<string> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    throw new Error('Failed to fetch chat summary stream.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk
      .split('\n')
      .filter((line) => line.trim().startsWith('data:'));

    for (const line of lines) {
      const jsonStr = line.replace(/^data:\s*/, '').trim();
      if (jsonStr === '[DONE]') {
        return accumulatedText.trim();
      }

      try {
        const data = JSON.parse(jsonStr);
        const delta = data?.choices?.[0]?.delta?.content;
        if (delta) {
          accumulatedText += delta;
        }
      } catch (e) {
        console.warn('Error parsing stream chunk:', e);
      }
    }
  }

  return accumulatedText.trim();
}
