import { ExtractChartJsonObjectPipe } from './extract-chart-json';

describe('ExtractChartJsonObjectPipe', () => {
  let pipe: ExtractChartJsonObjectPipe;

  beforeEach(() => {
    pipe = new ExtractChartJsonObjectPipe();
  });

  it('should extract chart JSON object from fenced chartjson block', () => {
    const value = 'Intro text ```chartjson {"labels":["Jan","Feb"],"series":[10,20]} ``` outro text';

    const result = pipe.transform(value);

    expect(result).toEqual({ labels: ['Jan', 'Feb'], series: [10, 20] });
  });

  it('should return null when chartjson block is missing', () => {
    const value = 'No chart json in this message';

    const result = pipe.transform(value);

    expect(result).toBeNull();
  });

  it('should return null when chartjson block contains invalid JSON', () => {
    const value = '```chartjson {labels:["Jan","Feb"]} ```';

    const result = pipe.transform(value);

    expect(result).toBeNull();
  });
});
