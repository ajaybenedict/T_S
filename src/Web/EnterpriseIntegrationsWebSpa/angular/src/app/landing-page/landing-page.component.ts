import { Component, OnInit } from '@angular/core';
import { ppcCardList } from '../core/config/ppc-card.config';
import { PPCCardCategory, PPCCardData } from '../models/ppc-card.model';
import { LANDING_PAGE } from '../core/constants/constants';
import { DataState } from '../core/services/data-state';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationIdEnum, PermissionsEnum } from '../core/config/permissions.config';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {

  declare firstname: string;
  configList: PPCCardData[] = ppcCardList;
  enumCategory = PPCCardCategory;
  categories: string[] = Object.values(this.enumCategory);
  greetingText = LANDING_PAGE.WELCOME_TEXT;
  greetingDesc = LANDING_PAGE.WELCOME_CONTENT;

  /**
   * Controls visibility of the floating AI icon based on user permissions.
    * True if user has applicationId 1 (StreamOneHub) and permissionId 13
    * (AIAssistants). GlobalAdmin is handled by DataState.hasPermission.
   */
  showAIFloatingIcon = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly dataState: DataState,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to user observable to set firstname and check AI icon visibility
    this.dataState.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.firstname = user.firstName;
          // Check StreamOneHub access with AIAssistants.
          // GlobalAdmin access is already handled inside DataState.hasPermission.
          this.showAIFloatingIcon = this.dataState.hasPermission(
            [PermissionsEnum.AIAssistants],
            ApplicationIdEnum.StreamOneHub
          );
        } else {
          this.showAIFloatingIcon = false;
        }
      });

    // Subscribe to redirect URL and navigate automatically
    this.dataState.redirectUrl$
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => {
        if (url) {
          this.dataState.updateRedirectUrl(null);
          this.router.navigateByUrl(url);
        }
      });
  }
}
