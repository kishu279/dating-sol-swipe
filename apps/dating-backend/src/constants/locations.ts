/**
 * Location Constants for Validation
 * Use these to validate user profile location inputs
 */

export const LOCATIONS = {
    India: [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Delhi",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
    ],
    USA: [
        "Alabama",
        "Alaska",
        "Arizona",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "Florida",
        "Georgia",
        "Hawaii",
        "Idaho",
        "Illinois",
        "Indiana",
        "Iowa",
        "Kansas",
        "Kentucky",
        "Louisiana",
        "Maine",
        "Maryland",
        "Massachusetts",
        "Michigan",
        "Minnesota",
        "Mississippi",
        "Missouri",
        "Montana",
        "Nebraska",
        "Nevada",
        "New Hampshire",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "North Dakota",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Pennsylvania",
        "Rhode Island",
        "South Carolina",
        "South Dakota",
        "Tennessee",
        "Texas",
        "Utah",
        "Vermont",
        "Virginia",
        "Washington",
        "West Virginia",
        "Wisconsin",
        "Wyoming",
    ],
    UK: [
        "England",
        "Scotland",
        "Wales",
        "Northern Ireland",
    ],
    Canada: [
        "Alberta",
        "British Columbia",
        "Manitoba",
        "New Brunswick",
        "Newfoundland and Labrador",
        "Nova Scotia",
        "Ontario",
        "Prince Edward Island",
        "Quebec",
        "Saskatchewan",
    ],
    Australia: [
        "New South Wales",
        "Victoria",
        "Queensland",
        "Western Australia",
        "South Australia",
        "Tasmania",
        "Australian Capital Territory",
        "Northern Territory",
    ],
} as const;

export type Country = keyof typeof LOCATIONS;
export type State<C extends Country> = (typeof LOCATIONS)[C][number];

/**
 * Get all valid countries
 */
export const getCountries = (): Country[] => {
    return Object.keys(LOCATIONS) as Country[];
};

/**
 * Get all states for a given country
 */
export const getStates = (country: Country): readonly string[] => {
    return LOCATIONS[country] || [];
};

/**
 * Validate if a country is valid
 */
export const isValidCountry = (country: string): country is Country => {
    return country in LOCATIONS;
};

/**
 * Validate if a state is valid for a given country
 */
export const isValidState = (country: string, state: string): boolean => {
    if (!isValidCountry(country)) return false;
    return LOCATIONS[country].includes(state as never);
};

/**
 * Validate location (country + state)
 */
export const validateLocation = (
    country: string,
    state: string
): { valid: boolean; error?: string } => {
    if (!isValidCountry(country)) {
        return { valid: false, error: `Invalid country: ${country}` };
    }
    if (!isValidState(country, state)) {
        return { valid: false, error: `Invalid state "${state}" for country "${country}"` };
    }
    return { valid: true };
};
