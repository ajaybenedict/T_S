import { Injectable } from "@angular/core";
import { RegionPermission, ReportCandidate } from "../../config/insight-dashboard.config";
import { models } from 'powerbi-client';
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
        // Use vendor-provided schema constant to avoid hardcoding while keeping Power BI compatibility.
        return {
            $schema: models.BasicFilter.schemaUrl,
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
        candidate: ReportCandidate
    ): { db?: string|string[]; region?: string; country?: string } {
        const config = candidate.filterConfig;
            return {
                db: config?.Database,
                region: config?.RegionColumn,
                country: config?.CountryColumn
            };
    }
}
