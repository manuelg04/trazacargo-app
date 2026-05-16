export const colors = {
  brand50:  '#E8F5EE',
  brand100: '#C8E6D4',
  brand200: '#A0D0B8',
  brand300: '#72B898',
  brand400: '#48A07A',
  brand500: '#1C6B40',
  brand600: '#165430',
  brand700: '#113F24',
  brand800: '#0C2C19',
  brand900: '#071A0F',

  accent50:  '#FEF0E3',
  accent100: '#FDD8B8',
  accent200: '#FAB980',
  accent300: '#F49448',
  accent400: '#EC7820',
  accent500: '#D4680A',
  accent600: '#A84F06',
  accent700: '#7C3A04',

  neutral50:  '#F5F5F2',
  neutral100: '#EAEAE6',
  neutral200: '#D4D4CE',
  neutral300: '#B8B8B0',
  neutral400: '#909088',
  neutral500: '#686864',
  neutral600: '#484844',
  neutral700: '#323230',
  neutral800: '#1E1E1C',
  neutral900: '#121210',

  success:    '#1A7A46',
  successBg:  '#E8F5ED',
  successBd:  '#9ACDB0',

  warning:    '#C27210',
  warningBg:  '#FEF4E3',
  warningBd:  '#E8C070',

  error:      '#C23030',
  errorBg:    '#FEF0F0',
  errorBd:    '#E0A0A0',

  info:       '#1E5BAD',
  infoBg:     '#EBF2FE',
  infoBd:     '#96B8EE',

  purple:     '#6244A0',
  purpleBg:   '#F2EEFF',
  purpleBd:   '#B8A0E0',

  bgCanvas:   '#F5F5F2',
  surface:    '#FFFFFF',

  textPrimary:   '#141A15',
  textSecondary: '#4E6458',
  textTertiary:  '#6E8078',
  textDisabled:  '#9DB0A6',
  textInverse:   '#FFFFFF',
  textBrand:     '#165430',
  textAccent:    '#A84F06',

  border:       '#C8D4CE',
  borderSubtle: '#DDE6E1',
  borderBrand:  '#72B898',
  borderFocus:  '#1C6B40',
} as const;

export const tripStateColors: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT:               { bg: '#F0F0ED', text: '#6E8078', border: '#D4D4CE' },
  OFFERED:             { bg: '#EBF2FE', text: '#1E5BAD', border: '#96B8EE' },
  ACCEPTED:            { bg: '#E8F5EE', text: '#165430', border: '#C8E6D4' },
  IN_LOADING:          { bg: '#FEF4E3', text: '#C27210', border: '#E8C070' },
  LOADED:              { bg: '#FEF4E3', text: '#8A5E0A', border: '#E8C070' },
  IN_TRANSIT:          { bg: '#FEF0E3', text: '#A84F06', border: '#FAB980' },
  IN_UNLOADING:        { bg: '#F2EEFF', text: '#6244A0', border: '#B8A0E0' },
  UNLOADED:            { bg: '#F2EEFF', text: '#6244A0', border: '#B8A0E0' },
  DOCUMENTS_PENDING:   { bg: '#FEF4E3', text: '#8A5E0A', border: '#E8C070' },
  DOCUMENTS_SUBMITTED: { bg: '#EBF2FE', text: '#1E5BAD', border: '#96B8EE' },
  DOCUMENTS_APPROVED:  { bg: '#E8F5ED', text: '#1A7A46', border: '#9ACDB0' },
  CLOSED:              { bg: '#1A5434', text: '#FFFFFF', border: 'transparent' },
  CANCELLED:           { bg: '#FEF0F0', text: '#C23030', border: '#E0A0A0' },
};

export const docStateColors: Record<string, { bg: string; text: string; border: string }> = {
  PENDING:   { bg: '#FEF4E3', text: '#C27210', border: '#E8C070' },
  AVAILABLE: { bg: '#F0F0ED', text: '#6E8078', border: '#D4D4CE' },
  SUBMITTED: { bg: '#EBF2FE', text: '#1E5BAD', border: '#96B8EE' },
  APPROVED:  { bg: '#E8F5ED', text: '#1A7A46', border: '#9ACDB0' },
  REJECTED:  { bg: '#FEF0F0', text: '#C23030', border: '#E0A0A0' },
  ARCHIVED:  { bg: '#F0F0ED', text: '#6E8078', border: '#D4D4CE' },
};

export const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  DRIVER:     { bg: '#FEF0E3', text: '#A84F06', border: '#FAB980' },
  DISPATCHER: { bg: '#E8F5EE', text: '#165430', border: '#C8E6D4' },
  ADMIN:      { bg: '#1A5434', text: '#FFFFFF', border: 'transparent' },
};

export const profileStatusColors: Record<string, { bg: string; text: string; border: string }> = {
  ACTIVE:   { bg: '#E8F5ED', text: '#1A7A46', border: '#9ACDB0' },
  DISABLED: { bg: '#FEF0F0', text: '#C23030', border: '#E0A0A0' },
};

export const offerStatusColors: Record<string, { bg: string; text: string; border: string }> = {
  PENDING:   { bg: '#EBF2FE', text: '#1E5BAD', border: '#96B8EE' },
  ACCEPTED:  { bg: '#E8F5ED', text: '#1A7A46', border: '#9ACDB0' },
  REJECTED:  { bg: '#FEF0F0', text: '#C23030', border: '#E0A0A0' },
  EXPIRED:   { bg: '#F0F0ED', text: '#6E8078', border: '#D4D4CE' },
  CANCELLED: { bg: '#F0F0ED', text: '#6E8078', border: '#D4D4CE' },
};

export const accessCodeStatusColors: Record<string, { bg: string; text: string; border: string }> = {
  ACTIVE:   { bg: '#E8F5EE', text: '#165430', border: '#C8E6D4' },
  USED:     { bg: '#F0F0ED', text: '#6E8078', border: '#D4D4CE' },
  DISABLED: { bg: '#FEF0F0', text: '#C23030', border: '#E0A0A0' },
  EXPIRED:  { bg: '#FEF4E3', text: '#C27210', border: '#E8C070' },
};

export const tripStateLabels: Record<string, string> = {
  DRAFT: 'Borrador', OFFERED: 'Ofertado', ACCEPTED: 'Aceptado',
  IN_LOADING: 'En cargue', LOADED: 'Cargado', IN_TRANSIT: 'En ruta',
  IN_UNLOADING: 'En descargue', UNLOADED: 'Descargado',
  DOCUMENTS_PENDING: 'Docs pendientes', DOCUMENTS_SUBMITTED: 'Docs enviados',
  DOCUMENTS_APPROVED: 'Docs aprobados', CLOSED: 'Cerrado', CANCELLED: 'Cancelado',
};
export const docStateLabels: Record<string, string> = {
  PENDING: 'Pendiente', AVAILABLE: 'Disponible', SUBMITTED: 'En revisión',
  APPROVED: 'Aprobado', REJECTED: 'Rechazado', ARCHIVED: 'Archivado',
};
export const roleLabels: Record<string, string> = {
  DRIVER: 'Conductor', DISPATCHER: 'Despachador', ADMIN: 'Administrador',
};
export const profileStatusLabels: Record<string, string> = {
  ACTIVE: 'Activo', DISABLED: 'Deshabilitado',
};
export const offerStatusLabels: Record<string, string> = {
  PENDING: 'Pendiente', ACCEPTED: 'Aceptada', REJECTED: 'Rechazada',
  EXPIRED: 'Expirada', CANCELLED: 'Cancelada',
};
export const accessCodeStatusLabels: Record<string, string> = {
  ACTIVE: 'Activo', USED: 'Usado', DISABLED: 'Deshabilitado', EXPIRED: 'Expirado',
};
export const docTypeLabels: Record<string, string> = {
  MANIFEST: 'Manifiesto', REMITTANCE: 'Remesa', ADVANCE: 'Anticipo',
  LOADING_ORDER: 'Orden de cargue', OTHER: 'Otro',
  DELIVERY_TICKET: 'Ticket de descargue', PAYMENT_ACCOUNT: 'Cuenta de cobro',
  SUPPORT_PHOTO: 'Foto soporte', FULFILLMENT: 'Cumplido',
};
export const eventLabels: Record<string, string> = {
  TRIP_ACCEPTED: 'Viaje aceptado', ARRIVED_TO_LOADING: 'Llegó a cargue',
  LOADED: 'Cargado', STARTED_ROUTE: 'Inició ruta',
  ARRIVED_TO_UNLOADING: 'Llegó a descargue', UNLOADED: 'Descargado',
  DOCUMENTS_SUBMITTED: 'Documentos enviados', ISSUE_REPORTED: 'Novedad reportada',
};

export const fontFamily = {
  regular:   'PlusJakartaSans_400Regular',
  medium:    'PlusJakartaSans_500Medium',
  semibold:  'PlusJakartaSans_600SemiBold',
  bold:      'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const fontSize = {
  xs:    11,
  sm:    13,
  base:  15,
  md:    16,
  lg:    18,
  xl:    22,
  '2xl': 28,
  '3xl': 38,
} as const;

export const spacing = {
  1: 4,  2: 8,  3: 12, 4: 16,
  5: 20, 6: 24, 8: 32, 10: 40, 12: 48,
} as const;

export const radius = {
  sm:   4,
  md:   8,
  btn:  10,
  lg:   12,
  card: 14,
  xl:   16,
  full: 9999,
} as const;

export const shadow = {
  xs: {
    shadowColor: '#0E1411', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  sm: {
    shadowColor: '#0E1411', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  md: {
    shadowColor: '#0E1411', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09, shadowRadius: 12, elevation: 4,
  },
  lg: {
    shadowColor: '#0E1411', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
  },
} as const;

export const size = {
  btnLg:   52,
  btnMd:   44,
  btnSm:   36,
  input:   48,
  navBar:  60,
  header:  56,
  tab:     48,
  avatar:  44,
  docIcon: 38,
} as const;

export const theme = {
  colors, tripStateColors, docStateColors, roleColors, profileStatusColors,
  offerStatusColors, accessCodeStatusColors,
  tripStateLabels, docStateLabels, roleLabels, profileStatusLabels,
  offerStatusLabels, accessCodeStatusLabels, docTypeLabels, eventLabels,
  fontFamily, fontSize, spacing, radius, shadow, size,
};
export default theme;
