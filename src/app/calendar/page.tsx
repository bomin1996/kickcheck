import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '2026년 4월 스니커즈 발매 캘린더 | 한정판 출시일',
  description: '2026년 4월 스니커즈 발매 일정. 나이키, 조던, 뉴발란스 한정판 출시 정보.',
};

// TODO: Phase 4에서 실제 데이터로 교체
const MOCK_RELEASES = [
  { date: '2026-04-12', items: [
    { slug: 'nike-dunk-low-cacao-wow', name: 'Nike Dunk Low "Cacao Wow"', brand: 'Nike', price: 139000, platform: 'Nike SNKRS', type: 'fcfs' },
  ]},
  { date: '2026-04-15', items: [
    { slug: 'travis-scott-jordan-1-low-og', name: 'Travis Scott x Air Jordan 1 Low OG', brand: 'Jordan', price: 179000, platform: 'SNKRS 래플', type: 'raffle' },
    { slug: 'new-balance-990v6-grey', name: 'New Balance 990v6 Grey', brand: 'New Balance', price: 259000, platform: 'New Balance 공홈', type: 'general' },
  ]},
  { date: '2026-04-18', items: [
    { slug: 'new-balance-2002r-sea-salt', name: 'New Balance 2002R "Sea Salt"', brand: 'New Balance', price: 169000, platform: '크림 드로우', type: 'raffle' },
  ]},
  { date: '2026-04-20', items: [
    { slug: 'nike-air-max-1-86-og', name: 'Nike Air Max 1 \'86 OG', brand: 'Nike', price: 189000, platform: 'Nike SNKRS', type: 'fcfs' },
  ]},
  { date: '2026-04-25', items: [
    { slug: 'adidas-yeezy-350-v2-bone', name: 'adidas Yeezy Boost 350 V2 "Bone"', brand: 'adidas', price: 299000, platform: 'adidas Confirmed', type: 'raffle' },
  ]},
];

const TYPE_LABELS: Record<string, string> = {
  raffle: '래플',
  fcfs: '선착순',
  general: '일반 발매',
};

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">발매 캘린더</h1>
      <p className="text-gray-500 text-sm mb-6">2026년 4월 스니커즈 발매 일정</p>

      <div className="space-y-6">
        {MOCK_RELEASES.map((day) => (
          <div key={day.date}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex flex-col items-center justify-center text-sm font-bold">
                <span>{new Date(day.date).getMonth() + 1}월</span>
                <span className="text-lg leading-none">{new Date(day.date).getDate()}</span>
              </div>
              <div>
                <p className="font-medium">
                  {new Date(day.date).toLocaleDateString('ko-KR', { weekday: 'long' })}
                </p>
              </div>
            </div>

            <div className="space-y-2 ml-15">
              {day.items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products/${item.slug}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[var(--accent)] transition-colors ml-[60px]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.type === 'raffle' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                        item.type === 'fcfs' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {TYPE_LABELS[item.type] || item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{item.platform} · 출시가 {item.price.toLocaleString()}원</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
