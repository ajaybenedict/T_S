import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { InputFilterMode } from 'src/app/models/input-filter.model';
import { S1SearchBar } from 'src/app/models/s1/s1-search-bar.interface';

@Component({
  selector: 'app-s1-search-bar',
  templateUrl: './s1-search-bar.component.html',
  styleUrls: ['./s1-search-bar.component.css'],
  standalone: false,
})
export class S1SearchBarComponent implements OnInit {
  
  @Input() declare inputData: S1SearchBar;
  @Input() inputFilter: InputFilterMode = 'alphanumeric';
  @Output() outputData = new EventEmitter<string>();

  declare height: string
  declare width: string;
  declare placeHolder: string;
    
  searchControl = new FormControl('', [Validators.required]);
  showClearButton: boolean = false;
  clearedManually = false;
  lastKeyPressed = '';

  ngOnInit(): void {
    this.placeHolder = this.inputData.placeHolder ? this.inputData.placeHolder : 'Search';
    this.height = this.inputData.height ?? '100%';
    this.width = this.inputData.width ?? '100%';
    this.searchControl.setValue(this.inputData.searchText ?? '');
    // Show or hide clear button
    this.searchControl.valueChanges.subscribe((val) => {
      const trimmed = val?.trim() ?? '';
      this.showClearButton = trimmed.length > 0;

      // Reset clearedOnce if user types again
      if (trimmed.length == 0 && this.isDeleteKey(this.lastKeyPressed)) {
        this.clearedManually = true;        
      }
    });
  }
  onKeyDown(event: KeyboardEvent) {
    this.lastKeyPressed = event.key;
  }
  isDeleteKey(key: string): boolean {
    return ['Backspace', 'Delete', 'Del', 'Clear', 'NumPadClear'].includes(key);
  }
  inputHandler(event: KeyboardEvent): void {        
    if (event.key == 'Enter') { 
      this.emitSearch();
    }
  }
  searchBtnClick() {
    this.emitSearch();    
  }
  clearInput(): void {
    this.searchControl.setValue('');
    this.showClearButton = false;  
    this.outputData.emit('');  
  }
  private emitSearch(): void {
    const value = this.searchControl.value?.trim() ?? '';
    if (value.length > 0) {
       this.emitValue(value);
    } else if (this.clearedManually) {
      this.emitValue(value);      
    } else {
      console.info('Search skipped: empty and not cleared manually again');
    }
  }

  private emitValue(value: string) {
    this.outputData.emit(value);
    this.clearedManually = false;
  }
}
