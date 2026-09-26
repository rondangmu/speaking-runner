/* =========================================================
   주제별 공략 데이터
   - UNIVERSAL: 어떤 질문에도 꺼내 쓸 수 있는 "만능 이유"
   - TOPICS: Part 3·5 빈출 주제별 답변 소스 카드
   ========================================================= */

window.UNIVERSAL = [
  { id: 'u-time', emoji: '⏰', ko: '시간 절약', en: `It saves a lot of time, so I can use that time for more important things.`, plus: `For example, I don't have to spend an hour commuting.` },
  { id: 'u-money', emoji: '💰', ko: '돈 절약', en: `It helps me save money, which is really important for students and young workers.`, plus: `I can spend the money I save on things I really need.` },
  { id: 'u-stress', emoji: '😌', ko: '스트레스 감소', en: `It reduces stress, so I can stay focused and feel more relaxed.`, plus: `When I'm less stressed, I perform much better.` },
  { id: 'u-efficiency', emoji: '⚡', ko: '효율 · 생산성', en: `It makes people more productive and efficient.`, plus: `They can get more work done in less time.` },
  { id: 'u-skill', emoji: '🛠️', ko: '경험 · 실무 능력', en: `It gives people practical experience and skills that they can't learn from books.`, plus: `These skills are very helpful when they start working.` },
  { id: 'u-relation', emoji: '🤝', ko: '소통 · 인간관계', en: `It helps people communicate better and build good relationships.`, plus: `Good relationships make life and work much more enjoyable.` },
  { id: 'u-convenient', emoji: '📱', ko: '편리함', en: `It's very convenient because I can do it anytime and anywhere.`, plus: `I don't have to worry about opening hours or location.` },
  { id: 'u-health', emoji: '💪', ko: '건강', en: `It's good for both our physical and mental health.`, plus: `Staying healthy is the most important thing in life.` }
];

window.TOPICS = [
  {
    id: 't-online', cat: '기술 · 온라인', emoji: '💻', title: '온라인 vs 오프라인 (장단점)',
    questions: ['Online classes are as effective as classroom classes.', 'Do you prefer shopping online or in stores?', 'Is it better to meet people in person or online?'],
    core: { ko: '온라인은 시간과 돈을 아껴 주고, 언제 어디서나 가능하다.', en: `Doing things online saves time and money, and we can do them anytime, anywhere.` },
    points: [
      { label: '장점 ①', ko: '통학·이동 시간이 없어 그 시간에 다른 일을 할 수 있다.', en: `Since there's no need to commute, I can use that time for other things.` },
      { label: '장점 ②', ko: '가격 비교가 쉽고 할인 혜택이 많다.', en: `It's easy to compare prices, and there are many online-only discounts.` },
      { label: '장점 ③', ko: '녹화 강의를 여러 번 다시 볼 수 있다.', en: `I can replay recorded lectures as many times as I want.` },
      { label: '단점 ①', ko: '직접 보고 만져볼 수 없어 실패할 수 있다.', en: `I can't see or touch the product in person, so I might be disappointed.` },
      { label: '단점 ②', ko: '대면 소통이 부족해 집중력이 떨어질 수 있다.', en: `Without face-to-face interaction, it's easy to lose focus.` }
    ],
    example: { ko: '작년에 온라인 영어 강의를 들으며 어려운 부분을 반복해서 봤고, 점수가 30점 올랐다.', en: `Last year, I took an online English course and rewatched the difficult parts several times. As a result, my score went up by thirty points.` },
    expressions: [
      { en: 'save time and money', ko: '시간과 돈을 절약하다' },
      { en: 'anytime, anywhere', ko: '언제 어디서나' },
      { en: 'face-to-face interaction', ko: '대면 소통' },
      { en: 'compare prices', ko: '가격을 비교하다' },
      { en: 'free returns', ko: '무료 반품' }
    ]
  },
  {
    id: 't-crowd', cat: '생활 · 사회', emoji: '👥', title: '사람 많은 곳 vs 적은 곳',
    questions: ['Do you prefer to visit crowded places or quiet places?', 'Would you rather live in a busy area or a quiet area?', 'Do you prefer working in a large company or a small company?'],
    core: { ko: '조용한 곳이 스트레스가 적고 집중하기 좋다. (반대: 붐비는 곳은 활기차고 즐길 거리가 많다.)', en: `I prefer quiet places because they're less stressful and I can focus better.` },
    points: [
      { label: '적은 곳 ①', ko: '줄 서서 기다릴 필요가 없어 시간이 절약된다.', en: `I don't have to wait in long lines, so I can save time.` },
      { label: '적은 곳 ②', ko: '편하게 쉬면서 스트레스를 풀 수 있다.', en: `I can relax and relieve my stress in a peaceful environment.` },
      { label: '많은 곳 ①', ko: '활기찬 분위기에서 에너지를 얻는다.', en: `I get a lot of energy from the lively atmosphere.` },
      { label: '많은 곳 ②', ko: '가게·식당 등 즐길 거리와 편의시설이 많다.', en: `There are many things to enjoy, like shops, restaurants, and events.` }
    ],
    example: { ko: '지난 연휴에 유명 관광지에 갔다가 사람이 너무 많아 한 시간 넘게 줄을 섰고 오히려 더 피곤해졌다.', en: `During the last holiday, I visited a famous tourist spot, but it was so crowded that I had to wait in line for over an hour. I came back even more tired.` },
    expressions: [
      { en: 'wait in a long line', ko: '긴 줄을 서다' },
      { en: 'peaceful / lively atmosphere', ko: '평화로운 / 활기찬 분위기' },
      { en: 'packed with people', ko: '사람들로 꽉 찬' },
      { en: 'recharge my batteries', ko: '재충전하다' }
    ]
  },
  {
    id: 't-env', cat: '환경 · 건강', emoji: '🌱', title: '환경 보호',
    questions: ['Should companies be responsible for protecting the environment?', 'What is the best way to protect the environment?', 'Should the government ban single-use plastics?'],
    core: { ko: '작은 실천이 모이면 환경을 지키고 미래 세대를 보호할 수 있다.', en: `Small actions add up, and they can protect the environment for future generations.` },
    points: [
      { label: '이유 ①', ko: '일회용품을 줄이면 쓰레기와 오염이 크게 줄어든다.', en: `Using fewer disposable products greatly reduces waste and pollution.` },
      { label: '이유 ②', ko: '기업은 영향력이 커서 변화가 빠르게 퍼진다.', en: `Companies have a big influence, so their changes spread quickly.` },
      { label: '이유 ③', ko: '정부 규제가 있어야 모두가 참여하게 된다.', en: `Government rules make sure that everyone takes part.` }
    ],
    example: { ko: '우리 회사는 작년에 종이컵을 없애고 텀블러를 나눠 줬는데, 한 달에 수천 개의 컵을 줄였다.', en: `Last year, my company stopped using paper cups and gave everyone a tumbler. As a result, we cut down on thousands of cups every month.` },
    expressions: [
      { en: 'disposable / single-use products', ko: '일회용품' },
      { en: 'reduce waste', ko: '쓰레기를 줄이다' },
      { en: 'future generations', ko: '미래 세대' },
      { en: 'eco-friendly', ko: '친환경적인' },
      { en: 'raise awareness', ko: '인식을 높이다' }
    ]
  },
  {
    id: 't-tech', cat: '기술 · 온라인', emoji: '🤖', title: '기술 발전 (스마트폰 · AI)',
    questions: ['Has technology made our lives better?', 'Do you think AI will replace many jobs?', 'Has the smartphone improved communication?'],
    core: { ko: '기술 덕분에 삶이 더 편리하고 효율적이 되었다.', en: `Thanks to technology, our lives have become much more convenient and efficient.` },
    points: [
      { label: '장점 ①', ko: '정보를 몇 초 만에 찾을 수 있다.', en: `We can find information in just a few seconds.` },
      { label: '장점 ②', ko: '반복 업무를 자동화해 중요한 일에 집중할 수 있다.', en: `Technology automates repetitive tasks, so we can focus on more important work.` },
      { label: '장점 ③', ko: '멀리 있는 사람과도 쉽게 연락할 수 있다.', en: `We can easily stay in touch with people who live far away.` },
      { label: '단점', ko: '스마트폰에 너무 의존하면 대면 소통이 줄어든다.', en: `If we rely too much on smartphones, we spend less time talking face to face.` }
    ],
    example: { ko: '요즘 AI 번역 앱으로 해외 고객 이메일을 금방 처리해서 업무 시간이 절반으로 줄었다.', en: `These days, I use an AI translation app to handle emails from overseas clients, and it has cut my work time in half.` },
    expressions: [
      { en: 'make our lives easier', ko: '삶을 편하게 만들다' },
      { en: 'automate repetitive tasks', ko: '반복 업무를 자동화하다' },
      { en: 'rely on / depend on', ko: '~에 의존하다' },
      { en: 'stay in touch with', ko: '~와 연락하고 지내다' }
    ]
  },
  {
    id: 't-intern', cat: '교육 · 커리어', emoji: '🎓', title: '인턴십 · 실무 경험의 필요성',
    questions: ['Internship experience is more important than good grades.', 'Should students get part-time jobs?', 'Is work experience more important than education?'],
    core: { ko: '실무 경험은 책에서 배울 수 없는 능력을 키워주고, 진로를 정하는 데 도움이 된다.', en: `Work experience teaches skills you can't learn from books, and it helps you choose the right career.` },
    points: [
      { label: '이유 ①', ko: '팀워크·마감 관리 같은 실무 능력을 배운다.', en: `Students learn practical skills like teamwork and meeting deadlines.` },
      { label: '이유 ②', ko: '졸업 전에 그 일이 적성에 맞는지 확인할 수 있다.', en: `They can find out if the job really suits them before they graduate.` },
      { label: '이유 ③', ko: '기업은 경험 있는 지원자를 선호한다.', en: `Companies prefer applicants who already have work experience.` }
    ],
    example: { ko: '지난여름 마케팅 인턴을 하며 데이터 분석이 적성에 맞는다는 걸 알았고, 면접에서 그 경험으로 좋은 평가를 받았다.', en: `Last summer, I interned at a marketing agency and realized that I love analyzing data. That experience really impressed the interviewers in my job interviews.` },
    expressions: [
      { en: 'hands-on experience', ko: '실무 경험' },
      { en: 'career path', ko: '진로' },
      { en: 'suit someone', ko: '~에게 맞다' },
      { en: 'stand out', ko: '돋보이다' }
    ]
  },
  {
    id: 't-learnenv', cat: '교육 · 커리어', emoji: '🏫', title: '학생 학습 환경 개선',
    questions: ['What is the best way for schools to improve students\' learning?', 'Should schools spend money on technology or teachers?', 'Should schools provide more study spaces?'],
    core: { ko: '좋은 학습 환경(시설·자료·지원)이 학생의 동기와 성과를 높인다.', en: `A good learning environment motivates students and improves their performance.` },
    points: [
      { label: '방법 ①', ko: '조용하고 쾌적한 자습 공간을 늘린다.', en: `Schools should provide more quiet and comfortable study spaces.` },
      { label: '방법 ②', ko: '온라인 자료·태블릿 등 최신 기술을 제공한다.', en: `Schools should offer up-to-date technology like tablets and online materials.` },
      { label: '방법 ③', ko: '학급 인원을 줄여 선생님이 학생 한 명 한 명에 집중하게 한다.', en: `Smaller classes let teachers pay attention to each student.` }
    ],
    example: { ko: '대학교 때 24시간 도서관이 생긴 뒤로 시험 기간에 훨씬 효율적으로 공부할 수 있었다.', en: `When my university opened a 24-hour library, I was able to study much more efficiently during exam periods.` },
    expressions: [
      { en: 'learning environment', ko: '학습 환경' },
      { en: 'motivate students', ko: '학생에게 동기를 부여하다' },
      { en: 'up-to-date facilities', ko: '최신 시설' },
      { en: 'individual attention', ko: '개별적인 관심' }
    ]
  },
  {
    id: 't-remote', cat: '직장', emoji: '🏠', title: '재택근무 vs 출근',
    questions: ['Companies should allow employees to work from home.', 'Do you prefer working from home or at the office?'],
    core: { ko: '재택근무는 출퇴근 시간을 없애 효율과 만족도를 높인다.', en: `Working from home removes commuting time, which increases both efficiency and job satisfaction.` },
    points: [
      { label: '재택 ①', ko: '출퇴근 시간이 없어 피로가 줄고 시간 여유가 생긴다.', en: `Without commuting, employees feel less tired and have more free time.` },
      { label: '재택 ②', ko: '방해가 적어 집중하기 좋다.', en: `There are fewer interruptions, so it's easier to concentrate.` },
      { label: '출근 ①', ko: '동료와 바로 소통할 수 있어 협업이 쉽다.', en: `We can talk to coworkers right away, so collaboration is easier.` }
    ],
    example: { ko: '코로나 기간 재택근무를 할 때 매일 두 시간의 출퇴근 시간을 아껴 운동을 시작할 수 있었다.', en: `When I worked from home during the pandemic, I saved two hours of commuting every day, so I was able to start exercising.` },
    expressions: [
      { en: 'commute', ko: '통근(하다)' },
      { en: 'work-life balance', ko: '일과 삶의 균형' },
      { en: 'interruptions', ko: '방해 요소' },
      { en: 'collaborate with', ko: '~와 협업하다' }
    ]
  },
  {
    id: 't-team', cat: '직장', emoji: '🧩', title: '팀워크 vs 혼자 일하기',
    questions: ['Do you prefer working alone or in a team?', 'Is teamwork more important than individual ability?'],
    core: { ko: '팀으로 일하면 다양한 아이디어가 모이고 업무를 나눌 수 있다.', en: `Working in a team brings together different ideas and lets us share the workload.` },
    points: [
      { label: '팀 ①', ko: '서로 다른 관점에서 더 좋은 아이디어가 나온다.', en: `Different perspectives lead to better ideas.` },
      { label: '팀 ②', ko: '일을 나눠서 빨리 끝낼 수 있다.', en: `We can divide the work and finish it faster.` },
      { label: '혼자 ①', ko: '내 속도로 일하고 결정이 빠르다.', en: `I can work at my own pace and make decisions quickly.` }
    ],
    example: { ko: '대학 팀 프로젝트에서 디자인을 잘하는 친구와 분석을 잘하는 내가 역할을 나눠 A+를 받았다.', en: `In a university team project, a friend who was good at design and I, who was good at analysis, divided our roles, and we got an A+.` },
    expressions: [
      { en: 'share the workload', ko: '업무를 분담하다' },
      { en: 'different perspectives', ko: '다양한 관점' },
      { en: 'at my own pace', ko: '내 속도대로' },
      { en: 'bounce ideas off each other', ko: '서로 아이디어를 주고받다' }
    ]
  },
  {
    id: 't-leader', cat: '직장', emoji: '🧭', title: '리더 · 상사의 자질',
    questions: ['What is the most important quality for a leader?', 'What makes a good manager?'],
    core: { ko: '좋은 리더는 잘 소통하고 팀원의 의견을 경청한다.', en: `A good leader communicates clearly and listens to team members.` },
    points: [
      { label: '소통', ko: '목표를 명확히 공유해 실수를 줄인다.', en: `Clear communication keeps everyone on the same page and prevents mistakes.` },
      { label: '결단력', ko: '위기 상황에서 빠르게 결정해 시간을 아낀다.', en: `Quick decisions in difficult situations save time and resources.` },
      { label: '전문성', ko: '업무 지식이 있어야 팀원에게 신뢰를 준다.', en: `Deep job knowledge earns the team's trust and respect.` }
    ],
    example: { ko: '인턴 때 팀장님이 매주 월요일 짧은 회의로 의견을 물어봐 준 덕분에 프로젝트를 일주일 일찍 끝냈다.', en: `During my internship, my manager held a short meeting every Monday and asked for our opinions. Thanks to that, we finished our project a week early.` },
    expressions: [
      { en: 'on the same page', ko: '같은 이해를 공유하는' },
      { en: 'earn trust', ko: '신뢰를 얻다' },
      { en: 'speak up', ko: '의견을 말하다' },
      { en: 'lead by example', ko: '솔선수범하다' }
    ]
  },
  {
    id: 't-salary', cat: '직장', emoji: '💼', title: '연봉 vs 적성 · 만족도',
    questions: ['When choosing a job, is salary the most important factor?', 'Would you choose a high-paying job or an interesting job?'],
    core: { ko: '오래 일하려면 연봉보다 적성과 만족도가 중요하다.', en: `To work for a long time, job satisfaction matters more than salary.` },
    points: [
      { label: '적성 ①', ko: '좋아하는 일을 하면 동기부여가 되고 성과도 좋다.', en: `When you enjoy your work, you stay motivated and perform better.` },
      { label: '적성 ②', ko: '연봉이 높아도 스트레스가 크면 오래 못 다닌다.', en: `Even with a high salary, you can't last long in a stressful job.` },
      { label: '연봉', ko: '경제적 안정은 삶의 기본이다.', en: `Financial stability is the foundation of a comfortable life.` }
    ],
    example: { ko: '연봉이 높은 회사에 다니던 사촌은 야근 스트레스로 1년 만에 그만두고, 지금은 적성에 맞는 일을 하며 훨씬 행복해한다.', en: `My cousin quit a high-paying job after just one year because of the stress from working overtime. Now he's doing work he enjoys, and he's much happier.` },
    expressions: [
      { en: 'job satisfaction', ko: '직업 만족도' },
      { en: 'financial stability', ko: '경제적 안정' },
      { en: 'work overtime', ko: '야근하다' },
      { en: 'burn out', ko: '번아웃되다' }
    ]
  },
  {
    id: 't-kidsphone', cat: '기술 · 온라인', emoji: '📵', title: '아이들의 스마트폰 · SNS 사용',
    questions: ['Should children under 12 be allowed to have smartphones?', 'Has social media had a positive effect on young people?'],
    core: { ko: '어린 나이의 스마트폰 사용은 학습과 건강에 방해가 될 수 있다.', en: `Using smartphones at a young age can get in the way of learning and health.` },
    points: [
      { label: '반대 ①', ko: '게임·영상에 빠져 공부에 집중하기 어렵다.', en: `Kids can easily get addicted to games and videos, so it's hard for them to focus on studying.` },
      { label: '반대 ②', ko: '밖에서 놀거나 친구와 직접 어울리는 시간이 줄어든다.', en: `They spend less time playing outside and interacting with friends in person.` },
      { label: '찬성', ko: '비상시 부모와 연락할 수 있어 안전하다.', en: `Parents can contact their kids in an emergency, so it's safer.` }
    ],
    example: { ko: '조카가 스마트폰을 받은 뒤로 하루 3시간 넘게 영상을 보면서 성적이 떨어졌다.', en: `After my nephew got a smartphone, he started watching videos for more than three hours a day, and his grades dropped.` },
    expressions: [
      { en: 'get addicted to', ko: '~에 중독되다' },
      { en: 'screen time', ko: '화면 사용 시간' },
      { en: 'in an emergency', ko: '비상시에' },
      { en: 'get in the way of', ko: '~에 방해가 되다' }
    ]
  },
  {
    id: 't-transport', cat: '생활 · 사회', emoji: '🚇', title: '대중교통 · 도시 시설',
    questions: ['What should the city spend money on: public transportation or parks?', 'How can cities reduce traffic?'],
    core: { ko: '대중교통에 투자하면 교통 체증·환경 문제·시간 낭비를 한 번에 줄인다.', en: `Investing in public transportation reduces traffic, pollution, and wasted time all at once.` },
    points: [
      { label: '이유 ①', ko: '자가용이 줄어 교통 체증이 줄어든다.', en: `Fewer people drive, so there's less traffic congestion.` },
      { label: '이유 ②', ko: '배기가스가 줄어 공기가 깨끗해진다.', en: `There are fewer car emissions, so the air gets cleaner.` },
      { label: '이유 ③', ko: '출퇴근 시간이 줄고 비용도 아낀다.', en: `People can save both time and money on their commute.` }
    ],
    example: { ko: '우리 동네에 지하철역이 새로 생긴 뒤로 출근 시간이 한 시간에서 30분으로 줄었다.', en: `After a new subway station opened in my neighborhood, my commute went from an hour to just thirty minutes.` },
    expressions: [
      { en: 'traffic congestion', ko: '교통 체증' },
      { en: 'rush hour', ko: '출퇴근 시간' },
      { en: 'within walking distance', ko: '걸어갈 수 있는 거리에' },
      { en: 'invest in', ko: '~에 투자하다' }
    ]
  },
  {
    id: 't-health', cat: '환경 · 건강', emoji: '🏃', title: '건강 · 운동 습관',
    questions: ['What is the best way to stay healthy?', 'Should companies provide fitness programs for employees?'],
    core: { ko: '규칙적인 운동은 몸과 마음의 건강을 지키고 업무 효율도 높인다.', en: `Regular exercise keeps both body and mind healthy, and it even boosts work performance.` },
    points: [
      { label: '이유 ①', ko: '스트레스를 풀고 기분이 좋아진다.', en: `It relieves stress and puts me in a better mood.` },
      { label: '이유 ②', ko: '체력이 좋아져 일에 더 집중할 수 있다.', en: `It gives me more energy, so I can concentrate better at work.` },
      { label: '회사 지원', ko: '회사 헬스 프로그램은 직원 만족도와 생산성을 높인다.', en: `Company fitness programs increase employee satisfaction and productivity.` }
    ],
    example: { ko: '퇴근 후 30분씩 걷기 시작한 뒤로 잠도 잘 자고 업무 중 피로도 줄었다.', en: `Since I started walking for thirty minutes after work, I sleep much better and feel less tired during the day.` },
    expressions: [
      { en: 'stay in shape', ko: '몸매·건강을 유지하다' },
      { en: 'relieve stress', ko: '스트레스를 풀다' },
      { en: 'boost productivity', ko: '생산성을 높이다' },
      { en: 'a balanced diet', ko: '균형 잡힌 식단' }
    ]
  },
  {
    id: 't-city', cat: '생활 · 사회', emoji: '🏙️', title: '도시 vs 시골 생활',
    questions: ['Is it better to live in a city or in the countryside?', 'Would you prefer to raise children in a city or a small town?'],
    core: { ko: '도시는 기회와 편의시설이 많고, 시골은 여유롭고 건강한 삶이 가능하다.', en: `Cities offer more opportunities and facilities, while the countryside offers a relaxed and healthy life.` },
    points: [
      { label: '도시 ①', ko: '일자리와 교육 기회가 많다.', en: `There are more job and education opportunities.` },
      { label: '도시 ②', ko: '병원·쇼핑 등 편의시설이 가까워 편리하다.', en: `Hospitals, stores, and other facilities are close by, so it's convenient.` },
      { label: '시골', ko: '공기가 맑고 조용해 스트레스가 적다.', en: `The air is clean and it's quiet, so life is less stressful.` }
    ],
    example: { ko: '서울로 이사 온 뒤 다양한 스터디 모임과 강의에 참여할 수 있어서 영어 실력이 빨리 늘었다.', en: `After I moved to Seoul, I could join many study groups and classes, so my English improved quickly.` },
    expressions: [
      { en: 'job opportunities', ko: '취업 기회' },
      { en: 'close by', ko: '가까이에' },
      { en: 'a slower pace of life', ko: '느긋한 생활 속도' },
      { en: 'fresh air', ko: '맑은 공기' }
    ]
  },
  {
    id: 't-price', cat: '생활 · 사회', emoji: '🛍️', title: '가격 vs 품질 (쇼핑)',
    questions: ['When buying something, is price or quality more important?', 'Do you prefer famous brands or cheaper products?'],
    core: { ko: '품질 좋은 제품은 오래 써서 결국 돈을 아끼게 해 준다.', en: `High-quality products last longer, so they actually save money in the long run.` },
    points: [
      { label: '품질 ①', ko: '자주 바꿀 필요가 없어 장기적으로 더 경제적이다.', en: `I don't have to replace them often, so they're cheaper in the long run.` },
      { label: '품질 ②', ko: '고장이 적어 스트레스가 없다.', en: `They rarely break down, so I don't have to deal with the stress.` },
      { label: '가격', ko: '학생이라 예산 안에서 사는 게 중요하다.', en: `As a student, staying within my budget is important.` }
    ],
    example: { ko: '싼 이어폰을 샀다가 3개월 만에 고장 나서 결국 좋은 제품을 다시 샀다. 처음부터 좋은 걸 살 걸 그랬다.', en: `I once bought cheap earphones, but they broke after three months, so I had to buy a better pair anyway. I should have bought the good ones from the start.` },
    expressions: [
      { en: 'in the long run', ko: '장기적으로' },
      { en: 'value for money', ko: '가성비' },
      { en: 'within my budget', ko: '예산 안에서' },
      { en: 'break down', ko: '고장 나다' }
    ]
  },
  {
    id: 't-travel', cat: '생활 · 사회', emoji: '✈️', title: '여행 · 여가',
    questions: ['Do you prefer traveling alone or with others?', 'Is it better to travel to many places or stay in one place?', 'What do you usually do on weekends?'],
    core: { ko: '여행과 여가는 스트레스를 풀고 새로운 경험을 쌓게 해 준다.', en: `Travel and leisure activities relieve stress and give us new experiences.` },
    points: [
      { label: '함께 ①', ko: '추억을 공유하고 비용을 나눌 수 있다.', en: `We can share memories and split the costs.` },
      { label: '혼자 ①', ko: '내 일정대로 자유롭게 다닐 수 있다.', en: `I can travel freely on my own schedule.` },
      { label: '한 곳', ko: '한 곳에 오래 머물면 여유롭게 현지 문화를 즐긴다.', en: `Staying in one place lets me enjoy the local culture without rushing.` }
    ],
    example: { ko: '작년에 친구들과 제주도에 가서 렌터카 비용을 나눴고, 지금도 그때 사진을 보며 이야기한다.', en: `Last year, I went to Jeju Island with my friends and we split the cost of a rental car. We still talk about that trip whenever we look at the photos.` },
    expressions: [
      { en: 'split the cost', ko: '비용을 나누다' },
      { en: 'on my own schedule', ko: '내 일정대로' },
      { en: 'make memories', ko: '추억을 만들다' },
      { en: 'get away from it all', ko: '일상에서 벗어나다' }
    ]
  }
];
