export class JsonHelper {

  public static isValidJSON(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  }
  public static isJsonArray(jsonString: string): boolean {
  try {
    const parsedJson = JSON.parse(jsonString);
    return Array.isArray(parsedJson);
  } catch (error) {
    console.error('Invalid JSON string:', error);
    return false;
  }
}
  public static filterArrayFirstLevelFields(arr: any[]): any[] {
    return arr.map(obj => this.filterFirstLevelFields(obj));
  }

  public static filterFirstLevelFields(obj: any): any {
    let result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if the property is not an object, or is null (to include null values)
      if (typeof value !== 'object' || value === null) {
        result[key] = value;
      }
    }
    return result;
  }

  public static getArray(response: any) {
    if (response && !Array.isArray(response)) {
      let data = []
      data.push(response);
      return data
    }
    else
      return response;
  }

  public static extractJson(input: string): any {
    // Define the regular expression to match the JSON block
    const regex = /```json\n([\s\S]*?)\n```/;

    // Attempt to find a match in the input string
    const match = input.match(regex);

    // Check if a match was found
    if (match && match[1]) {
      // Attempt to parse the matched string as JSON
      try {
        const json = JSON.parse(match[1]);
        return json;
      } catch (error) {
        //  console.error('Failed to parse JSON:', error);
        return null;
      }
    } else {
      // console.log('No JSON found in the input string.');
      return null;
    }
  }

  public static extractMarkDown(input: string): any {
    // Define the regular expression to match the JSON block
    const regex = /```markdown\n([\s\S]*?)\n```/;

    // Attempt to find a match in the input string
    const match = input.match(regex);

    return match;
  }

  public static extractAndReplace(input: string): string {
    const markerIndex = input.indexOf('```json');
    let extracted = input.substring(0, markerIndex);
    extracted = extracted.replace(/`/g, '');
    return extracted;
  }

  public static joinJsonArrayWithSeparator(jsonArray: string, separator: string): string {
  // Parse the JSON string into an array
  const urls: string[] = JSON.parse(jsonArray);

  // Join the array elements with the separator
  return urls.join(separator);
  }

  public static convertToProperCase(input: string): string {
    // Step 1: Replace underscores with spaces and trim any leading/trailing spaces
    let result = input.replace(/_/g, ' ').trim();

    // Step 2: Insert a space before all caps in camelCase and PascalCase (except the first character)
    result = result.replace(/([A-Z])/g, ' $1').trim();

    // Step 3: Ensure that the first character is uppercase
    result = result.charAt(0).toUpperCase() + result.slice(1);

    // Step 4: Capitalize the first letter of each word
    result = result.toLowerCase().replace(/\b(\w)/g, (char) => char.toUpperCase());

    return result;
  }
  /**
     * Removes specified fields from each object in a JSON array.
     * @param jsonArray The JSON array to process.
     * @param fieldsToRemove An array of strings representing the field names to remove.
     * @returns A new JSON array with the specified fields removed from each object.
     */
  public static removeFields(jsonArray: any[], fieldsToRemove: string[], truncateStrings: boolean = true): any[] {
    return jsonArray.map(item => {
      const newItem = { ...item };
      // Remove specified fields, null value fields, and truncate strings if needed
      Object.keys(newItem).forEach(field => {
        if (fieldsToRemove.includes(field) ||
          newItem[field] === null ||
          field.endsWith("id") ||
          field.includes("photos")) {
          delete newItem[field];
        } else if (truncateStrings && typeof newItem[field] === 'string' && newItem[field].length > 100) {
          newItem[field] = newItem[field].substring(0, 100);
        }
      });
      return newItem;
    });
  }


  /**
   * Includes only specified fields from each object in a JSON array.
   * @param jsonArray The JSON array to process.
   * @param fieldsToInclude An array of strings representing the field names to include.
   * @returns A new JSON array with only the specified fields in each object.
   */
  static includeFields(jsonArray: any[], fieldsToInclude: string[], truncateStrings: boolean = true): any[] {
    return jsonArray.map(item => {
      const newItem: { [key: string]: any } = {};
      fieldsToInclude.forEach(field => {
        if (item.hasOwnProperty(field) && item[field] !== null) {
          if (truncateStrings && typeof item[field] === 'string' && item[field].length > 200) {
            newItem[field] = item[field].substring(0, 200);
          } else {
            newItem[field] = item[field];
          }
        }
      });
      return newItem;
    });
  }

  static takeFirstN(jsonArray: any[], n: number): any[] {
    return jsonArray.slice(0, n);
  }

  static substringField(field: string, n: number) {

    if(field)
    field = field.substring(0, n);
      
    return field;
  }

  static extractJsonObjects(text: string): any[] {
    const jsonObjects: any[] = [];
    const regex = /```(json|chartjson)\s([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const jsonString = match[2].trim();
      try {
        jsonObjects.push(JSON.parse(jsonString));
      } catch (e) {
        console.error("Failed to parse JSON object:", e);
      }
    }

    return jsonObjects;
  }

  static extractJsonObject(text: string, startToken: string): any {
    // Find the start of the JSON object based on the provided startToken
    const jsonStart = text.indexOf(startToken);

    if (jsonStart !== -1) {
      // Find the end of the JSON object, marked by the first occurrence of ```
      const jsonEnd = text.indexOf('```', jsonStart + startToken.length);

      if (jsonEnd !== -1) {
        // Extract the JSON string between the startToken and end token
        const jsonString = text.substring(jsonStart + startToken.length, jsonEnd).trim();
        //console.log(jsonString);
        try {
          // Attempt to parse and return the JSON object
          return JSON.parse(jsonString);
        } catch (e) {
          console.error("Failed to parse JSON object:", e);
          return null;
        }
      }
    }

    // Return null if no valid JSON object is found
    return null;
  }

  static replaceJsonObject(text: string, startToken: string, newJson: string): string {
    // Find the start of the JSON object based on the provided startToken
    const jsonStart = text.indexOf(startToken);

    if (jsonStart !== -1) {
      // Find the end of the JSON object, marked by the first occurrence of ```
      const jsonEnd = text.indexOf('```', jsonStart + startToken.length);

      if (jsonEnd !== -1) {
        // Extract the part of the text before the JSON object
        const beforeJson = text.substring(0, jsonStart + startToken.length);

        // Extract the part of the text after the JSON object
        const afterJson = text.substring(jsonEnd);

        // Combine the parts with the new JSON string
        return beforeJson + '\n' + newJson + '\n' + afterJson;
      }
    }

    // Return the original text if no valid JSON object is found
    return text;
  }


  static removeJsonObject(text: string): string {
    // Determine the starting point of either ```json or ```chartjson
    const jsonStart = text.indexOf('```json');
    const chartJsonStart = text.indexOf('```chartjson');

    // Select the earliest occurrence of either ```json or ```chartjson
    const start = (jsonStart !== -1 && (chartJsonStart === -1 || jsonStart < chartJsonStart))
      ? jsonStart
      : chartJsonStart;

    if (start !== -1) {
      // Extract the part before the JSON object
      const beforeJson = text.substring(0, start).trim();
      // Return only the part before the JSON object, effectively removing the rest
      return beforeJson;
    }

    // If no start marker is found, return the original text
    return text;
  }



  static sortJsonArray<T>(dataArray: T[], fieldName: keyof T, fieldType: 'date' | 'string' | 'number', sortOrder: 'ascending' | 'descending'): T[] {
    try {
      return dataArray.sort((a, b) => {
        let valueA: any = a[fieldName];
        let valueB: any = b[fieldName];

        if (fieldType === 'date') {
          valueA = new Date(valueA as unknown as string);
          valueB = new Date(valueB as unknown as string);
        }

        if (sortOrder === 'ascending') {
          if (valueA < valueB) return -1;
          if (valueA > valueB) return 1;
        } else if (sortOrder === 'descending') {
          if (valueA > valueB) return -1;
          if (valueA < valueB) return 1;
        }

        return 0;
      });
    } catch (error) {
      // Return the original array in case of any error
      return dataArray;
    }
  }

  static getCoreUrl(url: string): string {
    // Extract the environment from the URL
    const match = url.match(/https:\/\/(int|uat|prod)/);
    if (match) {
      const env = match[1];
      // Add '-svc' for 'int' and 'uat' environments
      if (env === 'int' || env === 'uat') {
        return url.replace(`https://${env}`, `https://${env}-svc`);
      }
      // Handle 'prod' environment separately
      if (env === 'prod') {
        return 'https://prod-svc.tdsynnex.com';
      }
    }
    // Return the original URL if no modification is needed
    return url;
  }
}
