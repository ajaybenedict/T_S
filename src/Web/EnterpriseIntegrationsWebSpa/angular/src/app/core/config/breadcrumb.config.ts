import { S1Breadcrumb } from "src/app/models/s1/s1-breadcrumb.interface";
import { APP_ROUTE_CONFIG_URL, INSIGHT_DASHBOARD_ROUTE } from "../constants/constants";

export const breadcrumbConfig: S1Breadcrumb[] = [
    {
        navigationURL: `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL}`,
        displayValue: 'Revenue Dashboard',
    },
];