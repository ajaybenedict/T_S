import { CloudToolType } from "../core/config/cloud-tools.config";
import { CloudToolsStatusIdEnum, TransactionDetails } from "../models/cloud-tools/cloud-tools.interface";
import { CSVColumn } from "../models/s1/s1-csv.interface";
import { CloudToolsCSVFactory } from "./CloudToolsCSVFactory";


export class CloudToolsCSVBuilder {

  static build(tool: CloudToolType, tab: CloudToolsStatusIdEnum, parent: { id: string; taskName: string; }, outputMessage: string): CSVColumn<TransactionDetails>[] {

    const columns: CSVColumn<TransactionDetails>[] = [
      ...CloudToolsCSVFactory.common(parent),
      ...this.toolColumns(tool, outputMessage),
    ];

    if (tab === CloudToolsStatusIdEnum.Failed) {
      columns.push(...CloudToolsCSVFactory.error());
    }

    if (tab === CloudToolsStatusIdEnum.Success) {
      columns.push(...CloudToolsCSVFactory.success());
    }

    return columns;
  }

  private static toolColumns(tool: CloudToolType, outputMessage: string): CSVColumn<TransactionDetails>[] {

    switch (tool) {
      case CloudToolType.EST:
        return CloudToolsCSVFactory.est();

      case CloudToolType.SandboxCleanup:
        return CloudToolsCSVFactory.sandbox(outputMessage);

      case CloudToolType.PCRCleanup:
        return CloudToolsCSVFactory.pcr(outputMessage);

      default:
        return this.throwError(tool);
    }
  }

  private static throwError(value: never): never {
    throw new Error(`Unhandled CloudToolType: ${value}`);
  }

}
