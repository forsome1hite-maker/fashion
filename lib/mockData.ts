/**
 * DB 연결 전 공용 Mock 데이터 (게시글 메타 + 시드 이미지).
 * mockStore 와 API 라우트가 함께 참조한다.
 */

export type MockPost = {
  id: string;
  user: string;
  handle: string;
  avatar: string;
  tpo: string;
  category: string;
  urgency: 'critical' | 'warning' | 'normal';
  question: string;
};

export const MOCK_POSTS: MockPost[] = [
  {
    id: '1',
    user: '소개팅뉴비',
    handle: '@blind_date_99',
    avatar: 'https://i.pravatar.cc/100?img=11',
    tpo: '🚨 소개팅 D-1',
    category: '소개팅',
    urgency: 'critical',
    question: '내일 첫 소개팅인데 이 핏 어떤가요? 너무 과한가요...?',
  },
  {
    id: '2',
    user: '월요병환자',
    handle: '@new_comer',
    avatar: 'https://i.pravatar.cc/100?img=32',
    tpo: '⚠️ 첫출근 긴급',
    category: '첫출근',
    urgency: 'warning',
    question: '스타트업 첫 출근룩이요. 캐주얼인데 너무 풀어진 느낌일까요?',
  },
  {
    id: '3',
    user: '결혼식하객',
    handle: '@guest_look',
    avatar: 'https://i.pravatar.cc/100?img=45',
    tpo: '💍 친구 결혼식 D-3',
    category: '결혼식',
    urgency: 'normal',
    question: '하객룩인데 신부보다 튀면 안 되겠죠? 컬러 톤 봐주세요!',
  },
];

/* 각 게시글의 최초(원본) 코디 이미지 */
export const SEED_IMAGES: Record<string, string> = {
  '1': '/pic/cho.png',
  '2': '/pic/KCM.png',
  '3': '/pic/woman1.png',
};
