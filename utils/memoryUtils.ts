import { CharData } from '../types';

export const BASE_ADDRESS = 0x7ffee4;

export const generateMemoryData = (input: string): CharData[] => {
  // Ensure we don't exceed a reasonable visualization limit
  const safeInput = input.slice(0, 12);
  const data: CharData[] = [];
  
  // Add characters
  for (let i = 0; i < safeInput.length; i++) {
    data.push({
      id: `char-${i}-${Date.now()}`, // Simple unique ID generation
      char: safeInput[i],
      index: i,
      address: `0x${(BASE_ADDRESS + i).toString(16).toUpperCase()}`
    });
  }

  // Add Null Terminator
  data.push({
    id: `null-${safeInput.length}`,
    char: '\\0',
    index: safeInput.length,
    address: `0x${(BASE_ADDRESS + safeInput.length).toString(16).toUpperCase()}`
  });

  return data;
};
