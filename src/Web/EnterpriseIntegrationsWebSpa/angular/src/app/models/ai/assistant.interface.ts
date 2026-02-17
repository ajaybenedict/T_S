import { Observable } from "rxjs";
import { AIMessageRoleType } from "./thread-message.interface";

// ToolFunctionParameterProperties
export interface ToolFunctionParameterProperties {
  sqlQuery: {
    type: string;
    description: string;
  };
}

// ToolFunctionPrameter
export interface ToolFunctionParameters {
    type: string;
    properties: ToolFunctionParameterProperties;    
    required: string[];
}

// Tool Function
export interface ToolFunction {
  name: string;
  description: string;
  parameters: ToolFunctionParameters;
}

// Tool Object
export interface Tool {
  type: string;
  function: ToolFunction;
}

// Individual Prompt
export interface Prompt {
  prompt: string;
}

// Prompt Group 
export interface PromptGroup {
  id: string;
  name: string;
  prompts: Prompt[];
}

// Full API Response 
export interface Assistant {
  id: number;
  assistantId: string;
  name: string;
  createdAt: number; // UNIX timestamp
  model: string;
  instructions: string;

  // These two are originally JSON strings. Parse them before mapping to this interface.
  tools: Tool[];
  prompts: PromptGroup[];

  apiSource: string;
  icon: string;
  description: string;
  cardDescription: string;

  isDisabled: boolean | null;
  waitingMessage: string | null;

  sortOrder: number;
  initialWelcomeText: string;
}

export interface AssistantInLocalStorage {
  assistantId: number;
  threadId?: string;
  showPrompts?: boolean;
}

// Interface for the tool call inside the streaming response
export interface ToolCallFunction {
  name: string;
  arguments: string; // Raw JSON string; will need parsing before use
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: ToolCallFunction;
}

// Streaming response chunk from OpenAI
export interface ToolCallDelta {
  tool_calls?: ToolCall[];
  content?: string;
}

export interface ToolCallDeltaChoice {
  delta?: ToolCallDelta;
}

export interface ToolCallDeltaChunk {
  choices: ToolCallDeltaChoice[];
}

export interface ToolFunctionArguments {
  sqlQuery: string;
}

export interface AssistantComponent {
  outputComponent: any;
  compInputs: {
    apiDataService: any;
    assistantService: any;
    configuration: any;
    dataSource: any;
    pagination?: any;
    function: string;
    arguments: any;
    threadId?: string;
    messageId: string;
  };
  compOutputs: any;
}

export interface AssistantMessage {
  id: string;
  role: AIMessageRoleType;
  content: MessageContent[];
  isSubmitEnabled?: boolean;
  showLoader?: Observable<boolean>;
  tool_calls?: ToolCall[];
  openAiResult?: Observable<string>;
  tool_call_id?: string;
  childStreamingData?: string;
  // Added for processAiMessage
  isData?: boolean;
  components?: AssistantComponent[];
}

export interface ToolFunctionOutput {
  function: string;
  arguments: any;
  data: any[];
  isError?: boolean;
  pagination?: any;
}

export interface MessageContent {
  text: { value: string | null };
  response?: string; // Used when no data or error occurs
}