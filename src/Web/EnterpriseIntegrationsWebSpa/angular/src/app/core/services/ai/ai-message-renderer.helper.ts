import { DisplayEntity } from 'src/app/AIAssistant/models/display-entity';
import { IonDataDiscoveryApiDataService } from 'src/app/core/services/AIAssistant/ion-data-discovery.service';
import { AIDataService } from 'src/app/core/services/ai/ai-data.service';
import { AssistantMessage, ToolFunctionOutput } from 'src/app/models/ai/assistant.interface';

/**
 * Shared renderer for AI tool outputs.
 * Keeps the output-component mapping behavior identical across chat layout and message components.
 */
export function processAssistantToolOutputs(
  item: AssistantMessage,
  outputData: ToolFunctionOutput[],
  apiDataSVC: IonDataDiscoveryApiDataService,
  aiDataSVC: AIDataService,
  threadId?: string,
): void {
  item.components = [];

  if (item.role !== 'assistant' || !outputData) return;

  let isData = false;
  let isError = false;

  outputData.forEach((func: ToolFunctionOutput) => {
    const hasData = Array.isArray(func.data) && func.data.length > 0;
    if (hasData) {
      isData = true;
      item.isData = true;

      const displayEntity: DisplayEntity | null =
        apiDataSVC.getDisplayComponent(func.function, func.arguments);

      if (displayEntity) {
        const component = {
          outputComponent: displayEntity.displayComponent,
          compInputs: {
            apiDataService: apiDataSVC,
            assistantService: aiDataSVC,
            configuration: displayEntity.configuration,
            dataSource: func.data,
            pagination: func.pagination,
            function: func.function,
            arguments: func.arguments,
            threadId,
            messageId: item.id,
          },
          compOutputs: null,
        };
        item.components?.push(component);
      }
    }

    if (func.isError) isError = true;
  });

  if (!isData) {
    item.content[0].response = isError
      ? 'There was an error processing your request.'
      : 'Your prompt did not return any results. Please try a different prompt.';
  }
}
