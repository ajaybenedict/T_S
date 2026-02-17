export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  placement?: 'center' | 'above' | 'below';
  width?: number;
  height?: number;
  confirmCallback?: () => void;
}