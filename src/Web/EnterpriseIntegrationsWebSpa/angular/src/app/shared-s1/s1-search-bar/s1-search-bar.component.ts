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
  /**
   * Optional input filter mode. If not provided, no input restrictions are applied.
   * Supported modes: 'numeric' | 'decimal' | 'alpha' | 'alphanumeric' | 'emailchars' | 'alphanumerichyphen'
   * @default undefined (no restrictions)
   */
  @Input() inputFilter?: InputFilterMode;
  @Output() outputData = new EventEmitter<string>();

  declare height: string
  declare width: string;
  declare placeHolder: string;
    
  searchControl = new FormControl('', [Validators.required]);
  showClearButton: boolean = false;
  clearedManually = false;
  lastKeyPressed = '';

  ngOnInit(): void {
    // Initialize search bar with input data
    const inputData = this.inputData ?? ({ } as S1SearchBar);
    this.placeHolder = inputData.placeHolder ? inputData.placeHolder : 'Search';
    this.height = inputData.height ?? '100%';
    this.width = inputData.width ?? '100%';
    this.searchControl.setValue(inputData.searchText ?? '');
    
    // Monitor input changes to show/hide clear button
    this.searchControl.valueChanges.subscribe((val) => {
      const trimmed = val?.trim() ?? '';
      this.showClearButton = trimmed.length > 0;

      // Track manual clear: reset flag if user types again
      // Note: This only applies to delete key presses
      if (trimmed.length == 0 && this.isDeleteKey(this.lastKeyPressed)) {
        this.clearedManually = true;        
      }
    });
  }
  onKeyDown(event: KeyboardEvent) {
    // Track the last key pressed to detect manual clear operations
    this.lastKeyPressed = event.key;
  }
  
  /**
   * Check if the given key is a delete/clear operation key
   * @param key The keyboard key to check
   * @returns true if key is a delete/clear operation, false otherwise
   */
  isDeleteKey(key: string): boolean {
    return ['Backspace', 'Delete', 'Del', 'Clear', 'NumPadClear'].includes(key);
  }
  
  /**
   * Handle input keypress events, triggering search on Enter key
   * @param event The keyboard event
   */
  inputHandler(event: KeyboardEvent): void {        
    if (event.key == 'Enter') { 
      this.emitSearch();
    }
  }
  /**
   * Handle search button click
   */
  searchBtnClick() {
    this.emitSearch();    
  }
  
  /**
   * Clear the search input and emit empty string
   */
  clearInput(): void {
    this.searchControl.setValue('');
    this.showClearButton = false;  
    this.outputData.emit('');  
  }
  
  /**
   * Internal method to emit search value
   * Only emits if search value is non-empty, or if it was manually cleared
   */
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
