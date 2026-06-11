import { ChatMessageComponent } from './chat-message.component';

describe('ChatMessageComponent', () => {
  let component: ChatMessageComponent;

  beforeEach(() => {
    component = new ChatMessageComponent(
      {} as any,
      {} as any,
      { detectChanges: () => { } } as any,
      {} as any,
      { getCoreBaseUrl: () => 'http://localhost' } as any,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate RFC4122 v4 uuid values for message ids', () => {
    const guid = (component as any).generateGUID() as string;

    expect(guid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('should generate unique ids across consecutive calls', () => {
    const firstGuid = (component as any).generateGUID() as string;
    const secondGuid = (component as any).generateGUID() as string;

    expect(firstGuid).not.toBe(secondGuid);
  });

  it('should concatenate content deltas from valid stream updates', () => {
    (component as any).localAsstMsg = {};
    (component as any).partialJson = '';

    const chunk = [
      'data: {"choices":[{"delta":{"content":"Hello "}}]}',
      'data: {"choices":[{"delta":{"content":"World"}}]}'
    ].join('\n\n');

    const result = (component as any).parseAndUpdateToolCalls(chunk) as string;

    expect(result).toBe('Hello World');
    expect((component as any).partialJson).toBe('');
  });

  it('should assemble tool call arguments across multiple deltas', () => {
    (component as any).localAsstMsg = {};
    (component as any).partialJson = '';

    const firstToolChunk =
      'data: {"choices":[{"delta":{"tool_calls":[{"id":"call_1","type":"function","function":{"name":"lookup","arguments":"{\\"city\\":\\"Sin"}}]}}]}';
    const secondToolChunk =
      'data: {"choices":[{"delta":{"tool_calls":[{"function":{"arguments":"gapore\\"}"}}]}}]}';

    (component as any).parseAndUpdateToolCalls(firstToolChunk);
    (component as any).parseAndUpdateToolCalls(secondToolChunk);

    expect((component as any).localAsstMsg.tool_calls[0].function.arguments).toBe('{"city":"Singapore"}');
  });

  it('should keep partial JSON until the next chunk completes it', () => {
    (component as any).localAsstMsg = {};
    (component as any).partialJson = '';

    const firstPartial = 'data: {"choices":[{"delta":{"content":"Hel';
    const secondPartial = 'data: lo"}}]}';

    const firstResult = (component as any).parseAndUpdateToolCalls(firstPartial) as string;
    const secondResult = (component as any).parseAndUpdateToolCalls(secondPartial) as string;

    expect(firstResult).toBe('');
    expect(secondResult).toBe('Hello');
    expect((component as any).partialJson).toBe('');
  });

  it('should stop processing orchestrated frames on completed event', () => {
    const observer = {
      next: jasmine.createSpy('next'),
      complete: jasmine.createSpy('complete'),
      error: jasmine.createSpy('error')
    };
    const buffer = 'event: completed\ndata: {"message":"done"}\n\n';

    const parsed = (component as any).processOrchestratedFrames(buffer, '', observer);

    expect(parsed.shouldStop).toBeTrue();
    expect(observer.next).toHaveBeenCalledOnceWith('done');
    expect(observer.complete).toHaveBeenCalled();
    expect(observer.error).not.toHaveBeenCalled();
  });
});
