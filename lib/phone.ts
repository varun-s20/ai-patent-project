import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

export type { CountryCode };

export interface CountryOption {
  iso2: CountryCode;
  name: string;
  dialCode: string;
  /** Regional-indicator flag emoji, derived from the ISO code rather than a
   * hardcoded per-country table — every renderer that supports flag emoji
   * already knows how to compose these two Unicode code points. */
  flag: string;
}

function flagEmoji(iso2: string): string {
  return String.fromCodePoint(
    ...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/** English region names, snapshotted from `Intl.DisplayNames` rather than
 * called at render time. The server (Node/ICU) and the browser (Chrome/ICU)
 * ship different CLDR data — e.g. Node renders "FK" as "Falkland Islands"
 * while Chrome renders it "Falkland Islands (Islas Malvinas)" — so computing
 * this table live disagreed between SSR and hydration. A frozen table is
 * identical everywhere. Regenerate by re-running the Intl.DisplayNames map
 * in `getCountries()` order if libphonenumber-js's country list changes. */
const REGION_NAMES: Partial<Record<CountryCode, string>> = {
  AF: "Afghanistan", AX: "Åland Islands", AL: "Albania", DZ: "Algeria", AS: "American Samoa",
  AD: "Andorra", AO: "Angola", AI: "Anguilla", AG: "Antigua & Barbuda", AR: "Argentina",
  AM: "Armenia", AW: "Aruba", AC: "Ascension Island", AU: "Australia", AT: "Austria",
  AZ: "Azerbaijan", BS: "Bahamas", BH: "Bahrain", BD: "Bangladesh", BB: "Barbados",
  BY: "Belarus", BE: "Belgium", BZ: "Belize", BJ: "Benin", BM: "Bermuda", BT: "Bhutan",
  BO: "Bolivia", BA: "Bosnia & Herzegovina", BW: "Botswana", BR: "Brazil",
  IO: "British Indian Ocean Territory", VG: "British Virgin Islands", BN: "Brunei",
  BG: "Bulgaria", BF: "Burkina Faso", BI: "Burundi", KH: "Cambodia", CM: "Cameroon",
  CA: "Canada", CV: "Cape Verde", BQ: "Caribbean Netherlands", KY: "Cayman Islands",
  CF: "Central African Republic", TD: "Chad", CL: "Chile", CN: "China",
  CX: "Christmas Island", CC: "Cocos (Keeling) Islands", CO: "Colombia", KM: "Comoros",
  CG: "Congo - Brazzaville", CD: "Congo - Kinshasa", CK: "Cook Islands", CR: "Costa Rica",
  CI: "Côte d’Ivoire", HR: "Croatia", CU: "Cuba", CW: "Curaçao", CY: "Cyprus",
  CZ: "Czechia", DK: "Denmark", DJ: "Djibouti", DM: "Dominica",
  DO: "Dominican Republic", EC: "Ecuador", EG: "Egypt", SV: "El Salvador",
  GQ: "Equatorial Guinea", ER: "Eritrea", EE: "Estonia", SZ: "Eswatini", ET: "Ethiopia",
  FK: "Falkland Islands", FO: "Faroe Islands", FJ: "Fiji", FI: "Finland", FR: "France",
  GF: "French Guiana", PF: "French Polynesia", GA: "Gabon", GM: "Gambia", GE: "Georgia",
  DE: "Germany", GH: "Ghana", GI: "Gibraltar", GR: "Greece", GL: "Greenland",
  GD: "Grenada", GP: "Guadeloupe", GU: "Guam", GT: "Guatemala", GG: "Guernsey",
  GN: "Guinea", GW: "Guinea-Bissau", GY: "Guyana", HT: "Haiti", HN: "Honduras",
  HK: "Hong Kong SAR China", HU: "Hungary", IS: "Iceland", IN: "India", ID: "Indonesia",
  IR: "Iran", IQ: "Iraq", IE: "Ireland", IM: "Isle of Man", IL: "Israel", IT: "Italy",
  JM: "Jamaica", JP: "Japan", JE: "Jersey", JO: "Jordan", KZ: "Kazakhstan", KE: "Kenya",
  KI: "Kiribati", XK: "Kosovo", KW: "Kuwait", KG: "Kyrgyzstan", LA: "Laos", LV: "Latvia",
  LB: "Lebanon", LS: "Lesotho", LR: "Liberia", LY: "Libya", LI: "Liechtenstein",
  LT: "Lithuania", LU: "Luxembourg", MO: "Macao SAR China", MG: "Madagascar",
  MW: "Malawi", MY: "Malaysia", MV: "Maldives", ML: "Mali", MT: "Malta",
  MH: "Marshall Islands", MQ: "Martinique", MR: "Mauritania", MU: "Mauritius",
  YT: "Mayotte", MX: "Mexico", FM: "Micronesia", MD: "Moldova", MC: "Monaco",
  MN: "Mongolia", ME: "Montenegro", MS: "Montserrat", MA: "Morocco", MZ: "Mozambique",
  MM: "Myanmar (Burma)", NA: "Namibia", NR: "Nauru", NP: "Nepal", NL: "Netherlands",
  NC: "New Caledonia", NZ: "New Zealand", NI: "Nicaragua", NE: "Niger", NG: "Nigeria",
  NU: "Niue", NF: "Norfolk Island", KP: "North Korea", MK: "North Macedonia",
  MP: "Northern Mariana Islands", NO: "Norway", OM: "Oman", PK: "Pakistan",
  PW: "Palau", PS: "Palestinian Territories", PA: "Panama", PG: "Papua New Guinea",
  PY: "Paraguay", PE: "Peru", PH: "Philippines", PL: "Poland", PT: "Portugal",
  PR: "Puerto Rico", QA: "Qatar", RE: "Réunion", RO: "Romania", RU: "Russia",
  RW: "Rwanda", WS: "Samoa", SM: "San Marino", ST: "São Tomé & Príncipe",
  SA: "Saudi Arabia", SN: "Senegal", RS: "Serbia", SC: "Seychelles", SL: "Sierra Leone",
  SG: "Singapore", SX: "Sint Maarten", SK: "Slovakia", SI: "Slovenia",
  SB: "Solomon Islands", SO: "Somalia", ZA: "South Africa", KR: "South Korea",
  SS: "South Sudan", ES: "Spain", LK: "Sri Lanka", BL: "St. Barthélemy",
  SH: "St. Helena", KN: "St. Kitts & Nevis", LC: "St. Lucia", MF: "St. Martin",
  PM: "St. Pierre & Miquelon", VC: "St. Vincent & Grenadines", SD: "Sudan",
  SR: "Suriname", SJ: "Svalbard & Jan Mayen", SE: "Sweden", CH: "Switzerland",
  SY: "Syria", TW: "Taiwan", TJ: "Tajikistan", TZ: "Tanzania", TH: "Thailand",
  TL: "Timor-Leste", TG: "Togo", TK: "Tokelau", TO: "Tonga",
  TT: "Trinidad & Tobago", TA: "Tristan da Cunha", TN: "Tunisia", TR: "Türkiye",
  TM: "Turkmenistan", TC: "Turks & Caicos Islands", TV: "Tuvalu",
  VI: "U.S. Virgin Islands", UG: "Uganda", UA: "Ukraine", AE: "United Arab Emirates",
  GB: "United Kingdom", US: "United States", UY: "Uruguay", UZ: "Uzbekistan",
  VU: "Vanuatu", VA: "Vatican City", VE: "Venezuela", VN: "Vietnam",
  WF: "Wallis & Futuna", EH: "Western Sahara", YE: "Yemen", ZM: "Zambia",
  ZW: "Zimbabwe",
};

/** Every country libphonenumber-js knows a calling code for, name from the
 * frozen table above so the list stays accurate without hand-maintaining
 * dial codes, and stable without depending on the runtime's ICU version. */
export const COUNTRIES: CountryOption[] = getCountries()
  .map((iso2) => ({
    iso2,
    name: REGION_NAMES[iso2] ?? iso2,
    dialCode: getCountryCallingCode(iso2),
    flag: flagEmoji(iso2),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const COUNTRY_CODES = COUNTRIES.map((c) => c.iso2);
