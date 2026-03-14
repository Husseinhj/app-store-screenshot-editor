export interface FontOption {
  family: string;
  label: string;
}

export const fonts: FontOption[] = [
  { family: 'Inter', label: 'Inter' },
  { family: 'Poppins', label: 'Poppins' },
  { family: 'Montserrat', label: 'Montserrat' },
  { family: 'Roboto', label: 'Roboto' },
  { family: 'Open Sans', label: 'Open Sans' },
  { family: 'Lato', label: 'Lato' },
  { family: 'Raleway', label: 'Raleway' },
  { family: 'Playfair Display', label: 'Playfair Display' },
  { family: '-apple-system, BlinkMacSystemFont, "SF Pro Display"', label: 'SF Pro Display' },
];

export const fontWeights = [
  { value: 100, label: 'Thin' },
  { value: 200, label: 'Extra Light' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
  { value: 900, label: 'Black' },
];
