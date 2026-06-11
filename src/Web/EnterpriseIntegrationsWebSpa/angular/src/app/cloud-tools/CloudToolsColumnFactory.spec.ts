import { CloudToolsColumnFactory } from './CloudToolsColumnFactory';

describe('CloudToolsColumnFactory', () => {
  it('should pass through enableEllipsisTooltip from column config', () => {
    const column = CloudToolsColumnFactory.buildColumn(
      {
        id: 10,
        key: 'outputMessage',
        name: 'Output',
        enableEllipsisTooltip: true,
        formatter: () => '<span>Message</span>',
      },
      true,
    );

    expect(column.enableEllipsisTooltip).toBeTrue();
  });

  it('should enable ellipsis tooltip for error message column', () => {
    const column = CloudToolsColumnFactory.errorMessageColumn(true);

    expect(column.columnKey).toBe('errorMessage');
    expect(column.enableEllipsisTooltip).toBeTrue();
  });

  it('should enable ellipsis tooltip for error details column', () => {
    const column = CloudToolsColumnFactory.errorDetailsColumn(true);

    expect(column.columnKey).toBe('errorDetails');
    expect(column.enableEllipsisTooltip).toBeTrue();
  });
});
