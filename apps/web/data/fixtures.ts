import { z } from 'zod';

export const examSchema = z.object({
  slug: z.string(), title: z.string(), level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']), questions: z.number(), duration: z.number(), isDemo: z.boolean(), status: z.enum(['new', 'in-progress']), providerFormat: z.string().optional(),
});
export type Exam = z.infer<typeof examSchema>;

export const exams: Exam[] = [
  { slug: 'demo-b1-mock-02', title: 'Đề B1 số 02', level: 'B1', questions: 30, duration: 65, isDemo: true, status: 'in-progress' },
  { slug: 'demo-a2-mock-01', title: 'Đề A2 số 01', level: 'A2', questions: 25, duration: 50, isDemo: true, status: 'new' },
  { slug: 'demo-b1-mock-01', title: 'Đề B1 số 01', level: 'B1', questions: 30, duration: 65, isDemo: true, status: 'new' },
];

export const listening = ['Thông báo ở nhà ga', 'Một ngày đi làm', 'Hẹn gặp cuối tuần', 'Lớp học buổi tối'].map((title, index) => ({ title, teil: index % 3 + 1, duration: `${4 + index}:30` }));
export const reading = ['Lịch học của bạn', 'Thông tin tuyển dụng', 'Một lời mời', 'Tin nhắn trong ngày'].map((title, index) => ({ title, teil: index % 3 + 1 }));
export const dictations = ['Im Alltag', 'Am Arbeitsplatz', 'In der Stadt', 'Gute Gewohnheiten'].map((title, index) => ({ title, questions: 8 + index * 2, duration: `${3 + index}:00` }));
export const writings = ['E-Mail thân mật', 'Ý kiến cá nhân', 'Lời mời tham gia', 'Một trải nghiệm'].map((title, index) => ({ title, task: `Task ${index + 1}`, description: 'Beispiel đề bài viết ngắn để tham khảo cách triển khai ý.' }));
