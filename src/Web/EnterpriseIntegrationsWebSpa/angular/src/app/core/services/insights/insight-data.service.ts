import { Injectable } from "@angular/core";
import { countryRegionRestrictionTabList, InsightReportName, RegionPermission, ReportCandidate } from "../../config/insight-dashboard.config";
import { models } from 'powerbi-client';
import { insightFilterConfig } from "../../config/insight-filter.config";
import { DataState } from "../data-state";

@Injectable({ providedIn: 'root' })

export class InsightDataService {

    constructor(
        private readonly dataState: DataState,
    ){}

    getRegionPermissions(permission: RegionPermission, table: string, regionColumnName: string | undefined, countryColumnName: string | undefined) {       
        const filters: models.ReportLevelFilters[] = [];

        if (this.canAddFilter(permission.Region, regionColumnName)) {
            filters.push(this.createFilter(table, regionColumnName!, permission.Region));
        }

        if (this.canAddFilter(permission.Country, countryColumnName)) {
            filters.push(this.createFilter(table, countryColumnName!, permission.Country));
        }

        return filters;
    }

    canAddFilter(values: string[], columnName: string | undefined): boolean {
        return !!columnName && values.length > 0 && !values.some(el => el.toLowerCase() === 'all');
    }

    createFilter(table: string, columnName: string, values: string[]): models.IBasicFilter {
        return {
            $schema: 'http://powerbi.com/product/schema#basic',
            target: {
                table,
                column: columnName,
            },
            operator: 'In',
            values,
            filterType: models.FilterType.Basic,
        };
    }

    resolvePageFilterConfig(
        reportName: InsightReportName,
        embedUrl: string
    ): { db?: string; region?: string; country?: string } {
        const config = insightFilterConfig[reportName];
        if (!config) return {};
        const pageName = this.extractPageName(embedUrl);        
        if ('PageConfig' in config && pageName && config.PageConfig[pageName]) {
            const pageCfg = config.PageConfig[pageName];
            return {
                db: pageCfg.Database,
                region: pageCfg.RegionColumn,
                country: pageCfg.CountryColumn
            };
        }
        if ('Database' in config) {
            return {
                db: config.Database,
                region: config.RegionColumn,
                country: config.CountryColumn
            };
        }
        return {};
    }

    extractPageName(url: string): string | null {
        const regex = /pageName=([^&]+)/;
        const match = regex.exec(url);
        return match ? decodeURIComponent(match[1]) : null;
    }

    private isTabUnderCountryRegionRestrictionList(candidate: ReportCandidate): boolean {
        if(!candidate.permissionKey) return false; // if candidate has no permissionkey, no logic required.
        return countryRegionRestrictionTabList.includes(candidate.permissionKey);
    }
    
    tabLevelCountryRegionCheck(candidate: ReportCandidate) {
        return (this.isTabUnderCountryRegionRestrictionList(candidate) && !this.dataState.hasCountryRegionAccess());
    }
}
