export const resolvedReasonConfig = [
  'Fraud',
  'Ignore',
  'Legitimate',
  'None',
];

export const eventStatusConfig = [
  'Active',
  'Resolved'
];

export const BulkUpdateEventStatusConfig = [
  'Investigating',
  'Resolved'
];

/**
 * Mapping of display column names to API field names for fraud events
 */
export const FRAUD_EVENT_COLUMN_MAPPING: Record<string, string> = {
  'Global Region': 'region',
  'Country': 'country',
  'Event Status': 'eventStatus',
  'Customer': 'customer',
  'Reseller': 'reseller',
  'Event Type': 'eventType',
  'Confidence Level': 'confidenceLevel',
  'Severity': 'severity',
  'Platform': 'pac',
  'eventTime': 'eventTime',
};