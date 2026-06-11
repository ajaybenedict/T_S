export interface OrderStatus {
  imgURL: string;
  key: string;
}

export const OrderStatusMap: Record<string, OrderStatus> = {};

function addStatuses(statusCodes: string[], status: OrderStatus) {
  statusCodes.forEach(code => {
    OrderStatusMap[code] = status;
  });
}

addStatuses(['1', '2', '6', '8'],  { imgURL: '/assets/cbc/progress_status.svg', key: 'progress' });
addStatuses(['3', '5', '10', '11'], { imgURL: '/assets/cbc/error_status.svg', key: 'error' });
addStatuses(['12', '14'], { imgURL: '/assets/cbc/created_status.svg', key: 'created' });
addStatuses(['15'], { imgURL: '/assets/cbc/completed_status.svg', key: 'completed' });
addStatuses(['13'], { imgURL: '/assets/cbc/cancelled_status.svg', key: 'cancelled' });
