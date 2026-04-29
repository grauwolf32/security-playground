export interface UserDto {
  id: number;
  email: string;
  displayName: string;
  isAdmin: boolean;
}

export interface AccountDto {
  id: number;
  ownerId: number;
  currency: string;
  balanceMinor: number;
}

export interface TransferDto {
  id: number;
  fromAccountId: number;
  toAccountId: number;
  amountMinor: number;
  currency: string;
  status: string;
  memo: string | null;
  createdAt: string;
}

export interface CardSummaryDto {
  id: number;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
}

export interface CardFullDto extends CardSummaryDto {
  pan: string;
}

export interface FxQuoteDto {
  base: string;
  quote: string;
  rate: number;
  amountMinor: number;
  convertedMinor: number;
  provider: string;
}

export interface LoginInitiatedDto {
  // Returned when the user has 2FA enabled. The client must POST it back
  // to /auth/2fa/verify together with the TOTP code.
  challengeToken: string;
  twoFactorRequired: true;
}

export interface LoginCompletedDto {
  accessToken: string;
  twoFactorRequired: false;
}

export type LoginResponse = LoginInitiatedDto | LoginCompletedDto;
