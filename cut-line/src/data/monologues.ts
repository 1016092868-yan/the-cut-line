// 角色结算独白 —— Voice Pillars数据驱动
// 对齐叙事设计v3.2的10角色Voice Pillars

import type { Character } from './characters';

interface MonologueSet {
  good: string;
  bad: string;
  tired: string;
  neutral: string;
}

const monologues: Record<number, MonologueSet> = {
  1: { // 马库斯
    good: '💬 "这个月还行。钱进了储蓄。艾玛的圣诞礼物有着落了。"',
    bad: '💬 "十二个小时。$171。扣完税$134。你算算，一个小时多少钱。"',
    tired: '💬 "膝盖在痛。但还能跑。"',
    neutral: '💬 "勉强持平。活着——但只是在活着。"',
  },
  2: { // 佐伊
    good: '💬 "Summa Cum Laude。这个月终于觉得自己不只是送咖啡的。"',
    bad: '💬 "学贷$920。房租$650。$2,147。这些数字刻在我脑子里了。"',
    tired: '💬 "三份工作。我忘了上一顿饭是什么时候。"',
    neutral: '💬 "又改了一遍简历。还是没有回复。"',
  },
  3: { // 德里克
    good: '💬 "状态不错。保持住。膝盖还行。"',
    bad: '💬 "你听过那种声音吗？膝盖里的。不是疼——是咔。"',
    tired: '💬 "右膝在说——该停了。但账单不说停。"',
    neutral: '💬 "在健身房前台。看别人跑步。"',
  },
  7: { // 安娜
    good: '💬 "这个月比家乡好。还是比家乡好。"',
    bad: '💬 "马特奥问我洪都拉斯在哪里。我说在南边。"',
    tired: '💬 "手在发抖。清洁剂的味道。"',
    neutral: '💬 "还是比家乡好。还是比家乡好。"',
  },
  8: { // 瑞秋
    good: '💬 "莉莉问我——妈妈你累吗？我说不累。她看了我一眼。六岁。她不信。"',
    bad: '💬 "前夫这个月又没付抚养费。三个电话。第三个——他的新女朋友接的。"',
    tired: '💬 "我没时间累。两个孩子。一份收入。"',
    neutral: '💬 "苏菲在梦里笑了。我听着。"',
  },
  9: { // 伊桑
    good: '💬 "第一个付费用户——$9.99。有人觉得我做的东西值$9.99。"',
    bad: '💬 "杰米说他想退出。我说好。然后我去洗手间吐了。"',
    tired: '💬 "MacBook电量20%。我也是。"',
    neutral: '💬 "代码还在。代码还在。"',
  },
  18: { // 特伦斯
    good: '💬 "第一次——一个数字让我觉得骄傲。"',
    bad: '💬 "信托基金在减少。不是因为乱花——是因为"正常"就这么贵。"',
    tired: '💬 "百达翡丽停了。我没去修。"',
    neutral: '💬 "爸爸每季度问一次"进展汇报"。我不知道在汇报什么。"',
  },
  19: { // 萨沙
    good: '💬 "爆款了。数字在跳动。每一下都是多巴胺。"',
    bad: '💬 "掉粉了。评论区在烧。我关掉了手机。然后又打开了。"',
    tired: '💬 "补光灯灭了。我终于看到了自己的脸。"',
    neutral: '💬 "今天发什么？今天发什么？今天发什么？"',
  },
  20: { // 马库斯W
    good: '💬 "我的代码被一家大公司用了。没有人在乎我没有学历。"',
    bad: '💬 "面试官问CS学位。我说没有。他点了点头。不是好的那种。"',
    tired: '💬 "Bug趴在我头上。她饿了。我也饿了。"',
    neutral: '💬 "Stack Overflow上的朋友又帮了我。现实中——没有。"',
  },
};

const defaultMonologue: MonologueSet = {
  good: '💬 "这个月还行。"',
  bad: '💬 "又一个月。又少了。"',
  tired: '💬 "累了。但还能跑。"',
  neutral: '💬 "勉强持平。"',
};

export function getCharacterMonologue(char: Character, cashFlow: number, stamina: number): string {
  const set = monologues[char.id] ?? defaultMonologue;
  if (stamina < 40) return set.tired;
  if (cashFlow > 300) return set.good;
  if (cashFlow < -200) return set.bad;
  return set.neutral;
}
