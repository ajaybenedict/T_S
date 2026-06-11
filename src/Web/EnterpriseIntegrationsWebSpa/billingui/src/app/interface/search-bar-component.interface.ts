import { EventEmitter } from '@angular/core';

/**
 * Input data structure for S1SearchBarComponent
 */
export interface S1SearchBarInputData {
  placeHolder: string;
  width: string;
  searchText: string;
}

/**
 * S1SearchBarComponent instance interface
 * Describes the contract for the remote search bar component
 */
export interface S1SearchBarComponentInstance {
  inputData: S1SearchBarInputData;
  outputData: EventEmitter<string>;
}
