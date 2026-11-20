import { ArrowRight } from 'lucide-react';

export function TeacherSpeakingCta() {
  return (
    <section className="bg-[#da2527] text-white p-6 rounded-2xl shadow-md space-y-3 font-sans">
      <h2 className="text-lg font-bold">Muốn được sửa bài nói 1-1?</h2>
      <p className="text-sm leading-relaxed text-red-50">Đặt lịch Test Nói 15 phút cùng Giảng viên bản xứ SHD Education để đánh giá phát âm và phản xạ.</p>
      <a className="w-full block text-center py-3 bg-white text-[#da2527] font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-red-50 transition-all shadow-sm" href="/tai-khoan-pro">
        Đặt lịch Test Nói <ArrowRight className="inline-block ml-1" size={14} />
      </a>
    </section>
  );
}
