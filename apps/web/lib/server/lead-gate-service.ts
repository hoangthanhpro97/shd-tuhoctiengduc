import 'server-only';
import { createHmac } from 'node:crypto';
import { GranularConsentSchema, IssueOtpPayloadSchema, LeadGatePayloadSchema, VerifyOtpPayloadSchema } from '@shd/contracts';
import { getAppPool } from './db';
import { getServerEnv } from './env';

function hashPhone(phone: string): string {
  return createHmac('sha256', getServerEnv().VISITOR_TOKEN_PEPPER ?? 'development-only-phone-pepper').update(phone).digest('hex');
}

function maskPhone(phone: string): string {
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

export async function createLeadGate(tokenHash: string, attemptId: string, input: unknown) {
  const payload = LeadGatePayloadSchema.parse(input);
  const learner = await getAppPool().query<{ create_learner: string }>(
    `SELECT create_learner($1, $2, $3, NULL, $4) AS create_learner`,
    [tokenHash, payload.fullName, payload.phoneNumber, payload.ageGroup],
  );
  const learnerId = learner.rows[0]?.create_learner;
  if (!learnerId) throw new Error('Unable to create learner');
  await getAppPool().query(`SELECT attach_learner_to_attempt($1, $2, $3)`, [tokenHash, attemptId, learnerId]);
  if (payload.ageGroup === 'student_under18' && payload.parentPhoneNumber) {
    await getAppPool().query(
      `SELECT create_guardian($1, $2, $3, $4, 'parent')`,
      [tokenHash, learnerId, hashPhone(payload.parentPhoneNumber), JSON.stringify({ masked: maskPhone(payload.parentPhoneNumber) })],
    );
  }
  const otpInput = IssueOtpPayloadSchema.parse({ phoneNumber: payload.phoneNumber, channel: 'sms' });
  const challenge = await getAppPool().query<{ issue_otp: { challenge_id: string; otp_code: string } }>(
    `SELECT issue_otp($1, $2, $3, $4) AS issue_otp`,
    [tokenHash, attemptId, otpInput.phoneNumber, otpInput.channel],
  );
  const value = challenge.rows[0]?.issue_otp;
  if (!value) throw new Error('Unable to issue OTP');
  if (getServerEnv().OTP_PROVIDER === 'mock') console.info(`mock OTP issued for challenge ${value.challenge_id}: ${value.otp_code}`);
  return {
    challengeId: value.challenge_id,
    maskedPhoneNumber: maskPhone(payload.phoneNumber),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
}

export async function verifyOtp(tokenHash: string, input: unknown) {
  const payload = VerifyOtpPayloadSchema.parse(input);
  const verified = await getAppPool().query<{ verify_otp: boolean }>(
    `SELECT verify_otp($1, $2, $3) AS verify_otp`,
    [tokenHash, payload.challengeId, payload.code],
  );
  if (!verified.rows[0]?.verify_otp) throw new Error('OTP_INVALID: OTP is invalid');
  const learner = await getAppPool().query<{ get_verified_otp_learner: string }>(
    `SELECT get_verified_otp_learner($1, $2) AS get_verified_otp_learner`,
    [tokenHash, payload.challengeId],
  );
  const learnerId = learner.rows[0]?.get_verified_otp_learner;
  return { verified: true, learnerId, challengeId: payload.challengeId, consentShdCareer: payload.consentShdCareer };
}

export async function recordConsent(tokenHash: string, learnerId: string, attemptId: string, challengeId: string, consentShdCareer: boolean) {
  await getAppPool().query(`SELECT mark_phone_verified($1, $2, $3, $4)`, [tokenHash, learnerId, challengeId, attemptId]);
  const text = await getAppPool().query<{ id: string; code: string }>(
    `SELECT ct.id, cp.code FROM consent_texts ct JOIN consent_purposes cp ON cp.id = ct.purpose_id WHERE cp.code IN ('shd_education', 'shd_career') AND ct.version_number = 1 AND ct.target_audience = 'learner' ORDER BY cp.code`,
  );
  const educationTextId = text.rows.find((row) => row.code === 'shd_education')?.id;
  const careerTextId = text.rows.find((row) => row.code === 'shd_career')?.id;
  if (!educationTextId) throw new Error('CONSENT_REQUIRED: Education consent text is not configured');
  const consent = GranularConsentSchema.parse({ consentShdEducation: true });
  if (!consent.consentShdEducation) throw new Error('CONSENT_REQUIRED: Education consent is required');
  await getAppPool().query(`SELECT record_consent($1, $2, $3, 'granted', 'web', NULL)`, [tokenHash, learnerId, educationTextId]);
  if (consentShdCareer && careerTextId) await getAppPool().query(`SELECT record_consent($1, $2, $3, 'granted', 'web', NULL)`, [tokenHash, learnerId, careerTextId]);
}

export async function unlockAttempt(tokenHash: string, attemptId: string, challengeId: string) {
  await getAppPool().query(`SELECT unlock_full_solution($1, $2, $3)`, [tokenHash, attemptId, challengeId]);
  const review = await getAppPool().query<{ get_attempt_review: unknown }>(`SELECT get_attempt_review($1, $2) AS get_attempt_review`, [tokenHash, attemptId]);
  return { unlocked: true, review: review.rows[0]?.get_attempt_review ?? null };
}
