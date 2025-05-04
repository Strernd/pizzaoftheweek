import { parse } from "csv-parse/sync";
import _ from "lodash";
const yeastData = `
Temp,"0,01%","0,02%","0,03%","0,05%","0,08%","0,10%","0,13%","0,15%","0,18%","0,20%","0,30%","0,40%","0,50%","0,60%","0,70%","0,80%",1%
35,,,,,,,,,,,167,136,115,101,90,82,70
36,,,,,,,,,,,149,121,103,90,80,73,62
37,,,,,,,,,,,133,108,92,80,72,65,55
38,,,,,,,,,,161,120,97,82,72,65,59,50
39,,,,,,,,,159,145,108,87,74,65,58,53,45
40,,,,,,,,161,144,130,97,79,67,59,52,48,40
41,,,,,,,166,145,130,118,88,71,61,53,47,43,37
42,,,,,,,151,132,118,107,80,65,55,48,43,39,33
43,,,,,,161,137,120,107,97,72,59,50,44,39,35,30
44,,,,,,147,125,109,98,88,66,53,45,40,36,32,27
45,,,,,165,134,114,100,89,81,60,49,41,36,32,29,25
46,,,,,151,122,104,91,81,74,55,45,38,33,30,27,23
47,,,,,138,112,95,83,74,67,50,41,35,30,27,25,21
48,,,,,126,102,87,76,68,62,46,37,32,28,25,23,19
49,,,,156,116,94,80,70,63,57,42,34,29,26,23,21,18
50,,,,143,107,86,74,64,58,52,39,32,27,23,21,19,16
51,,,,132,98,80,68,59,53,48,36,29,25,22,19,18,15
52,,,,122,90,73,62,55,49,44,33,27,23,20,18,16,14
53,,,163,112,84,68,58,50,45,41,30,25,21,18,16,15,13
54,,,150,104,77,63,53,47,42,38,28,23,19,17,15,14,12
55,,,139,96,71,58,49,43,39,35,26,21,18,16,14,13,11
56,,,129,89,66,54,46,40,36,32,24,20,17,15,13,12,10
57,,161,120,82,61,50,42,37,33,30,22,18,15,14,12,11,9
58,,149,111,77,57,46,39,34,31,28,21,17,14,13,11,10,9
59,,139,103,71,53,43,37,32,29,26,19,16,13,12,10,9,8
60,,129,96,66,49,40,34,30,27,24,18,15,12,11,10,9,7
61,,120,90,62,46,37,32,28,25,22,17,14,12,10,9,8,7
62,,112,83,58,43,35,30,26,23,21,16,13,11,9,8,8,6
63,,105,78,54,40,32,28,24,22,20,15,12,10,9,8,7,6
64,162,98,73,50,37,30,26,23,20,18,14,11,9,8,7,7,6
65,152,92,68,47,35,28,24,21,19,17,13,10,9,8,7,6,5
66,142,86,64,44,33,27,23,20,18,16,12,10,8,7,6,6,5
67,133,80,60,41,31,25,21,19,17,15,11,9,8,7,6,5,5
68,120,73,54,37,28,22,19,17,15,14,10,8,7,6,5,5,4
69,109,66,49,34,25,20,17,15,14,12,9,7,6,6,5,4,4
70,99,60,45,31,23,19,16,14,12,11,8,7,6,5,4,4,3
71,90,55,41,28,21,17,14,13,11,10,8,6,5,5,4,4,3
72,83,50,37,26,19,15,13,12,10,9,7,6,5,4,4,3,3
73,76,46,34,24,18,14,12,11,9,9,6,5,4,4,3,3,3
74,70,42,32,22,16,13,11,10,9,8,6,5,4,4,3,3,2
75,65,39,29,20,15,12,10,9,8,7,5,4,4,3,3,3,2
76,60,36,27,19,14,11,10,8,7,7,5,4,3,3,3,2,2
77,56,34,25,17,13,10,9,8,7,6,5,4,3,3,3,2,2
78,52,31,23,16,12,10,8,7,6,6,4,4,3,3,2,2,2
79,48,29,22,15,11,9,8,7,6,5,4,3,3,2,2,2,2
80,45,27,20,14,10,8,7,6,6,5,4,3,3,2,2,2,2
81,42,26,19,13,10,8,7,6,5,5,4,3,2,2,2,2,2
82,40,24,18,12,9,7,6,6,5,5,3,3,2,2,2,2,2
83,38,23,17,12,9,7,6,5,5,4,3,3,2,2,2,2,2
84,36,21,16,11,8,7,6,5,4,4,3,2,2,2,2,2,2
85,34,20,15,10,8,6,5,5,4,4,3,2,2,2,2,2,2
86,32,19,14,10,7,6,5,4,4,4,3,2,2,2,2,2,2
87,30,18,14,9,7,6,5,4,4,3,3,2,2,2,2,2,2
88,29,18,13,9,7,5,5,4,4,3,2,2,2,2,2,2,2
89,28,17,13,9,6,5,4,4,3,3,2,2,2,2,2,2,2
90,27,16,12,8,6,5,4,4,3,3,2,2,2,2,2,2,2
91,26,16,12,8,6,5,4,4,3,3,2,2,2,2,2,2,2
92,25,15,11,8,6,5,4,3,3,3,2,2,2,2,2,2,2
93,24,15,11,7,6,5,4,3,3,3,2,2,2,2,2,2,2
94,23,14,10,7,5,4,4,3,3,3,2,2,2,2,2,2,2
95,22,13,10,7,5,4,4,3,3,2,2,2,2,2,2,2,2`;

const records = parse(yeastData, {
  columns: false,
  skip_empty_lines: true,
});

const yeastPercentages = records[0].slice(1).map((value: string) => {
  const percentage = Number.parseFloat(value.replace(/,/g, "."));
  return isNaN(percentage) ? null : percentage;
}) as number[];

const fermentationHoursByTemp = _.mapValues(
  _.keyBy(records.slice(1), (record) => Number.parseInt(record[0])),
  (record) =>
    _.map(record.slice(1), (value) => {
      const hours = Number.parseFloat(value.replace(/,/g, "."));
      return isNaN(hours) ? null : hours;
    })
);

function getIndexOfYeast(yeastAmount: number): {
  min: number | null;
  max: number | null;
} {
  // value right to the yeastAmount
  const highIndex = yeastPercentages.findIndex((value) => {
    return yeastAmount <= value;
  });
  if (yeastPercentages[highIndex] === yeastAmount) {
    return { min: highIndex, max: highIndex };
  }
  if (highIndex === 0) {
    return { min: null, max: 0 };
  }
  if (highIndex === -1) {
    return { min: yeastPercentages.length - 1, max: null };
  }

  return { min: highIndex - 1, max: highIndex };
}

function getFermentationHours(temp: number, yeastAmount: number): number {
  const column = getIndexOfYeast(yeastAmount);
  // Interpolate right of the table
  if (column.max === null) {
    const hourDiff =
      fermentationHoursByTemp[temp][column.min!]! -
      fermentationHoursByTemp[temp][column.min! - 1]!;
    const uppperYeastAmount = yeastPercentages[column.min!];
    const yeastDiff = uppperYeastAmount - yeastPercentages[column.min! - 1];
    const hourDecreasePerPercentOfYeast = hourDiff / yeastDiff;
    return (
      (yeastAmount - uppperYeastAmount) * hourDecreasePerPercentOfYeast +
      fermentationHoursByTemp[temp][column.min!]!
    );
  }
  if (column.min === null) {
    throw new Error("Yeast amount is too low");
  }
  if (column.min === column.max) {
    return fermentationHoursByTemp[temp][column.min!]!;
  }
  // Interpolate in the table
  const maxAmount = fermentationHoursByTemp[temp][column.max];
  const minAmount = fermentationHoursByTemp[temp][column.min];
  const maxYeastAmount = yeastPercentages[column.max];
  const minYeastAmount = yeastPercentages[column.min];
  const yeastDiff = maxYeastAmount - minYeastAmount;
  const hourDiff = maxAmount! - minAmount!;
  const yeastOffset = yeastAmount - minYeastAmount;
  const hourOffset = (yeastOffset / yeastDiff) * hourDiff;
  return minAmount! + hourOffset;
}

function getYeastAmountFromHourAndTemp(temp: number, hours: number): number {
  const row = fermentationHoursByTemp[temp];
  const maxIndex = row.findIndex((value) => {
    return value !== null && hours >= value;
  });
  if (row[maxIndex] === hours) {
    return yeastPercentages[maxIndex];
  }
  if (maxIndex === 0) {
    throw new Error("Hours is too low");
  }
  // interpolate right of the table
  if (maxIndex === -1) {
    const lastHourInTable = row[row.length - 1];
    const lastYeastAmount = yeastPercentages[row.length - 1];
    const hourDiff = row[row.length - 2]! - lastHourInTable!;
    const yeastDiff = lastYeastAmount - yeastPercentages[row.length - 2];
    const yeastIncreasePerHour = yeastDiff / hourDiff;
    const interpolated =
      lastYeastAmount + yeastIncreasePerHour * (lastHourInTable! - hours);
    if (interpolated > 1.3) {
      throw new Error("Temperature too low or duration too short");
    }
    return interpolated;
  }
  const highYeastAmount = yeastPercentages[maxIndex];
  const lowYeastAmount = yeastPercentages[maxIndex - 1];
  const highHours = row[maxIndex];
  const lowHours = row[maxIndex - 1];
  const hourDiff = highHours! - lowHours!;
  const yeastDiff = highYeastAmount - lowYeastAmount;
  const hourOffset = hours - lowHours!;
  const yeastOffset = (hourOffset / hourDiff) * yeastDiff;
  return lowYeastAmount + yeastOffset;
}

const cToF = (c: number) => c * (9 / 5) + 32;

export function getYeastAmountTwoStepFermentation(
  coldTemp: number,
  coldHours: number,
  warmTemp: number,
  warmHours: number
): number {
  // If cold hours is 0, just calculate warm fermentation directly
  if (coldHours === 0) {
    const warmTempF = Math.round(cToF(warmTemp));
    if (warmTempF < 35 || warmTempF > 95) {
      throw new Error(
        "Warm temperature out of range (must be between 1.7°C and 35°C)"
      );
    }
    return getYeastAmountFromHourAndTemp(warmTempF, warmHours);
  }

  const coldTempF = Math.round(cToF(coldTemp));
  const warmTempF = Math.round(cToF(warmTemp));
  if (coldTempF < 35 || coldTempF > 95) {
    throw new Error(
      "Cold temperature out of range (must be between 1.7°C and 35°C)"
    );
  }
  if (warmTempF < 35 || warmTempF > 95) {
    throw new Error(
      "Warm temperature out of range (must be between 1.7°C and 35°C)"
    );
  }

  try {
    const coldYeastAmount = getYeastAmountFromHourAndTemp(coldTempF, coldHours);
    const residualHours = getFermentationHours(warmTempF, coldYeastAmount);

    if (residualHours < 2) {
      throw new Error("Cold fermentation time too low or temperature too low");
    }

    const warmYeastAmount = getYeastAmountFromHourAndTemp(
      warmTempF,
      residualHours + warmHours
    );

    return warmYeastAmount;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to calculate yeast amount");
  }
}

// Get min and max values for validation
export const minTemp = 35; // in Fahrenheit
export const maxTemp = 95; // in Fahrenheit
export const minTempC = Math.round(((minTemp - 32) * 5) / 9); // in Celsius
export const maxTempC = Math.round(((maxTemp - 32) * 5) / 9); // in Celsius

// Get min and max yeast percentages
export const minYeastPct = yeastPercentages.filter((p) => p !== null)[0];
export const maxYeastPct = yeastPercentages.filter((p) => p !== null)[
  yeastPercentages.length - 1
];
