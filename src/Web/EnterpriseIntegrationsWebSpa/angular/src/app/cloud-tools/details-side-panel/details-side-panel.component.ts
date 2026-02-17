import { Component, Inject, OnInit } from '@angular/core';
import { CloudToolsPanelContent, CloudToolsSidePanelDetailsTabEnum } from 'src/app/models/cloud-tools/cloud-tools.interface';
import { S1FilterButtons } from 'src/app/models/s1/s1-filter-buttons.interface';
import { DetailsSidePanelHelper } from './details-side-panel.helper';
import { cloudToolsSidePanelTabsConfig } from 'src/app/core/config/cloud-tools.config';
import { SidePanelRef } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.ref';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.tokens';

interface PanelData {
  readonly panelContent: CloudToolsPanelContent[];
  readonly title: string;
}

@Component({
  selector: 'app-details-side-panel',
  templateUrl: './details-side-panel.component.html',
  styleUrls: ['./details-side-panel.component.css']
})
export class DetailsSidePanelComponent implements OnInit {

  constructor(
    @Inject(SIDE_PANEL_DATA) public readonly data: PanelData,
    @Inject(SIDE_PANEL_REF) private readonly panelRef: SidePanelRef<PanelData>
  ) { }

  // Variables used in template
  selectedTab!: string;
  tabs: { [key in CloudToolsSidePanelDetailsTabEnum]: S1FilterButtons} = DetailsSidePanelHelper.getTabs();
  tabList!: S1FilterButtons[];

  // configs
  tabConfigData = cloudToolsSidePanelTabsConfig;
  tabEnum = CloudToolsSidePanelDetailsTabEnum;

  ngOnInit(): void {
    if(this.data) {
      this.setSelectedTab(this.tabEnum.Details);
      this.initTabs();
    }
  }

  initTabs() {
    this.tabList = Object.values(this.tabs);
  }

  setSelectedTab(data: CloudToolsSidePanelDetailsTabEnum) {
    this.selectedTab = this.tabConfigData[data].onClickEvent;
    this.tabs[data].selected = true;
  }

  closeHandler() {
    if(this.panelRef) this.panelRef.close();
  }

  btnContainerClickEventHandler(btn: S1FilterButtons | string): void {
    if (this.isValidFilterButton(btn)) {
      this.selectedTab = btn.onClickEvent!;
    }
  }

  private isValidFilterButton(btn: S1FilterButtons | string): btn is S1FilterButtons & { onClickEvent: string } {
    return typeof btn === 'object' && typeof btn.onClickEvent === 'string';
  }
}
