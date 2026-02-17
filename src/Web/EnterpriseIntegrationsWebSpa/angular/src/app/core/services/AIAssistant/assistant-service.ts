import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { JsonHelper } from './json-helper';
import { DataState } from '../data-state';
import { API_PATH_PPC, API_V1 } from '../../constants/constants';

@Injectable({
  providedIn: 'root'
})
export class AssistantService {

  private openApiBaseUrl = '';
  private apiBaseUrl = `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/assistant`;

  public assistanId: any = "1";
  public threadId: any = undefined;
  public toolsOutputId = "";
  public runResponse: any = {};
  public runId = "";
  public userThreads: any = {};
  public userId = "";
  public showPrompts: boolean = true;
  public isIon = false;
  constructor(private http: HttpClient, private dataState: DataState) {
    this.setIsIon();        
  }



  getAssistant(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/${this.assistanId}`, { headers: this.addCommonHeaders() }).pipe(map((response: any) => {
      if (response.prompts && response.prompts != "" && JsonHelper.isValidJSON(response.prompts)) {
        response.prompts = JSON.parse(response.prompts);
      } else
        response.prompts = [];

      if (response.tools && response.tools != "" && JsonHelper.isValidJSON(response.tools)) {
        response.tools = JSON.parse(response.tools);
      }


      if (!response.model || response.model == "") {
        response.model = "gpt-4o-2024-11-20";
      }
      
      return response;
    }
    ), catchError(this.handleError));;
  }

  createThread(metadata: any): Observable<any> {
    let apiUrl = `${this.apiBaseUrl}/${this.assistanId}/threads/`
    return this.http.post<any>(`${apiUrl}`, metadata, { headers: this.addCommonHeaders() })
      .pipe(map((response:any) => {
        return response;
      }
      ), catchError(this.handleError));

  }
  updateThread(thread: any): Observable<any> {
    let apiUrl = `${this.apiBaseUrl}/${this.assistanId}/threads/${this.threadId}`;
    return this.http.put<any>(`${apiUrl}`, thread)
      .pipe(map((response: any) => {
        return response;
      }
      ));

  }
  saveThreadMessage(threadMessage: any): Observable<any> {
    let apiUrl = `${this.apiBaseUrl}/threads/messages`;
 
    return this.http.post<any>(`${apiUrl}`, threadMessage)
      .pipe(map((response: any) => {
        return response;
      }
      ));

  }

  getThreadMessages(): Observable<any> {

    return this.http.get(`${this.apiBaseUrl}/${this.assistanId}/threads/${this.threadId}/messages`).pipe(map((response: any) => {
      return response;
    }
    ), catchError(this.handleError));
    ;
  }

  getThreadById(threadId: any): Observable<any> {
    this.threadId = threadId;

    let apiUrl = `${this.apiBaseUrl}/${this.assistanId}/threads/${this.threadId}`;
    
    return this.http.get(`${apiUrl}`).pipe(map(response => {
      return response;
    }
    ), catchError(this.handleError));
;
  }

  deleteThreadById(threadId: any): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/threads/${threadId}`).pipe(map(response => {
      return response;
    }
    ), catchError(this.handleError));
    ;
  }

  getUserThreads(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/${this.assistanId}/threads`, { headers: this.addCommonHeaders() }).pipe(map(response => {
     
      return response;
    }
    ), catchError(this.handleError));;
  }

  createMessage( messageContent: string, role: string = 'user'): Observable<any> {
    const body: any = {
      "role": role,
      "content": messageContent
    };
    let apiUrl = `${this.apiBaseUrl}/${this.assistanId}/threads/${this.threadId}/messages`;

    return this.http.post(`${apiUrl}`, body);
  }

  getAllMessagesForThread(): Observable<any> {

    let apiUrl = `${this.apiBaseUrl}/${this.assistanId}/threads/${this.threadId}/messages`;    
    return this.http.get(`${apiUrl}`);
  }

  setThreadInStorage() {
    let assistants: any[] = [];

    // Check if localStorage contains the "assistants" item and parse it if it's not null
    const storedAssistants = localStorage.getItem("assistants");
    if (storedAssistants) {
      assistants = JSON.parse(storedAssistants);
    }

    let assistant = assistants.find((x: any) => x.assistantId == this.assistanId);

    if (this.threadId)
      assistant.threadId = this.threadId;
    else if (assistant?.threadId)
      this.threadId = assistant.threadId;

    localStorage.setItem("assistants", JSON.stringify(assistants));

    return assistant;
  }
  setAssistantInStorage() {
    let assistants: any[] = [];

    // Check if localStorage contains the "assistants" item and parse it if it's not null
    const storedAssistants = localStorage.getItem("assistants");
    if (storedAssistants) {
      assistants = JSON.parse(storedAssistants);
    }

    let assistant: any;

    if (this.assistanId) {
      assistant = assistants.find((x: any) => x.assistantId == this.assistanId);

      if (!assistant) {
        // Create a new assistant object if it doesn't exist
        assistant = { assistantId: this.assistanId };
        assistants.push(assistant);
      }

      // Assign the value of assistant.showPrompts to this.showPrompts if it's not null
      if (assistant.showPrompts != null) {
        this.showPrompts = assistant.showPrompts;
      }
    }

    // Store the updated assistants array in localStorage
    localStorage.setItem("assistants", JSON.stringify(assistants));

    return assistant;
  }

  savePromptToggle() {
    let assistants: any[] = [];

    // Check if localStorage contains the "assistants" item and parse it if it's not null
    const storedAssistants = localStorage.getItem("assistants");
    if (storedAssistants) {
      assistants = JSON.parse(storedAssistants);
    }

    let assistant: any = assistants.find((x: any) => x.assistantId == this.assistanId);

    if (assistant) {
      // Update the showPrompts property in the assistant object
      assistant.showPrompts = this.showPrompts;
    }

    // Store the updated assistants array in localStorage
    localStorage.setItem("assistants", JSON.stringify(assistants));
  }


  public addCommonHeaders(headers?: HttpHeaders): HttpHeaders {
    headers = new HttpHeaders();
    return headers;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = JSON.stringify(error);
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }


  private generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }



   sendMessageToOpenAi(messages: any[], model: any, tools: any = [], systemMessage: string): Observable<any> {
    let openAiMessages: any = [];

    // Push system message with the datetime included
    openAiMessages.push({
      "role": "system",
      "content": systemMessage
    });

    // Add user and assistant messages
    messages.forEach((item: any) => {
      openAiMessages.push({
        "role": item.role,
        "content": item.content.response
      });
    });

    // Prepare the body for the API request
    const body = {
      model: model,  // Use the provided model
      messages: openAiMessages,
      tools: tools,
      tool_choice: 'auto'
    };

    // Send request
    let apiUrl = `${this.openApiBaseUrl}/chat/completions`;
    return this.http.post(`${apiUrl}`, body);
  }


  getOpenAiMessages(messages: any[], systemMessage: string): any {
    let openAiMessages: any = [];

    // Get current datetime and format it as a string
    const currentDateTime = new Date().toISOString(); // ISO 8601 format

    // Modify the systemMessage to include the current datetime
    systemMessage = `${systemMessage} Impt! The current datetime is: ${currentDateTime}. You can use the current date and time if user asks questions which include data retrievals based on relative dates like last year, today, etc.`;
       openAiMessages.push({
      "role": "system",
      "content": systemMessage
    });


    messages.forEach((item: any, index: number) => {
      let content = item.content[0].text.value;
      let message: any = {
        "role": item.role,
        "content": content
      }

      if (item.tool_calls)
        message.tool_calls = item.tool_calls

      if (item.tool_call_id)
        message.tool_call_id = item.tool_call_id

      openAiMessages.push(message);
    })

    return openAiMessages;
  }

  getOauthToken(): Observable<any> {
    const apiUrl = `${this.apiBaseUrl}/GetToken`;
    
    return this.http.get<any>(apiUrl)
      .pipe(
        map((response:any) => {
          return response.accessToken;
        }),
        catchError(this.handleError)
      );
  }

  setIsIon() {
    if (this.assistanId == 'asst_pfeJc8dTC4O2FsD6GhpcjHH3' || this.assistanId == 'asst_0yeESUiA8vHOuAt4K9wVdeu1' || this.assistanId == "asst_Ch8CEc5m1Gy7aeSeRmc9Qr6f")
      this.isIon = true

  }

 

}
