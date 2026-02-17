import { Component, OnInit } from '@angular/core';
import { ppcCardList } from '../core/config/ppc-card.config';
import { PPCCardCategory, PPCCardData } from '../models/ppc-card.model';
import { LANDING_PAGE } from '../core/constants/constants';
import { DataState } from '../core/services/data-state';
import { Router } from '@angular/router';

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

  constructor(
    private readonly dataState: DataState,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const storedName = localStorage.getItem('firstName');
    this.firstname = storedName ?? '';

    // Subscribe to redirect URL and navigate automatically
    this.dataState.redirectUrl$.subscribe(url => {
      if (url) {
        this.dataState.updateRedirectUrl(null);
        this.router.navigateByUrl(url);
      }
    });
  }
}
