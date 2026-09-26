/* =========================================================
   파트 안내 + 문제은행 뼈대
   - 문제는 파트별 파일(data-p1.js ~ data-p5.js)에 들어 있어요.
   - 모든 문제는 실제 시험 형식과 자주 나오는 주제 경향을 반영해 새로 작성한 오리지널 문제예요.
   - 모범답안은 "템플릿 문장 + 내용 조각" 구조라 파트마다 같은 뼈대로 외울 수 있어요.
   ========================================================= */
window.BANK = { part1: [], part2: [], part3: [], part4: [], part5: [] };

window.PART_INFO = {
  1: {
    name: 'Part 1', title: '문장 읽기', en: 'Read a text aloud', qnums: 'Q1–2',
    prep: 45, resp: [45],
    criteria: ['발음', '억양과 강세'],
    tips: [
      '끊어 읽기(/)는 의미 단위로! 쉼표·접속사·전치사구 앞에서 짧게 쉬어요.',
      '나열(A, B, and C)은 A↗ B↗ and C↘ 억양으로 읽어요.',
      '고유명사·숫자는 준비시간에 미리 입으로 연습해 두세요.',
      '내용어(명사·동사·형용사)는 세게, 기능어(a, the, of)는 약하게.',
      '틀렸으면 멈추지 말고 그 단어만 다시 읽고 이어가요.'
    ],
    template: []
  },
  2: {
    name: 'Part 2', title: '사진 묘사', en: 'Describe a picture', qnums: 'Q3–4',
    prep: 45, resp: [30],
    criteria: ['발음', '억양과 강세', '문법', '어휘', '일관성'],
    tips: [
      '모든 사진을 같은 6문장 뼈대로! 장소 → 첫인상 → 왼쪽/앞 → 오른쪽/옆 → 배경 → 느낌.',
      '사람은 "누가 + 무엇을 입고 + 무엇을 하는 중(-ing)"으로 말해요.',
      'IM은 5문장, IH는 6문장, AL은 추가 묘사 1문장 + 추측으로 마무리.'
    ],
    template: [
      'This picture was taken at/in ___.',
      'The first thing I see is ___.',
      'On the left / In the front, ___.',
      'On the right / Next to him, ___.',
      'In the background, ___.',
      'Overall, it looks ___. / It seems like ___.'
    ]
  },
  3: {
    name: 'Part 3', title: '듣고 질문에 답하기', en: 'Respond to questions', qnums: 'Q5–7',
    prep: 3, resp: [15, 15, 30],
    criteria: ['발음·억양', '문법·어휘', '내용의 관련성과 완성도'],
    tips: [
      '질문의 표현을 그대로 가져와 첫 문장을 만들어요.',
      'Q5·Q6(15초): 답 + That\'s because + 이유. 딱 두 문장!',
      'Q7(30초): 의견 → I have two reasons → First → Second → That\'s why I think so.',
      '이유가 막히면 만능 이유(시간·돈·편리함·스트레스)를 꺼내요.'
    ],
    template: [
      'Q5·6: ___. That\'s because ___. (For example, ___.)',
      'Q7: I think ___. I have two reasons.',
      '     First, ___. (For example, ___.)',
      '     Second, ___. That\'s why I think so.'
    ]
  },
  4: {
    name: 'Part 4', title: '제공된 정보로 답하기', en: 'Respond using information', qnums: 'Q8–10',
    prep: 3, resp: [15, 15, 30], read: 45,
    criteria: ['발음·억양', '문법·어휘', '정보의 정확성'],
    tips: [
      '읽는 시간 45초: 제목·날짜·장소 → 시간표 → ※취소·변경·포함 여부 순서로!',
      'Q9는 대부분 틀린 정보 정정: I\'m sorry, but that\'s not correct. + 올바른 정보',
      'Q10은 두 번 들려줘요: There are two ~. First, at ~, ___. Second, at ~, ___.',
      '표를 그대로 읽지 말고 주어 + 동사가 있는 문장으로 바꿔 말해요.'
    ],
    template: [
      'Q8: The ___ will be held at ___, and it starts at ___.',
      'Q9: I\'m sorry, but that\'s not correct. ___ has been canceled / rescheduled to ___.',
      'Q10: There are two ___. First, at ___, ___. Second, at ___, ___.'
    ]
  },
  5: {
    name: 'Part 5', title: '의견 제시하기', en: 'Express an opinion', qnums: 'Q11',
    prep: 45, resp: [60],
    criteria: ['발음·억양', '문법·어휘', '의견의 일관성과 근거'],
    tips: [
      '첫 문장에서 입장을 분명하게! 질문 문장을 그대로 가져와요.',
      '이유 2개는 "만능 이유"(시간·돈·스트레스·경험·관계·건강)에서 골라요.',
      '예시는 "Last year, I ~ . As a result, ~" 한 가지 틀로 만들어요.',
      '마지막은 For these reasons, I think ~ 로 입장을 한 번 더.'
    ],
    template: [
      'I agree that ___. / I think ___.',
      'I have two reasons.',
      'First, ___. For example, ___.',
      'Second, ___.',
      'For these reasons, I think ___.'
    ]
  }
};
