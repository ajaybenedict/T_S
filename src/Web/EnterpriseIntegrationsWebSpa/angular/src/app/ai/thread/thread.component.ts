import { Component, inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { catchError, of, switchMap, tap } from 'rxjs';
import { THREAD_NAME_MAX_CHAR, THREAD_NAME_MIN_CHAR } from 'src/app/core/constants/constants';
import { AIDataService } from 'src/app/core/services/ai/ai-data.service';
import { AIThreadService } from 'src/app/core/services/ai/ai-thread.service';
import { ThreadResponse } from 'src/app/models/ai/thread.interface';
import { DialogType, PPCDialogData } from 'src/app/models/ppc-dialog-data.model';
import { S1Menu } from 'src/app/models/s1/s1-menu.interface';
import { PpcDialogComponent } from 'src/app/shared/ppc-dialog/ppc-dialog.component';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.css']
})
export class ThreadComponent implements OnInit {

  @Input() threadData!: ThreadResponse;
  declare menuData: S1Menu;
  menuClicked = false;
  editThread = false;
  threadSummary!: string;
  assistantId = this.aiDataSVC.getAssistantId();
  showLoader = false;

  readonly dialog = inject(MatDialog);
  declare dialogRef: MatDialogRef<PpcDialogComponent>;

  ngOnInit(): void {
    this.menuClicked = false;
    this.initMenu();
  }

  constructor(
    private readonly threadSVC: AIThreadService,
    private readonly aiDataSVC: AIDataService,    
  ){}

  initMenu() {
    this.menuData = {
      hasIcon: true,
      hasName: false,
      iconURL: '/assets/thread_more_icon_24_24.svg',
      displayName: 'More',
      subMenu: [
        {
          hasIcon: true,
          iconURL: '/assets/thread_edit_icon_24_24.svg',
          hasName: true,
          displayName: 'Rename',
          onClickEmit: 'Rename',
        },
        {
          hasIcon: true,
          iconURL: '/assets/thread_delete_icon_24_24.svg',
          hasName: true,
          displayName: 'Delete',
          onClickEmit: 'Delete',
        }
      ],
    };
  }

  menuOpenedHandler(event: boolean) {    
    if(event) {
      this.menuClicked = true;
    }
  }

  menuClosedHandler(event: boolean) {    
    if(event) {
      this.menuClicked = false;
    }
  }

  menuClickHandler(event: string) {      
    if(event == 'Rename') {
      this.editThread = true;
      this.threadSummary = this.threadData.summary;
    } else {
      this.openDialog('Confirmation', this.threadData.summary);
    }
  }

  threadClickHandler() {    
    this.aiDataSVC.setThreadId(this.threadData.id);
    this.aiDataSVC.setThreadClicked(true); // set to load the thread's messages
  }

  renameThread() {
    // logic to check summary
    if (!this.assistantId) {
      console.log('RenameThread: AssistantId not defined!');
      this.editThread = false;
      return;
    }
    if(this.threadSummary.length < THREAD_NAME_MIN_CHAR || this.threadSummary.length > THREAD_NAME_MAX_CHAR) {
      console.log(`Thread name validation fails! Min Char - ${THREAD_NAME_MIN_CHAR} & Max Char - ${THREAD_NAME_MAX_CHAR}`);  
      this.editThread = false;    
      return;
    }
    this.threadData.summary = this.threadSummary;
    this.showLoader = true;
    this.threadSVC.renameThread({assistantId: this.assistantId.toString(), threadId: this.threadData.id, name: this.threadSummary}).pipe(
      tap((res) => {
        console.log(`ThreadId - ${this.threadData.id} renamed to ${this.threadSummary}`);
        this.editThread = false;
        this.threadSummary = '';
      }),
      switchMap(() => this.getUserThreads()),
      catchError((err) => {
        console.log(`Error in RenameThread API - ${err}`);
        this.editThread = false;
        this.threadSummary = '';
        return of(null);
      }),      
    ).subscribe({
      next: res => this.showLoader = false,
      complete: () => this.showLoader = false,
    });
  }

  deleteThread() {
    if(!this.assistantId){
      console.log('DeleteThread: AssistantId not defined!');
      return;
    }
    this.threadSVC.deleteThread(this.assistantId, this.threadData.id).subscribe({
      next: res => {
        if(res.isSuccess) {
          this.aiDataSVC.setDeletedThread(this.threadData.id);
          this.aiDataSVC.setThreadDeleted(true);
        }
      },
      error: err => {
        console.log(`Error in deleteThread API - ${err}`);
      }
    });
  }

  getUserThreads() {
    if(!this.assistantId) {
      return of(null);
    }
    this.aiDataSVC.setUserThreads([]);
    return this.threadSVC.getAllThreads(this.assistantId).pipe(
      tap(res => {
        if (res?.length) {
          this.aiDataSVC.setUserThreads(res);
        }
      }),
      catchError(err => {
        console.log(`getUserThreads: There is an error getting UserThreads - ${err}`);
        return of(null);
      }),
    );
  }

  getFirstThreeWords(summary: string): string {
    return summary.split(' ').slice(0, 4).join(' ') + '...';
  }

  checkForEnter(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.renameThread();
    }
  }

  openDialog(type: DialogType, name: string) {
    this.closeDialog();
    let dialogData: { width: string, height: string, data: PPCDialogData };
    let data: PPCDialogData = {
      type,
      header: 'Delete Chat',
      content: `This will delete <span class='ppc-bold-txt'>${name}</span> chat permanently.`,
      primaryBtnAction: 'Delete',
      secondaryBtnAction: 'Cancel',
      primaryBtnName: 'Delete',
      secondaryBtnName: 'Cancel',
    }
    dialogData = {
      width: '480px',
      height: '240px',
      data,
    };
    this.dialogRef = this.dialog.open(PpcDialogComponent, { ...dialogData, disableClose: false });
    this.dialogRef.afterClosed().subscribe(res => {
      if (res) {
        if(res == 'Delete') {
          this.deleteThread();
        }
      }
    });
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
