import { readChatCompletionText } from './ai-streaming.helper';

describe('readChatCompletionText', () => {
  function createMockReader(chunks: string[]) {
    const encodedChunks = chunks.map((chunk) => new TextEncoder().encode(chunk));
    let index = 0;

    return {
      read: jasmine.createSpy('read').and.callFake(async () => {
        if (index < encodedChunks.length) {
          return { done: false, value: encodedChunks[index++] };
        }
        return { done: true, value: undefined };
      })
    };
  }

  function mockFetchWithChunks(chunks: string[], ok = true) {
    const reader = createMockReader(chunks);
    const response = {
      ok,
      body: ok
        ? {
            getReader: () => reader
          }
        : null
    } as unknown as Response;

    spyOn(globalThis as any, 'fetch').and.returnValue(Promise.resolve(response));
    return reader;
  }

  it('should parse concatenated text deltas and stop on [DONE]', async () => {
    mockFetchWithChunks([
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      'data: [DONE]\n\n',
      'data: {"choices":[{"delta":{"content":" ignored"}}]}\n\n',
    ]);

    const result = await readChatCompletionText('/chat', { stream: true });

    expect(result).toBe('Hello world');
    expect((globalThis as any).fetch).toHaveBeenCalled();
  });

  it('should ignore malformed JSON chunks and continue parsing', async () => {
    spyOn(console, 'warn');
    mockFetchWithChunks([
      'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n',
      'data: {bad json}\n\n',
      'data: {"choices":[{"delta":{"content":" there"}}]}\n\n',
      'data: [DONE]\n\n',
    ]);

    const result = await readChatCompletionText('/chat', { stream: true });

    expect(result).toBe('Hi there');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should throw when response is not OK or body is missing', async () => {
    mockFetchWithChunks([], false);

    await expectAsync(readChatCompletionText('/chat', { stream: true }))
      .toBeRejectedWithError('Failed to fetch chat summary stream.');
  });
});
