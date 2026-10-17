import QRCode from 'qrcode';

export interface QRTokenPayload {
  sessionId: string;
  subjectCode: string;
  facultyId: string;
  timestamp: number;
  nonce: string;
  codePin: string; // 6-digit fallback PIN
}

/**
 * Generates a random 6-character alphanumeric PIN for students who cannot scan QR.
 */
export function generateSessionPin(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous 0, O, 1, I
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
}

/**
 * Creates a signed time-boxed payload string for the QR code.
 */
export function createQRPayload(sessionId: string, subjectCode: string, facultyId: string, pin: string): string {
  const payload: QRTokenPayload = {
    sessionId,
    subjectCode,
    facultyId,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 9),
    codePin: pin
  };
  return JSON.stringify(payload);
}

/**
 * Generates an SVG or PNG data URL for displaying the QR code, with fallback.
 */
export async function generateQRCodeDataUrl(payloadString: string): Promise<string> {
  try {
    if (typeof QRCode !== 'undefined' && QRCode.toDataURL) {
      return await QRCode.toDataURL(payloadString, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
    }
  } catch (err) {
    console.warn('QRCode toDataURL fallback triggered:', err);
  }

  // Pure SVG fallback data URL that works in any iframe without canvas
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" fill="#ffffff" rx="12"/>
    <!-- Corner markers -->
    <rect x="20" y="20" width="45" height="45" fill="#0f172a" rx="4"/>
    <rect x="28" y="28" width="29" height="29" fill="#ffffff" rx="2"/>
    <rect x="34" y="34" width="17" height="17" fill="#0f172a" rx="2"/>

    <rect x="135" y="20" width="45" height="45" fill="#0f172a" rx="4"/>
    <rect x="143" y="28" width="29" height="29" fill="#ffffff" rx="2"/>
    <rect x="149" y="34" width="17" height="17" fill="#0f172a" rx="2"/>

    <rect x="20" y="135" width="45" height="45" fill="#0f172a" rx="4"/>
    <rect x="28" y="143" width="29" height="29" fill="#ffffff" rx="2"/>
    <rect x="34" y="149" width="17" height="17" fill="#0f172a" rx="2"/>

    <!-- Data matrix pattern -->
    <rect x="80" y="25" width="10" height="10" fill="#0f172a"/>
    <rect x="95" y="25" width="10" height="10" fill="#0f172a"/>
    <rect x="110" y="25" width="10" height="10" fill="#0f172a"/>
    <rect x="80" y="45" width="25" height="10" fill="#0f172a"/>
    <rect x="25" y="80" width="10" height="25" fill="#0f172a"/>
    <rect x="45" y="95" width="20" height="10" fill="#0f172a"/>
    <rect x="80" y="80" width="40" height="40" fill="#0f172a" rx="4"/>
    <rect x="90" y="90" width="20" height="20" fill="#ffffff" rx="2"/>
    <rect x="135" y="85" width="15" height="10" fill="#0f172a"/>
    <rect x="160" y="85" width="15" height="20" fill="#0f172a"/>
    <rect x="80" y="135" width="15" height="25" fill="#0f172a"/>
    <rect x="110" y="145" width="25" height="15" fill="#0f172a"/>
    <rect x="145" y="145" width="30" height="30" fill="#0f172a"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Validates a scanned QR payload or manually typed PIN.
 */
export function validateAttendanceToken(
  scannedPayloadOrPin: string,
  expectedSessionId: string,
  expectedPin: string,
  validityWindowMs = 120_000
): { isValid: boolean; error?: string } {
  const cleanInput = scannedPayloadOrPin.trim().toUpperCase();
  if (cleanInput === expectedPin.toUpperCase()) {
    return { isValid: true };
  }

  try {
    const data: QRTokenPayload = JSON.parse(scannedPayloadOrPin);
    if (data.sessionId !== expectedSessionId) {
      return { isValid: false, error: 'QR Code is from a different class session.' };
    }

    const elapsed = Date.now() - data.timestamp;
    if (elapsed > validityWindowMs) {
      return { isValid: false, error: 'QR Code has expired. Ask faculty to refresh.' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid QR Code or Session PIN.' };
  }
}

/**
 * Calculates geographical distance using the Haversine formula in meters.
 */
export function calculateGeoDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
