import { NgModule } from '@angular/core';
import { ChatLayoutComponent } from './chat-layout/chat-layout.component';
import { SharedModule } from '../shared/shared.module';
import { SharedS1Module } from '../shared-s1/shared-s1.module';
import { MaterialPPCModule } from '../material/material-ppc.module';
import { MarkdownModule } from 'ngx-markdown';
import { DynamicModule } from 'ng-dynamic-component';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { ThreadComponent } from './thread/thread.component';
import { ThreadContainerComponent } from './thread-container/thread-container.component';
import { ChatInputComponent } from './chat-input/chat-input.component';


const modules = [
  SharedModule,
  SharedS1Module,
  MaterialPPCModule,
  MarkdownModule.forRoot(),
  DynamicModule,
];

const components = [  
  ChatLayoutComponent,
  ChatMessageComponent,
    ThreadComponent,
    ThreadContainerComponent,
    ChatInputComponent, 
];

@NgModule({
  declarations: [
    ...components,
  ],
  
  imports: [
    ...modules,    
  ]
})
export class AiModule { }
