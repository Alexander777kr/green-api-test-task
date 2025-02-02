import { parsePhoneNumber } from 'awesome-phonenumber';

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function parsePhone(input: string) {
  const pn = parsePhoneNumber(input, { regionCode: 'RU' });
  return pn?.number?.international;
}
