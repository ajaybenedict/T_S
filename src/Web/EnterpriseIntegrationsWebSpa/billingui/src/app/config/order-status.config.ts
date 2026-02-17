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

addStatuses(['1', '2', '6', '8'],  { imgURL: '/assets/progress_status.svg', key: 'progress' });
addStatuses(['3', '5', '10', '11'], { imgURL: '/assets/error_status.svg', key: 'error' });
addStatuses(['12', '14'], { imgURL: '/assets/created_status.svg', key: 'created' });
addStatuses(['15'], { imgURL: '/assets/completed_status.svg', key: 'completed' });
addStatuses(['13'], { imgURL: '/assets/cancelled_status.svg', key: 'cancelled' });
