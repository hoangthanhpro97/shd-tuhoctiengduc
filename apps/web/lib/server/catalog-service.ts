import 'server-only';
import { getAllPublicExams } from './exam-content-loader';

export async function listPublicExams() {
  return getAllPublicExams();
}
