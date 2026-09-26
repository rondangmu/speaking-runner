/* =========================================================
   주제별 공략 · 표현 키트
   STRUCTURES : 어떤 주제에도 쓰는 "만능 문장 구조" (기능별)
   KITS       : 주제별 키트  st 문장 구조 [패턴, 뜻, 예문] · adj 형용사 · rs 이유 키워드 [한, 영] · vn 동사·명사 · core 핵심 포인트
   TOPICS_EXTRA : 새 주제 (완성 문장 없이 키트 중심)
   ========================================================= */
window.STRUCTURES = [
  { cat: '💬 의견 말하기', items: [
    ['I think (that) ~', '~라고 생각해요', 'I think online classes are useful.'],
    ['I agree that ~ / I disagree that ~', '~에 동의해요 / 반대해요', 'I agree that companies should allow working from home.'],
    ['In my opinion, ~', '제 생각에는 ~', 'In my opinion, health is more important than money.'],
    ['I prefer A to B', 'B보다 A를 더 좋아해요', 'I prefer e-books to paper books.'],
    ['I would rather ~', '차라리 ~하겠어요', 'I would rather work for a large company.'],
    ['The most important thing is ~', '가장 중요한 건 ~예요', 'The most important thing is the price.']
  ] },
  { cat: '🔑 이유 말하기', items: [
    ['I have two reasons.', '이유는 두 가지예요', 'I have two reasons. First, ~. Second, ~.'],
    ['That\'s because ~', '그 이유는 ~ 때문이에요', 'That\'s because it saves time.'],
    ['It is ~ to ~', '~하는 것은 ~해요', 'It is easy to compare prices online.'],
    ['It helps me ~', '~하는 데 도움이 돼요', 'It helps me relieve stress.'],
    ['I can ~', '저는 ~할 수 있어요', 'I can study anytime and anywhere.'],
    ['I don\'t have to ~', '~할 필요가 없어요', 'I don\'t have to commute every day.'],
    ['It makes me ~', '저를 ~하게 만들어요', 'It makes me feel relaxed.'],
    ['This is why ~ / That\'s why ~', '그래서 ~해요', 'That\'s why I prefer shopping online.']
  ] },
  { cat: '📎 예시 말하기', items: [
    ['For example, ~', '예를 들어 ~', 'For example, last year I took an online class.'],
    ['When I was ~, I ~', '제가 ~였을 때, ~했어요', 'When I was in college, I joined a hiking club.'],
    ['Last year / Last month, I ~', '작년에 / 지난달에 ~했어요', 'Last month, I bought a new phone.'],
    ['As a result, ~', '그 결과, ~', 'As a result, my score went up a lot.'],
    ['Thanks to ~, ~', '~ 덕분에 ~', 'Thanks to her, we finished the project early.']
  ] },
  { cat: '⚖️ 비교 · 장단점', items: [
    ['A is better than B', 'A가 B보다 나아요', 'Living in a city is better than living in the countryside.'],
    ['A is more ~ than B', 'A가 B보다 더 ~해요', 'Online shopping is more convenient than going to stores.'],
    ['The advantage of ~ is that ~', '~의 장점은 ~예요', 'The advantage of online classes is that they save time.'],
    ['The problem is that ~', '문제는 ~예요', 'The problem is that it is too expensive.'],
    ['On the other hand, ~', '반면에 ~', 'On the other hand, it can be stressful.']
  ] },
  { cat: '🏁 결론 · 마무리', items: [
    ['For these reasons, I think ~', '이런 이유로 ~라고 생각해요', 'For these reasons, I think internships are important.'],
    ['So, that\'s why I think so.', '그래서 그렇게 생각해요', 'So, that\'s why I think so.'],
    ['That\'s all. / Thank you.', '(시간이 남을 때) 이상이에요', '']
  ] },
  { cat: '⏳ 시간 벌기 (필러)', items: [
    ['Well, let me think.', '음, 생각해 볼게요', ''],
    ['That\'s a good question.', '좋은 질문이네요', ''],
    ['To be honest, ~', '솔직히 말하면 ~', 'To be honest, I don\'t exercise much.'],
    ['Actually, ~', '사실은 ~', 'Actually, I usually cook at home.']
  ] },
  { cat: '🖼️ Part 2 사진 묘사', items: [
    ['This picture was taken at/in ~', '이 사진은 ~에서 찍혔어요', 'This picture was taken in an office.'],
    ['The first thing I see is ~', '가장 먼저 보이는 것은 ~예요', 'The first thing I see is a woman holding a bag.'],
    ['On the left / right, ~', '왼쪽 / 오른쪽에는 ~', 'On the left, a man is sitting on a bench.'],
    ['In the background, ~', '배경에는 ~', 'In the background, there are some trees.'],
    ['He/She is wearing ~', '~을 입고 있어요', 'She is wearing a white shirt.'],
    ['It looks ~ / It seems like ~', '~해 보여요 / ~인 것 같아요', 'It seems like they are having a good time.']
  ] },
  { cat: '📋 Part 4 정보 전달', items: [
    ['The ~ will be held at/on ~', '~는 ~에서 / ~에 열려요', 'The meeting will be held on Friday.'],
    ['I\'m sorry, but that\'s not correct.', '죄송하지만 그건 틀린 정보예요', ''],
    ['It has been canceled / rescheduled to ~', '취소됐어요 / ~로 변경됐어요', 'It has been rescheduled to Monday.'],
    ['There are two ~. First, ~. Second, ~.', '~가 두 개 있어요. 첫째 ~ 둘째 ~', 'There are two sessions. First, ~. Second, ~.'],
    ['You don\'t have to ~', '~할 필요 없어요', 'You don\'t have to pay extra.'],
    ['I hope this helps.', '도움이 되셨으면 해요', '']
  ] }
];

const K = (st, adj, rs, vn, core) => ({ st, adj, rs, vn, core });
window.KITS = {
  't-online': K(
    [['I can ~ anytime, anywhere', '언제 어디서나 ~할 수 있어요', 'I can take classes anytime, anywhere.'], ['It is easy to ~ online', '온라인으로 ~하기 쉬워요', 'It is easy to compare prices online.'], ['I don\'t have to go out to ~', '~하러 나갈 필요가 없어요', 'I don\'t have to go out to shop.'], ['I can watch ~ again', '~를 다시 볼 수 있어요', 'I can watch the lectures again.'], ['It is hard to ~ without meeting in person', '직접 만나지 않으면 ~하기 어려워요', 'It is hard to focus without meeting in person.']],
    [['convenient', '편리한'], ['flexible', '유연한'], ['cheap / affordable', '저렴한'], ['time-saving', '시간을 아끼는'], ['effective', '효과적인'], ['distracting', '집중을 방해하는'], ['lonely', '외로운'], ['fast', '빠른']],
    [['시간 절약', 'save time'], ['비용 절약', 'save money'], ['반복 학습', 'review again and again'], ['가격 비교', 'compare prices'], ['집중력 저하', 'lose focus'], ['직접 확인 불가', 'can\'t check in person']],
    [['commute', '통학·통근하다'], ['replay', '다시 보다'], ['deliver', '배달하다'], ['return', '반품하다'], ['lecture', '강의'], ['review', '후기 / 복습'], ['discount', '할인'], ['interaction', '소통']],
    ['장점 = 시간·돈·편리함', '단점 = 집중력·직접 못 봄', '예시: 온라인 강의 반복 시청 → 점수 상승']),
  't-crowd': K(
    [['It is too crowded to ~', '너무 붐벼서 ~할 수 없어요', 'It is too crowded to relax.'], ['I don\'t have to wait in line', '줄 설 필요가 없어요', ''], ['I can enjoy ~ in peace', '편하게 ~를 즐길 수 있어요', 'I can enjoy the view in peace.'], ['There are many things to ~', '~할 것이 많아요', 'There are many things to see and do.']],
    [['crowded', '붐비는'], ['quiet', '조용한'], ['peaceful', '평화로운'], ['lively', '활기찬'], ['noisy', '시끄러운'], ['relaxing', '편안한'], ['exciting', '신나는'], ['tiring', '피곤한']],
    [['스트레스 해소', 'relieve stress'], ['대기 시간 없음', 'no waiting'], ['휴식', 'get some rest'], ['즐길 거리', 'many things to enjoy'], ['에너지 충전', 'recharge']],
    [['wait in line', '줄 서다'], ['relax', '쉬다'], ['tourist spot', '관광지'], ['atmosphere', '분위기'], ['event', '행사'], ['holiday', '연휴']],
    ['조용한 곳 = 휴식·스트레스↓', '붐비는 곳 = 활기·즐길 거리', '예시: 연휴 관광지 1시간 대기']),
  't-env': K(
    [['It is important to ~', '~하는 것이 중요해요', 'It is important to reduce waste.'], ['We should ~', '우리는 ~해야 해요', 'We should use fewer plastic bags.'], ['If everyone ~, ~', '모두가 ~하면 ~', 'If everyone recycles, the earth will be cleaner.'], ['Small actions can ~', '작은 행동이 ~할 수 있어요', 'Small actions can make a big difference.']],
    [['eco-friendly', '친환경적인'], ['harmful', '해로운'], ['clean', '깨끗한'], ['polluted', '오염된'], ['disposable', '일회용의'], ['reusable', '재사용 가능한'], ['serious', '심각한'], ['necessary', '필요한']],
    [['쓰레기 감소', 'reduce waste'], ['오염 방지', 'prevent pollution'], ['미래 세대', 'future generations'], ['건강 보호', 'protect our health'], ['모두 참여', 'everyone takes part']],
    [['recycle', '재활용하다'], ['reduce', '줄이다'], ['protect', '보호하다'], ['ban', '금지하다'], ['tumbler', '텀블러'], ['pollution', '오염'], ['law / rule', '법 / 규칙'], ['campaign', '캠페인']],
    ['개인 실천 + 기업·정부 역할', '예시: 회사 텀블러 → 컵 수천 개 절약']),
  't-tech': K(
    [['Thanks to ~, we can ~', '~ 덕분에 우리는 ~할 수 있어요', 'Thanks to smartphones, we can find information quickly.'], ['It makes our lives ~', '우리 삶을 ~하게 만들어요', 'It makes our lives easier.'], ['It helps us ~', '우리가 ~하도록 도와줘요', 'It helps us save time.'], ['We rely too much on ~', '우리는 ~에 너무 의존해요', 'We rely too much on our phones.']],
    [['convenient', '편리한'], ['efficient', '효율적인'], ['fast', '빠른'], ['smart', '똑똑한'], ['addictive', '중독성 있는'], ['useful', '유용한'], ['advanced', '발전된'], ['dangerous', '위험한']],
    [['시간 절약', 'save time'], ['정보 검색', 'find information'], ['업무 자동화', 'automate tasks'], ['소통 쉬움', 'communicate easily'], ['중독 위험', 'get addicted']],
    [['search', '검색하다'], ['automate', '자동화하다'], ['translate', '번역하다'], ['connect', '연결하다'], ['app', '앱'], ['device', '기기'], ['AI', '인공지능'], ['screen time', '화면 사용 시간']],
    ['장점 = 편리·효율·시간 절약', '단점 = 의존·중독', '예시: AI 번역 앱으로 업무 시간 절반']),
  't-intern': K(
    [['I can learn ~ that I can\'t learn from books', '책에서 못 배우는 ~를 배워요', 'I can learn skills that I can\'t learn from books.'], ['It helps me find out ~', '~를 알아내는 데 도움이 돼요', 'It helps me find out what I really want.'], ['Companies prefer people who ~', '회사는 ~한 사람을 선호해요', 'Companies prefer people who have experience.'], ['It is a good chance to ~', '~할 좋은 기회예요', 'It is a good chance to build my career.']],
    [['practical', '실용적인'], ['valuable', '가치 있는'], ['helpful', '도움이 되는'], ['experienced', '경험 있는'], ['real', '실제의'], ['professional', '전문적인'], ['useful', '유용한'], ['important', '중요한']],
    [['실무 능력', 'practical skills'], ['진로 결정', 'choose a career'], ['취업 유리', 'get a job easily'], ['팀워크 경험', 'teamwork experience'], ['자신감', 'confidence']],
    [['intern', '인턴(하다)'], ['apply', '지원하다'], ['graduate', '졸업하다'], ['career', '진로·경력'], ['interview', '면접'], ['resume', '이력서'], ['major', '전공'], ['deadline', '마감']],
    ['인턴 > 학점 (실무·진로·취업)', '예시: 마케팅 인턴 → 면접에서 어필']),
  't-learnenv': K(
    [['Students need ~ to study', '학생들은 공부하려면 ~가 필요해요', 'Students need a quiet place to study.'], ['Schools should provide ~', '학교는 ~를 제공해야 해요', 'Schools should provide more computers.'], ['It is hard to focus when ~', '~하면 집중하기 어려워요', 'It is hard to focus when the classroom is noisy.'], ['Teachers can pay attention to ~', '선생님이 ~에 신경 쓸 수 있어요', 'Teachers can pay attention to each student.']],
    [['quiet', '조용한'], ['comfortable', '편안한'], ['modern', '현대적인'], ['small (class)', '소규모의'], ['motivated', '의욕 있는'], ['helpful', '도움이 되는'], ['free', '무료의'], ['crowded', '붐비는']],
    [['집중력 향상', 'focus better'], ['개별 관심', 'individual attention'], ['동기 부여', 'motivate students'], ['자료 접근', 'access to materials'], ['성적 향상', 'get better grades']],
    [['library', '도서관'], ['study room', '자습실'], ['facility', '시설'], ['tablet', '태블릿'], ['material', '자료'], ['provide', '제공하다'], ['improve', '개선하다'], ['support', '지원하다']],
    ['시설·기술·소규모 수업', '예시: 24시간 도서관 → 시험 공부 효율']),
  't-remote': K(
    [['I don\'t have to commute', '출퇴근할 필요가 없어요', ''], ['I can work in a comfortable place', '편한 곳에서 일할 수 있어요', ''], ['It is easier to ~ in the office', '사무실에서 ~하기 더 쉬워요', 'It is easier to ask questions in the office.'], ['I can spend more time ~', '~에 더 많은 시간을 쓸 수 있어요', 'I can spend more time with my family.']],
    [['comfortable', '편안한'], ['flexible', '유연한'], ['productive', '생산적인'], ['lonely', '외로운'], ['efficient', '효율적인'], ['tiring', '피곤한'], ['quiet', '조용한'], ['stressful', '스트레스 받는']],
    [['출퇴근 시간 절약', 'save commuting time'], ['스트레스 감소', 'less stress'], ['일과 삶의 균형', 'work-life balance'], ['협업 쉬움(출근)', 'easy to collaborate'], ['방해 적음', 'fewer interruptions']],
    [['commute', '통근'], ['work from home', '재택근무하다'], ['collaborate', '협업하다'], ['coworker', '동료'], ['video call', '화상 통화'], ['schedule', '일정']],
    ['재택 = 시간·스트레스·집중', '출근 = 협업·소통', '예시: 하루 2시간 절약 → 운동 시작']),
  't-team': K(
    [['We can share ~', '우리는 ~를 공유할 수 있어요', 'We can share different ideas.'], ['We can divide ~', '~를 나눌 수 있어요', 'We can divide the work.'], ['I can work at my own pace', '내 속도로 일할 수 있어요', ''], ['It is easier to ~ together', '함께 ~하는 게 더 쉬워요', 'It is easier to solve problems together.']],
    [['cooperative', '협조적인'], ['creative', '창의적인'], ['efficient', '효율적인'], ['independent', '독립적인'], ['responsible', '책임감 있는'], ['helpful', '도움이 되는'], ['fast', '빠른'], ['difficult', '어려운']],
    [['다양한 아이디어', 'different ideas'], ['업무 분담', 'share the work'], ['빠른 완성', 'finish faster'], ['내 속도(혼자)', 'my own pace'], ['빠른 결정(혼자)', 'quick decisions']],
    [['divide', '나누다'], ['cooperate', '협력하다'], ['role', '역할'], ['project', '프로젝트'], ['result', '결과'], ['teammate', '팀원']],
    ['팀 = 아이디어·분담', '혼자 = 속도·결정', '예시: 팀 프로젝트 역할 분담 → A+']),
  't-leader': K(
    [['A good leader should ~', '좋은 리더는 ~해야 해요', 'A good leader should listen to others.'], ['It is important for a leader to ~', '리더가 ~하는 것이 중요해요', 'It is important for a leader to explain goals clearly.'], ['Team members can ~', '팀원들은 ~할 수 있어요', 'Team members can share their ideas freely.']],
    [['clear', '명확한'], ['honest', '정직한'], ['responsible', '책임감 있는'], ['decisive', '결단력 있는'], ['knowledgeable', '지식이 풍부한'], ['friendly', '친근한'], ['patient', '인내심 있는'], ['fair', '공정한']],
    [['명확한 목표', 'clear goals'], ['실수 감소', 'fewer mistakes'], ['신뢰', 'trust'], ['좋은 분위기', 'good atmosphere'], ['빠른 결정', 'quick decisions']],
    [['communicate', '소통하다'], ['listen', '듣다'], ['decide', '결정하다'], ['motivate', '동기를 주다'], ['feedback', '피드백'], ['goal', '목표']],
    ['소통 > 결단력 > 전문성 (선택형)', '예시: 매주 월요일 회의 → 조기 완료']),
  't-salary': K(
    [['If I enjoy my work, I can ~', '일이 즐거우면 ~할 수 있어요', 'If I enjoy my work, I can work for a long time.'], ['Money is important, but ~', '돈도 중요하지만 ~', 'Money is important, but health is more important.'], ['I can\'t work for a long time if ~', '~하면 오래 일할 수 없어요', 'I can\'t work for a long time if my job is stressful.']],
    [['satisfying', '만족스러운'], ['stressful', '스트레스 받는'], ['stable', '안정적인'], ['high-paying', '연봉이 높은'], ['meaningful', '의미 있는'], ['exhausting', '지치게 하는'], ['rewarding', '보람 있는'], ['happy', '행복한']],
    [['직업 만족', 'job satisfaction'], ['경제적 안정', 'financial stability'], ['번아웃 방지', 'avoid burnout'], ['동기 부여', 'stay motivated'], ['건강', 'health']],
    [['salary', '연봉'], ['benefit', '복지'], ['quit', '그만두다'], ['overtime', '야근'], ['career', '커리어'], ['passion', '열정']],
    ['만족도 > 연봉', '예시: 사촌 고연봉 퇴사 → 좋아하는 일로 행복']),
  't-kidsphone': K(
    [['Children can easily get addicted to ~', '아이들은 ~에 쉽게 중독돼요', 'Children can easily get addicted to games.'], ['It is better for children to ~', '아이들은 ~하는 게 더 좋아요', 'It is better for children to play outside.'], ['Parents can ~', '부모는 ~할 수 있어요', 'Parents can contact their kids anytime.']],
    [['addictive', '중독성 있는'], ['harmful', '해로운'], ['safe', '안전한'], ['young', '어린'], ['distracting', '방해되는'], ['social', '사회적인'], ['healthy', '건강한'], ['necessary', '필요한']],
    [['중독 위험', 'get addicted'], ['공부 방해', 'bad for studying'], ['대면 교류 감소', 'less time with friends'], ['안전 연락(찬성)', 'contact in an emergency'], ['건강 악화', 'bad for health']],
    [['screen time', '화면 사용 시간'], ['game', '게임'], ['grade', '성적'], ['limit', '제한하다'], ['contact', '연락하다'], ['eyesight', '시력']],
    ['반대 = 중독·공부·건강', '찬성 = 안전 연락', '예시: 조카 하루 3시간 영상 → 성적 하락']),
  't-transport': K(
    [['It takes ~ to get to ~', '~까지 ~ 걸려요', 'It takes thirty minutes to get to work.'], ['If the city ~, people will ~', '시가 ~하면 사람들이 ~할 거예요', 'If the city adds more buses, people will drive less.'], ['It is much cheaper than ~', '~보다 훨씬 저렴해요', 'It is much cheaper than driving.']],
    [['convenient', '편리한'], ['crowded', '붐비는'], ['fast', '빠른'], ['cheap', '저렴한'], ['eco-friendly', '친환경의'], ['frequent', '자주 오는'], ['safe', '안전한'], ['comfortable', '편안한']],
    [['교통 체증 감소', 'reduce traffic'], ['시간 절약', 'save time'], ['돈 절약', 'save money'], ['공기 오염 감소', 'less air pollution'], ['출퇴근 편리', 'easy commute']],
    [['subway', '지하철'], ['bus lane', '버스 전용차로'], ['rush hour', '출퇴근 시간'], ['traffic jam', '교통 체증'], ['fare', '요금'], ['station', '역']],
    ['대중교통 투자 = 시간·돈·환경', '예시: 새 지하철역 → 통근 1시간 → 30분']),
  't-health': K(
    [['I try to ~ every day', '매일 ~하려고 노력해요', 'I try to walk every day.'], ['It is good for ~', '~에 좋아요', 'It is good for my health.'], ['I feel ~ after ~', '~하고 나면 ~해요', 'I feel refreshed after exercising.']],
    [['healthy', '건강한'], ['energetic', '활기찬'], ['refreshed', '상쾌한'], ['fit', '건강한·탄탄한'], ['tired', '피곤한'], ['balanced', '균형 잡힌'], ['regular', '규칙적인'], ['stressed', '스트레스 받은']],
    [['스트레스 해소', 'relieve stress'], ['에너지 증가', 'more energy'], ['집중력 향상', 'focus better'], ['병 예방', 'prevent illness'], ['숙면', 'sleep better']],
    [['work out', '운동하다'], ['jog', '조깅하다'], ['diet', '식단'], ['gym', '헬스장'], ['sleep', '수면'], ['habit', '습관']],
    ['운동 = 몸 + 마음 + 업무 효율', '예시: 퇴근 후 30분 걷기 → 숙면']),
  't-city': K(
    [['There are more ~ in the city', '도시에 ~가 더 많아요', 'There are more job opportunities in the city.'], ['~ is close by', '~가 가까이 있어요', 'The hospital is close by.'], ['Life is ~ in the countryside', '시골의 삶은 ~해요', 'Life is slower in the countryside.']],
    [['convenient', '편리한'], ['busy', '바쁜'], ['noisy', '시끄러운'], ['peaceful', '평화로운'], ['expensive', '비싼'], ['fresh', '신선한·맑은'], ['safe', '안전한'], ['exciting', '신나는']],
    [['취업 기회', 'job opportunities'], ['편의시설', 'facilities'], ['맑은 공기', 'fresh air'], ['여유로운 삶', 'relaxed life'], ['비싼 집값', 'high housing prices']],
    [['facility', '시설'], ['opportunity', '기회'], ['neighborhood', '동네'], ['rent', '월세'], ['nature', '자연'], ['noise', '소음']],
    ['도시 = 기회·편리', '시골 = 자연·여유', '예시: 서울 이사 → 스터디로 영어 향상']),
  't-price': K(
    [['It lasts longer', '더 오래가요', ''], ['It is worth the money', '돈 값을 해요', ''], ['I have to stay within my budget', '예산 안에서 사야 해요', ''], ['In the long run, ~', '장기적으로 보면 ~', 'In the long run, it saves money.']],
    [['cheap', '싼'], ['expensive', '비싼'], ['high-quality', '고품질의'], ['durable', '튼튼한'], ['reasonable', '합리적인'], ['popular', '인기 있는'], ['reliable', '믿을 수 있는'], ['disappointing', '실망스러운']],
    [['오래 사용', 'last longer'], ['장기적 절약', 'save money in the long run'], ['고장 스트레스 없음', 'no stress'], ['예산 한도', 'limited budget'], ['가성비', 'value for money']],
    [['brand', '브랜드'], ['budget', '예산'], ['replace', '교체하다'], ['break down', '고장 나다'], ['review', '후기'], ['sale', '세일']],
    ['품질 > 가격 (장기 절약)', '예시: 싼 이어폰 3개월 고장']),
  't-travel': K(
    [['I want to ~ during my vacation', '휴가 때 ~하고 싶어요', 'I want to relax during my vacation.'], ['We can share ~', '~를 나눌 수 있어요', 'We can share the costs.'], ['I can travel on my own schedule', '내 일정대로 여행할 수 있어요', '']],
    [['relaxing', '편안한'], ['exciting', '신나는'], ['memorable', '기억에 남는'], ['expensive', '비싼'], ['free', '자유로운'], ['safe', '안전한'], ['beautiful', '아름다운'], ['tiring', '피곤한']],
    [['추억 공유', 'share memories'], ['비용 분담', 'split the cost'], ['자유로운 일정', 'free schedule'], ['스트레스 해소', 'relieve stress'], ['새로운 경험', 'new experiences']],
    [['destination', '여행지'], ['book', '예약하다'], ['itinerary', '일정표'], ['souvenir', '기념품'], ['local food', '현지 음식'], ['sightseeing', '관광']],
    ['친구와 = 추억·비용', '혼자 = 자유', '예시: 친구들과 제주 렌터카 비용 분담'])
};

window.TOPICS_EXTRA = [
  { id: 't-ad', cat: '생활 · 사회', emoji: '📢', title: '광고 · 마케팅', questions: ['Is advertising on social media effective?', 'Do advertisements influence what you buy?'],
    kit: K([['Advertisements make people ~', '광고는 사람들을 ~하게 만들어요', 'Advertisements make people want new things.'], ['I often buy things after ~', '~ 후에 자주 물건을 사요', 'I often buy things after watching reviews.'], ['It is easy to reach ~', '~에게 닿기 쉬워요', 'It is easy to reach many customers online.']],
      [['attractive', '매력적인'], ['creative', '창의적인'], ['annoying', '짜증 나는'], ['misleading', '오해를 부르는'], ['effective', '효과적인'], ['popular', '인기 있는'], ['cheap', '저렴한'], ['persuasive', '설득력 있는']],
      [['많은 사람에게 전달', 'reach many people'], ['저비용', 'low cost'], ['충동구매', 'impulse buying'], ['정보 제공', 'give information'], ['브랜드 인지도', 'brand awareness']],
      [['advertise', '광고하다'], ['customer', '고객'], ['influencer', '인플루언서'], ['review', '후기'], ['product', '제품'], ['promote', '홍보하다']],
      ['SNS 광고 = 저비용·많은 사람', '단점 = 충동구매·과장']) },
  { id: 't-food', cat: '환경 · 건강', emoji: '🥗', title: '음식 · 식습관', questions: ['Is it better to cook at home or eat out?', 'Should schools serve only healthy food?'],
    kit: K([['It is healthier to ~', '~하는 게 더 건강해요', 'It is healthier to cook at home.'], ['I can choose ~ myself', '~를 직접 고를 수 있어요', 'I can choose fresh ingredients myself.'], ['It is too ~ to ~', '너무 ~해서 ~할 수 없어요', 'I am too busy to cook every day.']],
      [['healthy', '건강한'], ['delicious', '맛있는'], ['fresh', '신선한'], ['greasy', '기름진'], ['salty', '짠'], ['homemade', '집에서 만든'], ['quick', '빠른'], ['expensive', '비싼']],
      [['건강', 'health'], ['돈 절약', 'save money'], ['신선한 재료', 'fresh ingredients'], ['시간 절약(외식)', 'save time'], ['다양한 메뉴', 'various menus']],
      [['cook', '요리하다'], ['order', '주문하다'], ['ingredient', '재료'], ['recipe', '요리법'], ['delivery', '배달'], ['snack', '간식']],
      ['집밥 = 건강·절약', '외식 = 시간·편리']) },
  { id: 't-money', cat: '생활 · 사회', emoji: '💳', title: '돈 · 저축 · 소비', questions: ['Is it better to save money or spend it now?', 'Should young people learn how to manage money?'],
    kit: K([['It is wise to ~', '~하는 것이 현명해요', 'It is wise to save money for the future.'], ['I feel safe when ~', '~할 때 안심돼요', 'I feel safe when I have savings.'], ['You never know when ~', '언제 ~할지 몰라요', 'You never know when you will need money.']],
      [['wise', '현명한'], ['safe', '안전한'], ['stable', '안정적인'], ['careful', '신중한'], ['wasteful', '낭비하는'], ['necessary', '필요한'], ['expensive', '비싼'], ['worried', '걱정하는']],
      [['비상금', 'emergency fund'], ['미래 대비', 'prepare for the future'], ['스트레스 감소', 'less stress'], ['경험 투자', 'invest in experiences'], ['경제적 자유', 'financial freedom']],
      [['save', '저축하다'], ['spend', '쓰다'], ['budget', '예산'], ['savings', '저축액'], ['invest', '투자하다'], ['bill', '청구서']],
      ['저축 = 비상시·안심', '예시: 차 고장 → 저축으로 수리']) },
  { id: 't-pet', cat: '생활 · 사회', emoji: '🐶', title: '반려동물', questions: ['What are the advantages of having a pet?', 'Should pets be allowed in offices?'],
    kit: K([['It makes me feel ~', '저를 ~하게 해 줘요', 'It makes me feel less lonely.'], ['I have to ~ every day', '매일 ~해야 해요', 'I have to walk my dog every day.'], ['It is a big responsibility to ~', '~하는 건 큰 책임이에요', 'It is a big responsibility to raise a pet.']],
      [['cute', '귀여운'], ['loyal', '충성스러운'], ['lonely', '외로운'], ['responsible', '책임감 있는'], ['active', '활동적인'], ['calm', '차분한'], ['expensive', '돈이 드는'], ['happy', '행복한']],
      [['스트레스 감소', 'reduce stress'], ['외로움 해소', 'feel less lonely'], ['운동 습관', 'exercise more'], ['책임감', 'learn responsibility'], ['비용 부담', 'costs a lot']],
      [['walk a dog', '개를 산책시키다'], ['feed', '먹이를 주다'], ['vet', '수의사'], ['adopt', '입양하다'], ['owner', '주인'], ['animal hospital', '동물병원']],
      ['장점 = 스트레스↓·운동', '예시: 퇴근 후 반겨 주는 강아지']) },
  { id: 't-volunteer', cat: '생활 · 사회', emoji: '🙌', title: '봉사 활동', questions: ['Should students be required to do volunteer work?', 'What are the benefits of volunteering?'],
    kit: K([['It is a great way to ~', '~하는 좋은 방법이에요', 'It is a great way to help others.'], ['I learned ~ through ~', '~를 통해 ~를 배웠어요', 'I learned patience through volunteering.'], ['It makes me feel ~', '~한 기분이 들게 해요', 'It makes me feel proud.']],
      [['meaningful', '의미 있는'], ['rewarding', '보람 있는'], ['proud', '뿌듯한'], ['helpful', '도움이 되는'], ['grateful', '감사하는'], ['kind', '친절한'], ['busy', '바쁜'], ['valuable', '가치 있는']],
      [['보람', 'feel rewarded'], ['사회 경험', 'social experience'], ['새로운 인연', 'meet new people'], ['책임감', 'responsibility'], ['이력서 도움', 'good for a resume']],
      [['volunteer', '봉사하다'], ['community', '지역사회'], ['donate', '기부하다'], ['charity', '자선단체'], ['elderly', '노인'], ['help out', '돕다']],
      ['봉사 = 보람·경험·인연', '예시: 대학 때 아이들 공부 봉사']) },
  { id: 't-reading', cat: '교육 · 커리어', emoji: '📖', title: '독서 · 자기계발', questions: ['Is reading books still important today?', 'Do you prefer paper books or e-books?'],
    kit: K([['Reading helps me ~', '독서는 ~하는 데 도움이 돼요', 'Reading helps me learn new words.'], ['I can carry ~ in my phone', '폰 안에 ~를 가지고 다닐 수 있어요', 'I can carry hundreds of books in my phone.'], ['It is easier to focus on ~', '~에 집중하기 더 쉬워요', 'It is easier to focus on paper books.']],
      [['interesting', '흥미로운'], ['educational', '교육적인'], ['portable', '휴대하기 좋은'], ['relaxing', '편안한'], ['boring', '지루한'], ['heavy', '무거운'], ['convenient', '편리한'], ['imaginative', '상상력이 풍부한']],
      [['지식 습득', 'gain knowledge'], ['스트레스 해소', 'relieve stress'], ['어휘력', 'vocabulary'], ['상상력', 'imagination'], ['휴대성(전자책)', 'easy to carry']],
      [['novel', '소설'], ['e-book', '전자책'], ['author', '작가'], ['borrow', '빌리다'], ['library', '도서관'], ['chapter', '장']],
      ['독서 = 지식·휴식', '전자책 = 휴대·편리']) }
];
