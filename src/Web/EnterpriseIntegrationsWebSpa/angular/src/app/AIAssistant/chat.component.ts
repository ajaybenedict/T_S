import { Component, OnInit, ElementRef, ViewChild, NgZone, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { filter, finalize, interval, map, Observable, of, Subscriber, Subscription } from 'rxjs';
import { AssistantService } from '../core/services/AIAssistant/assistant-service';
import { JsonHelper } from '../core/services/AIAssistant/json-helper';
import { ApiDataFactory } from '../core/services/AIAssistant/api-data-factory-service';
import { ApiDataService } from '../core/services/AIAssistant/api-data-service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../environments/environment.int';
import { HostListener } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { DataState } from '../core/services/data-state';
/*import { MathJaxService } from '../service/maths-jax.service';*/

declare var bootstrap: any; // Declare bootstrap to use its JS
interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',  
  styleUrls: ['./chat.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(100%)'
      })),
      transition('void <=> *', animate(500)),
    ]),
  ]
})
export class ChatComponent implements OnInit {
  @ViewChild('apiKeyModal') apiKeyModal!: ElementRef; // ViewChild to reference the modal

  title = 'web';
  message: any = "";
  runSubscription: Subscription | undefined;
  startTime: number = 0;
  messages: any = [];
  outputComponent: any;
  compInputs: any;
  showLoader: boolean = false;
  systemMessage: any;
  private isAlive = true; // Flag to control the execution within ngOnDestroy
  editingThreadId: string | null = null;
  tempSummary: string = ''; // Temporary storage for the editable summary
  private apiKeyModalInstance: any;
  assistant: any;
  isListening = false;
  recognition: any;
  lastInterimText = ''
  loggedUsername = "";
  phoneWidth = 1050
  isSidebarToggled = false;
  isPhoneScreen: boolean = window.innerWidth < this.phoneWidth; // Example breakpoint for phones
  assistantStorage: any;
  showAllPrompts = false;
  convertToProperCase = JsonHelper.convertToProperCase;
  messageId: any = "";
  AIInstructionsComponent: any;
  inactivityTimeout: any;
  inactivityDuration: number = 30000; // 30 seconds
  selectedFunction: number = 0;
  user: any;
  isFunctionEvaluated = false;
  threadMessages: any;
  showMore: boolean = false;
  promptsLength: any = 20;
  asstMessage: any;
  openAiResult = of('');
  private prefix = (window.location.href.includes('localhost')) ? "" : "/core-ppc";
  private apiBaseUrl = `${this.dataState.getBaseUrl()}${this.prefix}/api/v1/assistant`;
  localMessages: any;
  localAsstMsg: any;
  assistantSelectionId: any = "";
  constructor(public assistantService: AssistantService, public apiDataFactory: ApiDataFactory, private route: ActivatedRoute,private zone: NgZone
    ,  private cdr: ChangeDetectorRef
    , private dialog: MatDialog
    , public apiDataService: ApiDataService
    , private router: Router
    , private dataState: DataState
  ) {

    this.apiBaseUrl = JsonHelper.getCoreUrl(this.apiBaseUrl);

    const { webkitSpeechRecognition }: IWindow = <IWindow><unknown>window;
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = true; // Enable interim results

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.message += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Use NgZone to ensure the view updates
      this.zone.run(() => {
        // Replace the last interim text with the new interim text
        this.message = this.message.replace(this.lastInterimText, '') + interimTranscript;
        this.lastInterimText = interimTranscript; // Update the last interim text
      });

      // Reset the inactivity timer on receiving voice input
      this.resetInactivityTimer();
    };


  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isPhoneScreen = window.innerWidth < this.phoneWidth; // Adjust 768px as per your breakpoint

  }

  async ngOnInit() {

    this.resetInactivityTimer();
    const storedState = localStorage.getItem('sb|sidebar-toggle');

    this.assistantService.assistanId = this.route.snapshot.paramMap.get('id');
    if(!this.assistantService.assistanId || this.assistantService.assistanId == "") 
      this.assistantService.assistanId = "3";

    this.assistantService.threadId = null; //impt reset threadId;

    this.getDefaultAssistant();


    this.assistantStorage = this.assistantService.setAssistantInStorage();
    this.assistant = await this.assistantService.getAssistant().toPromise();


    if (!this.assistant) {


      this.systemMessage = "No Assistant Found!";
    }

    if (this.assistantStorage.threadId) {
      this.assistantService.setThreadInStorage();
      await this.getUserThreads();
    }
    else
      await this.createThread();

    this.apiDataService = this.apiDataFactory.getApiDataService(this.assistantService.assistanId);
    if (!this.apiDataService)
      return;


    let prompts = this.apiDataService.prompts.showPrompts;
    this.assistantService.showPrompts = this.apiDataService.prompts.showPrompts;


    if (this.isPhoneScreen)
      this.assistantService.showPrompts = false; //always hide on smaller screens

    this.assistantService.setIsIon();
    if (this.assistantService.isIon && (this.assistantService.assistanId == "asst_pfeJc8dTC4O2FsD6GhpcjHH3" || this.assistantService.assistanId == "asst_Ch8CEc5m1Gy7aeSeRmc9Qr6f")) {
      
      this.apiDataService.ionApiKey = await this.assistantService.getOauthToken().toPromise();      

    }

    await this.getThreadMessages();

  }

  getDefaultAssistant() {
    // Check if the assistantId is already set in the service
    if (!this.assistantService.assistanId) {
      const storedDefaultAssistant = localStorage.getItem("defaultAssistant");

      // If "defaultAssistant" exists in localStorage, assign it; otherwise, use a fallback value
      if (storedDefaultAssistant) {
        this.assistantService.assistanId = storedDefaultAssistant;
      } else {
        this.assistantService.assistanId = "asst_AqfjH10iI70oSLJUdqRYJRTk";
      }
    }

    // Store or update the default assistant ID in localStorage
    localStorage.setItem("defaultAssistant", this.assistantService.assistanId);
  }


  async getUserThreads() {

    this.assistantService.userThreads = await this.assistantService.getUserThreads().toPromise().catch(error => {
      this.systemMessage = `There is an error ${error}`
      return;
    });

  }
  ngAfterViewInit(): void {
    this.apiKeyModalInstance = new bootstrap.Modal(this.apiKeyModal.nativeElement, {
      keyboard: false
    });
    
  }
  async createThread(defaultMessage: any = null) {
  
    this.setToggleBar();
    this.assistantService.threadId = null;
    this.messages = null;
    let resp: any = await this.assistantService.createThread({}).toPromise();
    this.assistantService.threadId = resp.id;
    await this.getUserThreads();
    this.assistantService.setThreadInStorage();


    if (defaultMessage) {
      this.message = defaultMessage;
      this.submitMessage()
    }
  }

  setToggleBar() {
    
    if (this.isPhoneScreen) {
      this.isSidebarToggled = false;
      document.body.classList.remove('sb-sidenav-toggled');
      localStorage.setItem('sb|sidebar-toggle', String(this.isSidebarToggled));
    }
  }


  submitMessage() {    
    if (!this.message || this.message == "")
      return;

    if (!this.validateRequest())
      return;
    
    this.scrollToBottom();
    this.systemMessage = null;
    this.showLoader = true;
    this.isFunctionEvaluated = false;
    this.messages = this.messages || [];
    this.asstMessage = { id: this.generateGUID(), role: "user", content: [{ text: { value: this.message } }], isSubmitEnabled: false }
    this.messages.push(this.asstMessage);

    this.assistantService.createMessage(this.message, "user").subscribe((respMessage: any) => {
    });   

    this.message = "";
    this.asstMessage = { id: this.generateGUID(),  role: "assistant", content: [{ text: { value: "" } }] }
    this.messages.push(this.asstMessage);
    this.asstMessage.showLoader = of(true);
    this.cdr.detectChanges();
    this.resetTextAreaHeight();
    this.localMessages = JSON.parse(JSON.stringify(this.messages));
    this.localAsstMsg = JSON.parse(JSON.stringify(this.asstMessage));
    this.doSendRequestToAi();

  }

  validateRequest():boolean {
      return true;

  }

  doSendRequestToAi() {
    let aimessages = this.assistantService.getOpenAiMessages(this.localMessages, this.assistant.instructions);
    const requestData = {
      model: "gpt-4o",
          messages: aimessages,
          tools: this.assistant.tools,
          max_tokens: 4000,
          n: 1,
          temperature: 0.2,
          stream: true,
          tool_choice: 'auto',
          "parallel_tool_calls": false
        }
    this.asstMessage.openAiResult = of('')
    let jsonString: any = "";
    let parsed: any = null;
    this.asstMessage.openAiResult = new Observable<string>((observer: any) => {
      const subscription =  this.doOpenAICall(requestData).subscribe({
        next: (chunk: any) => {

          if (!this.apiDataService.isInlineAnalysis && this.isFunctionEvaluated) {
            observer.next(this.apiDataService.displayTitle);
            try {
              this.localAsstMsg.childStreamingData = this.apiDataService.displayTitle;
              this.saveLastMessage();
              observer.complete();
            } catch { }
          }

          if (!chunk)
            return;

          const newUpdates = chunk
                  .replace('data: [DONE]', '')
                  .split('data: ')
            .filter(Boolean);
          const newUpdatesParsed: string[] = newUpdates.map((update: any) => {
            try {
              try {
                jsonString = jsonString + update;
                parsed = JSON.parse(jsonString);
                jsonString = "";
              } catch (e) {
                parsed = null;
                return;
              }
              if (parsed && parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.tool_calls) {

                if (!this.localAsstMsg.tool_calls) {
                  this.localAsstMsg.tool_calls = parsed.choices[0].delta.tool_calls; // Get initial tool calls
                }
                else if (this.localAsstMsg.tool_calls && parsed.choices[0].delta.tool_calls[0].function && parsed.choices[0].delta.tool_calls[0].function.arguments) {
                  this.localAsstMsg.tool_calls[0].function.arguments += parsed.choices[0].delta.tool_calls[0].function.arguments;

                }
                return null;
              } else if (parsed && parsed.choices && parsed.choices[0].delta) {
                return parsed.choices[0].delta?.content || '';
              } else {
                return null;
              }
            } catch (e) {
              return "";
            }
          });


          this.localAsstMsg.childStreamingData = this.localAsstMsg.childStreamingData || "";
          this.localAsstMsg.childStreamingData += newUpdatesParsed.join(''); // Store all content

          const filteredContent = JsonHelper.removeJsonObject(this.localAsstMsg.childStreamingData);

          observer.next(filteredContent); // Emit each chunk for real-time updates

        },
        error: (err: any) => {
          console.error('Error occurred:', err);
          observer.error(err);
          this.asstMessage.showLoader = of(false);;
          this.showLoader = false;
        },
        complete: () => {
          if (this.localAsstMsg.tool_calls && this.localAsstMsg.tool_calls.length > 0) {
          let toolOutputs = []
          let functions: any = [];

              
            var tool_calls = JSON.parse(JSON.stringify(this.localAsstMsg.tool_calls));
          for (const toolOutput of tool_calls) {


              let functionName = toolOutput.function.name;
              let argumentParams = {};
            if (toolOutput.function.arguments)
              try {
                console.log(toolOutput.function.arguments);
                argumentParams = JSON.parse(toolOutput.function.arguments);
                
              } catch (e) {
                this.systemMessage = "Something went wrong. Try again with a different prompt. Unable to parse the query returned as JSON"
                this.showLoader = false;
                return;
              }


            this.apiDataService.getApiData(functionName, argumentParams, null).subscribe((dataResp) => {
              let func: any = {};
              try {
                  func = {
                    "function": functionName,
                    "arguments": argumentParams,
                    "data": dataResp.data,
                    "isError": dataResp.isError,
                    "error": dataResp.error,
                    "pagination": dataResp.pagination
                  }
                    if (func.data && !func.isError)
                      this.isFunctionEvaluated = true
                } catch (e) {
                    func = {
                    "function": functionName,
                    "arguments": argumentParams,
                    "data": dataResp.data,
                    "isError": true,
                    "error": "Something went wrong.. "+ e,
                    "pagination": dataResp.pagination
                  }
                }

                functions.push(func);

                this.processAiMessage(this.asstMessage, functions);
                    
                this.localAsstMsg.content[0].text.value = null //for tool_calls
                this.localMessages.push(JSON.parse(JSON.stringify(this.localAsstMsg)));
                this.localAsstMsg.content[0].text.value = "```json" + JSON.stringify(functions) + "```"
                this.asstMessage.content[0].text.value = this.localAsstMsg.content[0].text.value;

                this.localAsstMsg.tool_calls = null;//don't need tool_calls anymore
                this.localAsstMsg.role = "tool"
                this.localAsstMsg.tool_call_id = toolOutput.id;
                this.localMessages.push(JSON.parse(JSON.stringify(this.localAsstMsg)));
                this.doSendRequestToAi();


              })
            }
          }
          else if (this.localAsstMsg.childStreamingData != "") {
            this.saveLastMessage();
          }
          observer.complete();
        }
      });
      return () => subscription.unsubscribe();
    }).pipe(
      filter((result:any) => !result.startsWith('```chartjson')) // Filter out any chunk starting with "```chartjson"
    );
  

  }

  saveLastMessage() {
    this.asstMessage.content[0].text.value = this.localAsstMsg.childStreamingData + " " + this.asstMessage.content[0].text.value
    this.asstMessage.showLoader = of(false);
    this.showLoader = false;
    this.assistantService.createMessage(this.asstMessage.content[0].text.value, "assistant").subscribe((message: any) => {     
      
    })
  }
  doOpenAICall(data: any): Observable<string> {
    return new Observable<string>((observer:any) => {
      const url = `${this.apiBaseUrl}/chat-completions`;

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include' // Ensures cookies are sent with the request

      }).then(response => {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');

        const readStream = () => {
          reader?.read().then(({ done, value }) => {
            if (done) {
              observer.next();
              observer.complete();
              return;
            }

            const chunk = decoder.decode(value, { stream: true });

            observer.next(chunk); // Emit each chunk for real-time updates

            readStream();  // Continue reading
          }).catch(err => observer.error(err));
        };

        readStream();
      }).catch(err => observer.error(err));

      // Cleanup
      return () => {
        observer.complete();
      };
    });
  }

  stopTimer(): void {
    if (this.runSubscription) {
      this.runSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }


  getThreadMessages() {
    this.messages = this.messages || [];//impt else n threadclick messages are null
    this.assistantService.getAllMessagesForThread().subscribe((resp:any) => {
      resp.data = resp.data.reverse();
      for (const item of resp.data) {        
        let outputData = JsonHelper.extractJsonObject(item.content[0].text.value, "```json");
        this.processAiMessage(item, outputData);
        this.messages.push(item);
      }

    }) 
  }

  processAiMessage(item: any, outputData: any) {
    item.components = [];
    if (item.role == "assistant" ) {  
        if (outputData) {
          if (outputData) {
            item.isData = false;
            let isData = false;
            let isError = false
            outputData.forEach((func: any, index: number) => {
              if (func.data && func.data.length > 0) {
                isData = true;
                item.isData = true;
                let displayEntity: any = this.apiDataService.getDisplayComponent(func.function, func.arguments);
                if (displayEntity) {
                  let component: any = {};
                  component.outputComponent = displayEntity.displayComponent;
                  component.compInputs = { apiDataService: this.apiDataService, assistantService: this.assistantService };
                  component.compInputs.configuration = displayEntity.configuration;
                  component.compInputs.dataSource = func.data;
                  component.compInputs.pagination = func.pagination;
                  component.compInputs.function = func.function;
                  component.compInputs.arguments = func.arguments;
                  component.compInputs.threadId = this.assistantService.threadId;
                  component.compInputs.messageId = item.id;
                  item.components.push(component);
                }
              }

              if (func.isError && func.isError == true)
                isError = true;
            });

            if (!isData && !isError) {
              item.content.response = "Your prompt did not returning any results. Please try a different prompt.";
              
            }
            else if (!isData && isError) {
              item.content.response = "There was an error processing your request.";
              
            }

          }
        }
      this.messageId = item.id;
    }

  }
   
  setKey() {    
    localStorage.setItem("ionApiKey", this.apiDataService.ionApiKey);
    this.apiKeyModalInstance.hide(); // Hide the modal
  }
    

  async onThreadClick(threadId: any) {
    this.showLoader = true;
    await this.assistantService.getThreadById(threadId).toPromise().catch(error => {
      this.showLoader = false;
    });
    this.assistantService.setThreadInStorage();
    this.messages = null;
    await this.getThreadMessages();
    this.showLoader = false;
    this.setToggleBar();

  }

  deleteThread(threadId: string): void {
    this.assistantService.userThreads = this.assistantService.userThreads.filter((thread: any) => thread.id !== threadId);

    this.assistantService.deleteThreadById(threadId).subscribe(resp => {
    });

  }

  startEditing(threadId: string, summary: string): void {
    this.editingThreadId = threadId;
    this.tempSummary = summary;
  }

  saveEdit(threadId: string): void {
    const updatedThread = this.assistantService.userThreads.find((thread: any) => thread.id === threadId);
    if (!updatedThread) return; // Guard clause if thread not found

    updatedThread.summary = this.tempSummary;

    this.assistantService.updateThread(updatedThread)
      .subscribe((resp:any) => {
      });

    this.editingThreadId = null; // Stop editing after initiating the request

  }
  adjustTextareaHeight(event: any): void {
    const textarea: HTMLTextAreaElement = event.target;
    textarea.style.height = 'auto'; // Reset height to recalculate
    textarea.style.height = `${textarea.scrollHeight}px`; // Set new height
  }

  resetTextAreaHeight() {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto'; // Or 'auto' if you want it to shrink to its default height
      // If you have a specific minimum height in mind, set it here instead of 'auto'
      //textarea.style.height = '60px'; // Example: reset to a specific minimum height
    }
  }
  cancelEdit(): void {
    this.editingThreadId = null;
  }

  checkForEnter(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent default Enter behavior (new line)
      this.submitMessage(); // Call your submit function
    }
  }

  toggleListening(): void {
    this.isListening = !this.isListening;
    if (this.isListening) {
      this.startListening(); // Start listening if not already listening
    } else {
      this.stopListening(); // Stop listening if currently listening
      this.lastInterimText = ''; // Clear interim text when stopped
    }
  }

  startListening(): void {
    try {
      this.recognition.start();
      this.resetInactivityTimer(); // Reset the timer when listening starts
    } catch (err) {
      console.error('Error starting speech recognition:', err);
    }
  }

  stopListening(): void {
    this.recognition.stop();
    this.clearInactivityTimer(); // Clear the timer when listening stops
  }

  resetInactivityTimer(): void {
    this.clearInactivityTimer();
    this.inactivityTimeout = setTimeout(() => {
      this.stopListening();
      this.isListening = false; // Disable the voice icon
      this.cdr.detectChanges(); // Update the view
    }, this.inactivityDuration);
  }

  clearInactivityTimer(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
  }


  toggleSidebar() {
    this.isSidebarToggled = !this.isSidebarToggled;
    document.body.classList.toggle('sb-sidenav-toggled', this.isSidebarToggled);
    localStorage.setItem('sb|sidebar-toggle', String(this.isSidebarToggled));
  }

  toggleShowAllPrompts(): void {
    this.showAllPrompts = !this.showAllPrompts;
  }

  togglePrompts() {
    this.assistantService.showPrompts = !this.assistantService.showPrompts;
    this.assistantService.savePromptToggle();
  }

  getLimitedPrompts(prompts: any[]): any[] {
    if (this.showMore) {
      return prompts;
    }
    return prompts.slice(0, this.apiDataService.prompts.defaultPromptsNo);
  }

  toggleShowMore(event: Event): void {
    event.preventDefault();
    this.showMore = !this.showMore;
  }
  scrollToBottom(): void {
    window.scrollTo(0, document.body.scrollHeight);  // Scrolls to the bottom
  }


  loadPrompt(prompt:any) {
    if (!this.showLoader) {
      this.message = prompt;
      this.submitMessage();
    } else {
      alert("There is already a messaged being processed. Let that finish first")
    }
  }


  selectFunction(index: number): void {
    this.selectedFunction = index;
  }

  private generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  getFirstThreeWords(summary: string): string {
    return summary.split(' ').slice(0, 4).join(' ') + '...';
  }


  reloadPageWithNewRoute(): void {
    this.router.navigateByUrl(`/assistant/${this.assistantService.assistanId}`).then(() => {
      window.location.reload();
    });
  }
}
