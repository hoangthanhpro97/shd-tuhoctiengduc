export type TopicCategory =
  | 'tech'
  | 'station'
  | 'bulletin'
  | 'party'
  | 'newspaper'
  | 'travel'
  | 'general';

export function resolveTopicCategory(title: string, skill?: string): TopicCategory {
  const text = (title || '').toLowerCase();
  void skill;

  if (text.includes('handy') || text.includes('mobiltelefon') || text.includes('điện thoại') || text.includes('computer') || text.includes('internet') || text.includes('công nghệ')) {
    return 'tech';
  }
  if (text.includes('bahnhof') || text.includes('nhà ga') || text.includes('zug') || text.includes('tàu') || text.includes('thông báo') || text.includes('ansage') || text.includes('flughafen')) {
    return 'station';
  }
  if (text.includes('wohnung') || text.includes('phòng') || text.includes('zimmer') || text.includes('tuyển dụng') || text.includes('bewerbung') || text.includes('arbeit') || text.includes('lịch học')) {
    return 'bulletin';
  }
  if (text.includes('party') || text.includes('sinh nhật') || text.includes('geburtstag') || text.includes('einladung') || text.includes('hẹn gặp') || text.includes('cuối tuần') || text.includes('lời mời')) {
    return 'party';
  }
  if (text.includes('zeitung') || text.includes('báo') || text.includes('artikel') || text.includes('tin tức') || text.includes('diễn đàn')) {
    return 'newspaper';
  }
  if (text.includes('reise') || text.includes('du lịch') || text.includes('urlaub') || text.includes('ausflug') || text.includes('dã ngoại')) {
    return 'travel';
  }
  return 'general';
}
