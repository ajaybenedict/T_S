import { cloudToolsSidePanelTabsConfig } from "src/app/core/config/cloud-tools.config";
import { CloudToolsSidePanelDetailsTabEnum } from "src/app/models/cloud-tools/cloud-tools.interface";
import { S1FilterButtons } from "src/app/models/s1/s1-filter-buttons.interface";

export class DetailsSidePanelHelper {
    static getTabs() {
        const data: { [key in CloudToolsSidePanelDetailsTabEnum]: S1FilterButtons } = {
            Details: {
                displayName: cloudToolsSidePanelTabsConfig[CloudToolsSidePanelDetailsTabEnum.Details].displayName,
                onClickEvent: cloudToolsSidePanelTabsConfig[CloudToolsSidePanelDetailsTabEnum.Details].onClickEvent,
                selected: false,
                type: 'filter',
            }
        };
        return data;
    }
}