// 事件池 —— 对齐叙事设计v3.2的159事件索引（P1实现核心子集）

export type EventType = 'positive' | 'negative' | 'neutral' | 'high_pressure' | 'gray' | 'seasonal' | 'boss' | 'character' | 'observer';

export interface GameEvent {
  id: string;
  name: string;
  type: EventType;
  narrative: string;
  choices: EventChoice[];
  triggerCondition?: string;
}

export interface EventChoice {
  text: string;
  costHours?: number;
  costMoney?: number;
  effects: {
    cash?: number;
    stamina?: number;
    social?: number;
    mood?: number;
    communityConnection?: number;
    grayRisk?: number;
    narrative?: string;
  };
  narrativeReaction?: string;
}

// ===== 正面事件 =====
const POSITIVE_EVENTS: GameEvent[] = [
  {
    id: 'E-P01', name: '意外之财', type: 'positive',
    narrative: '一封信。一张支票。你盯着数字看了很久。这种好事多久没发生过了？',
    choices: [
      { text: '立即存入储蓄', effects: { cash: 500, mood: 5 }, narrativeReaction: '安全的选择。钱进了银行。心跳平复了。' },
      { text: '投资一个小机会', effects: { cash: 200, mood: 10 }, narrativeReaction: '你赌了一把。有时候——有时候会赢。' },
      { text: '用于"正常生活"的体验', effects: { cash: 300, mood: 20 }, narrativeReaction: '一杯好咖啡。一次不赶时间的晚餐。你忘了这些感觉。' },
    ],
  },
  {
    id: 'E-P02', name: '陌生人的善意', type: 'positive',
    narrative: '玛格丽特老太太敲了你的门，手里端着一锅汤。"多做了一份。不是可怜你。就是做多了。"',
    triggerCondition: 'social_cutline_approaching',
    choices: [
      { text: '接受帮助', effects: { stamina: 10, mood: 15, communityConnection: 1 }, narrativeReaction: '汤还是温的。你坐在桌前，慢慢喝。' },
      { text: '婉拒但保持联系', effects: { mood: 5, communityConnection: 1 }, narrativeReaction: '"谢谢你，玛格丽特。"她看了你一眼。什么都没说。' },
      { text: '接受并开始定期互助', effects: { stamina: 10, mood: 20, communityConnection: 2 }, narrativeReaction: '从今天起——你帮她买菜，她帮你照看孩子。' },
    ],
  },
  {
    id: 'E-P03', name: '技能变现', type: 'positive',
    narrative: '一个邻居在社区群里问："有人会修热水器吗？急。付现金。"',
    choices: [
      { text: '接下这份活', costHours: 3, effects: { cash: 150, communityConnection: 1 }, narrativeReaction: '热水器修好了。邻居递给你$150和一杯咖啡。' },
      { text: '推荐别人', effects: { social: 5 }, narrativeReaction: '你推荐了另一个人。他谢谢你。你少赚了$150。' },
    ],
  },
  {
    id: 'E-P06', name: '意外的贵人', type: 'positive',
    narrative: '"我看了你的工作。"对方说。"我这里有一个位置。不一定更好。但是一个开始。"',
    choices: [
      { text: '抓住机会', effects: { cash: 0, mood: 25 }, narrativeReaction: '一个新的收入渠道。不保证什么——但是新的。' },
      { text: '谨慎观望', effects: { mood: 5 }, narrativeReaction: '你保留了当前状态。也许错过了什么。也许没有。' },
    ],
  },
];

// ===== 负面事件 =====
const NEGATIVE_EVENTS: GameEvent[] = [
  {
    id: 'E-N01', name: '账单总是准时', type: 'negative',
    narrative: '信封上的标志你认识。你不需要打开就知道里面是什么。但你还是打开了。',
    choices: [
      { text: '立即支付', costMoney: 300, effects: { cash: -300, mood: -10 }, narrativeReaction: '钱从账户里消失。你看着余额——又少了一截。' },
      { text: '延期支付', effects: { mood: -5 }, narrativeReaction: '你把信封放在桌上。下个月它会变厚。' },
      { text: '忽略', effects: { social: -5, mood: -10 }, narrativeReaction: '你把信封扔进抽屉。它不会消失。但你可以暂时不看它。' },
    ],
  },
  {
    id: 'E-N03', name: '关系的裂痕', type: 'negative',
    narrative: '电话响了。是艾玛。"你答应过这周末来接我的。"你的心沉了下去。你完全忘了。',
    choices: [
      { text: '尽力弥补', costHours: 4, effects: { social: 10, stamina: -5, mood: -5 }, narrativeReaction: '你去了。她没有笑。但她在你身边坐了十分钟。' },
      { text: '诚实解释', effects: { social: -5, mood: -10 }, narrativeReaction: '"对不起，艾玛。爸爸忘了。"电话那头沉默了三秒。"好吧。"' },
      { text: '找借口', effects: { social: -15, mood: -5 }, narrativeReaction: '"工作太忙了。"她没有追问。但你知道——她知道。' },
    ],
  },
  {
    id: 'E-N04', name: '系统的信', type: 'negative',
    narrative: '这封信的措辞很礼貌。非常礼貌。礼貌到让你想吐。',
    choices: [
      { text: '走正式申诉流程', costHours: 2, effects: { stamina: -5, mood: -10 }, narrativeReaction: '你坐在等候室里。前面有12个人。他们的手里都拿着同样的信。' },
      { text: '寻求法律/社区帮助', effects: { social: 5, mood: -5 }, narrativeReaction: '你打了三个电话。第二个有人接。"我们可以帮你——但需要时间。"' },
      { text: '接受', effects: { mood: -20 }, narrativeReaction: '你把信放在桌上。你知道这意味着什么。你选择不去想它。' },
    ],
  },
  {
    id: 'E-N05', name: '健康不会等待', type: 'negative',
    narrative: '你醒来时，身体告诉你一个你不想听的消息：有些事情不对。',
    choices: [
      { text: '去看医生', costMoney: 500, effects: { cash: -500, stamina: 20, mood: -10 }, narrativeReaction: '医生说"还好你来了"。你花了$500。但问题解决了。' },
      { text: '自己处理', costMoney: 50, effects: { cash: -50, stamina: -10 }, narrativeReaction: '止痛药和热水袋。暂时有用。你知道——暂时。' },
      { text: '忍着', effects: { stamina: -15, mood: -10 }, narrativeReaction: '你选择忽略它。身体会记住你的选择。' },
    ],
  },
  {
    id: 'E-N06', name: '被替代', type: 'negative',
    narrative: '"这不是针对你个人。"他们说。他们总是这么说。',
    choices: [
      { text: '接受并寻找新机会', effects: { mood: -15, stamina: -5 }, narrativeReaction: '你走出办公室。阳光刺眼。你拿出手机——开始刷招聘。' },
      { text: '争取保留位置', costHours: 3, effects: { social: -5, stamina: -10, mood: -10 }, narrativeReaction: '你说了所有该说的话。他们点了头。"我们会考虑。"' },
      { text: '升级技能', costHours: 5, effects: { stamina: -5, mood: -5 }, narrativeReaction: '你开始学习新东西。未来会有用——如果你有未来。' },
    ],
  },
];

// ===== 中性事件 =====
const NEUTRAL_EVENTS: GameEvent[] = [
  {
    id: 'E-NU01', name: '旧日回响', type: 'neutral',
    narrative: '你在超市里看到了一个人。他/她也看到了你。你们对视了一秒，然后都移开了目光。',
    choices: [
      { text: '主动打招呼', effects: { social: 5, mood: 5 }, narrativeReaction: '"嗨。好久不见。"对方笑了。你交换了号码。也许会用。' },
      { text: '假装没看见', effects: { mood: -5 }, narrativeReaction: '你转过身，走向另一个货架。安全。但孤独。' },
    ],
  },
  {
    id: 'E-NU02', name: '微小的选择', type: 'neutral',
    narrative: '排队时，前面的人掉了一张二十美元的钞票。没有人注意到。你注意到了。',
    choices: [
      { text: '归还', effects: { social: 5, mood: 10 }, narrativeReaction: '"你掉了这个。"对方愣了一下，然后笑了。"谢谢你。"' },
      { text: '拿走', effects: { cash: 20, mood: -10 }, narrativeReaction: '你把$20放进口袋。没有人在看。但你知道。' },
      { text: '假装没看见', effects: {}, narrativeReaction: '你看着它掉在地上。下一个人会捡起来。不是你的问题。' },
    ],
  },
  {
    id: 'E-NU04', name: '深夜来电', type: 'neutral',
    narrative: '凌晨两点，电话响了。是一个很久没联系的人。',
    choices: [
      { text: '接听', effects: { social: 5, stamina: -5 }, narrativeReaction: '是德韦恩。"马库斯——我需要帮忙。"你听完了。你做了你能做的。' },
      { text: '不接', effects: { mood: -5 }, narrativeReaction: '你看着屏幕变暗。明天你会回拨。也许。' },
    ],
  },
  {
    id: 'E-NU05', name: '镜中人', type: 'neutral',
    narrative: '你有多久没有认真看自己了？镜子里的人看起来——有点陌生。',
    choices: [
      { text: '停下来看看自己', effects: { mood: 5 }, narrativeReaction: '你看了很久。你还在。这就够了。' },
      { text: '继续赶路', effects: {}, narrativeReaction: '你没有时间。镜子里的人可以等。' },
    ],
  },
];

// ===== 高压事件 =====
const HIGH_PRESSURE_EVENTS: GameEvent[] = [
  {
    id: 'E-H01', name: '催债人的电话', type: 'high_pressure',
    narrative: '电话响了。"陈先生，我是第一银行的罗德里格斯。您的账户已经逾期47天。"',
    triggerCondition: 'economic_cutline_danger',
    choices: [
      { text: '我可以付$200。现在。', costMoney: 200, effects: { cash: -200, mood: -10 }, narrativeReaction: '"$200不够。但我可以记录你正在尝试。"你获得了2周缓冲期。' },
      { text: '我需要更多时间。', effects: { social: -10, mood: -15 }, narrativeReaction: '"我可以给你困难延期——30天。但这会记录在你的信用报告上。"' },
    ],
  },
  {
    id: 'E-H03', name: '急诊室的夜晚', type: 'high_pressure',
    narrative: '凌晨3点。高烧40度。分诊护士问的第一个问题："你有保险吗？"',
    triggerCondition: 'stamina_cutline_danger',
    choices: [
      { text: '"有。"（撒谎）', costMoney: 3800, effects: { cash: -3800, stamina: 30, mood: -20 }, narrativeReaction: '你签了字。你知道你签的是什么。但烧在退。' },
      { text: '"没有。"', costMoney: 0, effects: { stamina: 10, mood: -15 }, narrativeReaction: '护士的表情没有变化。她递给你一叠表格。"慈善护理——可能减免。"' },
    ],
  },
];

// ===== 灰色事件 =====
const GRAY_EVENTS: GameEvent[] = [
  {
    id: 'E-G01', name: '钱包', type: 'gray',
    narrative: '你在超市停车场发现了一个钱包。里面有$340现金。还有一张身份证——一个老人。地址在南岸。',
    choices: [
      { text: '全部归还', effects: { social: 10, mood: 15, communityConnection: 1 }, narrativeReaction: '你寄回了所有东西。一周后，你的门口出现了一袋橙子。没有署名。' },
      { text: '归还身份证，保留现金', effects: { cash: 340, mood: -10 }, narrativeReaction: '你寄回了身份证。留下了$340。你几乎相信了"这是他应该付的找回费"。' },
      { text: '全部保留', effects: { cash: 340, mood: -20 }, narrativeReaction: '你把钱包扔进了垃圾桶。$340在你口袋里。你不知道这是不是真的。' },
    ],
  },
];

// ===== 季节事件 =====
const SEASONAL_EVENTS: GameEvent[] = [
  {
    id: 'E-S01', name: '感恩节晚餐', type: 'seasonal',
    narrative: '感恩节。家人围坐。火鸡在中央。一切看起来很好——直到有人问："你最近在做什么？"',
    choices: [
      { text: '如实回答', effects: { social: 5, mood: -10 }, narrativeReaction: '桌上的气氛变了。有人低头看盘子。有人开始说"我认识一个人可以帮你……"' },
      { text: '含糊带过', effects: { social: -5, mood: -5 }, narrativeReaction: '"还行。"你笑了笑。没有人追问。但你知道——他们知道。' },
      { text: '转移话题', effects: { social: 0, mood: 0 }, narrativeReaction: '你开始问别人的近况。效果很好。直到甜点时——你妈在你耳边小声说"你还好吗？"' },
    ],
  },
  {
    id: 'E-S02', name: '圣诞消费压力', type: 'seasonal',
    narrative: '礼物清单在你面前。你算了一下总价。然后你闭上了眼睛。',
    choices: [
      { text: '尽力满足所有人', costMoney: 500, effects: { cash: -500, social: 10, mood: 5 }, narrativeReaction: '你刷了信用卡。每个人都很开心。你会在1月为此买单。' },
      { text: '只买给最亲近的人', costMoney: 200, effects: { cash: -200, social: 0, mood: 0 }, narrativeReaction: '艾玛的礼物是一本书。她笑了。前妻的礼物——你没买。' },
      { text: '跳过礼物', effects: { social: -15, mood: -10 }, narrativeReaction: '"今年不交换礼物了。"你在群里发了消息。没有人回复。' },
    ],
  },
  {
    id: 'E-S03', name: '新年自我反思', type: 'seasonal',
    narrative: '新年。你一个人坐着。窗外有烟花。你回忆了过去三个月——然后想着接下来的九个月。',
    choices: [
      { text: '制定新策略', effects: { mood: 10 }, narrativeReaction: '"今年会不一样。"你对自己说。你不确定——但你选择相信。' },
      { text: '保持现状', effects: { mood: 0 }, narrativeReaction: '如果还没坏——就别修。你继续走。' },
    ],
  },
  {
    id: 'E-S04_boss', name: '报税日', type: 'boss',
    narrative: '报税日。你坐在桌前，面前是一堆表格。可能是退税——可能是补税。你不知道。直到你打开那个信封。',
    choices: [
      { text: '认真处理税务', costHours: 4, effects: { cash: 0 }, narrativeReaction: '你花了4小时处理。结果即将揭晓……' },
      { text: '草草了事', costHours: 2, effects: { cash: 0, mood: -5 }, narrativeReaction: '你最快速度填完了。有些地方可能填错了。但——已经交了。' },
    ],
  },
  {
    id: 'E-S05', name: '毕业季/学贷', type: 'seasonal',
    narrative: '毕业季。如果你有学贷——还款通知又来了。如果你有孩子——学费账单到了。',
    choices: [
      { text: '按时还款', costMoney: 920, effects: { cash: -920, mood: -5 }, narrativeReaction: '学贷$920。每月。从现在开始。' },
      { text: '申请延期', effects: { social: -5, mood: -10 }, narrativeReaction: '你提交了延期申请。"处理中。"但利息在累积。' },
    ],
  },
];

// ===== 角色专属事件（马库斯） =====
const CHARACTER_EVENTS: GameEvent[] = [
  {
    id: 'character_intro', name: '工厂关闭那天', type: 'character',
    narrative: '2008年。工厂大门正在关闭。你手里拿着"自愿离职"协议。协议上的字很小——"养老金"被圈了出来，旁边有一个×。4,500人。同一天。夕阳照在你脸上——一半亮，一半暗。',
    choices: [
      { text: '开始游戏', effects: { mood: 0 }, narrativeReaction: '你签了。你当时不知道——那份协议让你无法起诉。你失去了15年的养老金。现在，2024年。你在M-7物流中心送快递。每小时$14.25。这是你的故事。' },
    ],
  },
  {
    id: 'leo_first_contact', name: '利奥的第一次接触', type: 'character',
    narrative: '凌晨2点。M-7物流中心停车场。一辆灰色轿车停在你车旁边。一个男人靠在车上。"十二个小时。我数了。你不是在生活——是在推迟死亡。"',
    choices: [
      { text: '什么活儿？', effects: { mood: -5 }, narrativeReaction: '"聪明的问题。但答案不是免费的。下周二，南温斯顿街1147号。晚上8点。"——灰色经济线开启。' },
      { text: '我不做违法的事。', effects: { mood: 5 }, narrativeReaction: '"违法？"他轻笑。"你在一个每小时付你$14.25的地方工作了十二个小时。这就是合法的。"——灰色线关闭。但利奥说"你会回来的。"' },
      { text: '为什么找我？', effects: { mood: 0 }, narrativeReaction: '"因为你还在站着。十二个小时之后，你还站着。"他递给你一张纸条。地址。"来或不来。"' },
    ],
  },
  // ===== 马库斯专属事件 =====
  {
    id: 'E-CH01-01', name: '前妻的律师信', type: 'character',
    narrative: '"我方当事人认为，目前的抚养安排已不再符合未成年人最佳利益……"你看着信。艾玛的脸浮现在你眼前。',
    choices: [
      { text: '找律师应对', costMoney: 500, effects: { cash: -500, social: 5, mood: -15 }, narrativeReaction: '你花了$500请律师。"你有权争取。"律师说。但你和律师都知道——关键看你的经济状况。' },
      { text: '自己写答辩', costHours: 4, effects: { stamina: -5, mood: -10 }, narrativeReaction: '你花了4小时写答辩状。措辞很笨拙。但每个字都是真心的。' },
      { text: '和前妻谈谈', effects: { social: 10, mood: -10 }, narrativeReaction: '你拨了凯伦的电话。"我们能谈谈吗？"她沉默了三秒。"好吧。"' },
    ],
  },
  {
    id: 'E-CH01-02', name: '艾玛的生日', type: 'character',
    narrative: '艾玛下周六过生日。前妻说："你可以来。但如果你要来的话……别让孩子们看出来你过得不好。"',
    choices: [
      { text: '买最好的礼物', costMoney: 200, effects: { cash: -200, social: 10, mood: 5 }, narrativeReaction: '你花了$200——几乎是一周的伙食费。但艾玛拆开礼物时笑了。那个笑值$200。' },
      { text: '送手工礼物', costHours: 3, effects: { social: 5, mood: 0 }, narrativeReaction: '你做了一个相框。放了你们俩的照片。艾玛看了看——"谢谢你，爸爸。"她的声音很小。' },
      { text: '送$20的礼物', costMoney: 20, effects: { cash: -20, social: -5, mood: -10 }, narrativeReaction: '你买了一本$20的书。艾玛说"谢谢"。但你看得出——她期待的更多。' },
    ],
  },
  // ===== 佐伊专属事件 =====
  {
    id: 'E-CH02-01', name: '校友会邀请', type: 'character',
    narrative: '大学群组里，有人在发婚礼照片。伴娘礼服$400。单身派对在坎昆。你算了一下——参加这场婚礼的成本=你一个月的食物预算。',
    choices: [
      { text: '参加', costMoney: 400, effects: { cash: -400, social: 10, mood: -5 }, narrativeReaction: '你去了。穿着$50的裙子。没人注意到。但你知道——你是桌上收入最低的人。' },
      { text: '婉拒', effects: { social: -5, mood: -5 }, narrativeReaction: '"不好意思，那天有事。"你打了这行字。删掉。又打了一遍。最终发了。' },
      { text: '诚实说明', effects: { social: 0, mood: -10 }, narrativeReaction: '"我去不起。"你说了实话。群组安静了一天。然后有人说"理解"。其他人没说话。' },
    ],
  },
  // ===== 德里克专属事件 =====
  {
    id: 'E-CH03-01', name: '旧伤复发', type: 'character',
    narrative: '今天早上你弯下腰系鞋带，然后你停住了。那个熟悉的刺痛又来了。你慢慢直起身，花了一分钟。',
    choices: [
      { text: '休息一天', effects: { stamina: 10, mood: -5 }, narrativeReaction: '你请了假。少了一天的工资。但膝盖说"谢谢你"。' },
      { text: '吃药继续', costMoney: 30, effects: { cash: -30, stamina: -5 }, narrativeReaction: '止痛药。暂时的。你知道——但"暂时"是你现在能负担的全部。' },
      { text: '硬扛', effects: { stamina: -15, mood: -5 }, narrativeReaction: '你选择了忽略它。身体会记住你的选择。它总是记住。' },
    ],
  },
  // ===== 詹姆斯专属事件 =====
  {
    id: 'E-CH04-01', name: '战友的求助', type: 'character',
    narrative: '托尼发来短信："雷，你还好吗？我听说了一个开叉车的活儿。不如开车，但是……你知道的。"',
    choices: [
      { text: '感谢并接受信息', effects: { social: 5, mood: 5 }, narrativeReaction: '"谢谢，托尼。"你看了看信息。叉车。不如开车——但至少是方向盘。' },
      { text: '婉拒', effects: { social: -5, mood: 0 }, narrativeReaction: '"谢了，但我在邮局还行。"你没说实话。但你也还没准备好承认。' },
    ],
  },
  // ===== 艾玛专属事件 =====
  {
    id: 'E-CH05-01', name: '母亲的生日', type: 'character',
    narrative: '妈妈下周生日。她不缺东西——住在养老院里，东西不多。但她说想要一个相框。"放你照片的。"',
    choices: [
      { text: '买相框+新照片', costMoney: 30, effects: { cash: -30, social: 10, mood: 10 }, narrativeReaction: '你花了$30。相框是木头的。照片是你在图书馆门口拍的。妈妈笑了。' },
      { text: '只打电话', effects: { social: -5, mood: -5 }, narrativeReaction: '"生日快乐，妈妈。""谢谢，艾玛。"电话很短。你听见她在哭。' },
    ],
  },
  // ===== 卡洛斯专属事件 =====
  {
    id: 'E-CH06-01', name: '工会投票', type: 'character',
    narrative: '管理层提出新合同——削减加班费但增加底薪。工会需要投票。你是代表。40个工人在看着你。',
    choices: [
      { text: '建议接受', effects: { social: -5, mood: -5 }, narrativeReaction: '"我建议接受。"人群哗然。但你知道——如果罢工，公司可以雇临时工。' },
      { text: '建议罢工', effects: { social: 5, stamina: -10, mood: -5 }, narrativeReaction: '"我建议罢工。"一部分人欢呼。一部分人沉默。你知道——两种选择都有代价。' },
      { text: '让大家自己投票', effects: { social: 0, mood: 0 }, narrativeReaction: '"你们投你们的。"你走下讲台。维克多点了点头。' },
    ],
  },
  // ===== 观测者事件 =====
  {
    id: 'E-OB01', name: '观测者的来信', type: 'observer',
    narrative: '在一堆账单和广告中间，有一封没有回邮地址的信。纸张质量很好——不是便宜货。打字，不是打印。"你被观测到了。不是政府。不是银行。我是一个观测者。你的怀疑是对的。"',
    choices: [
      { text: '保留信件', effects: { mood: 5 }, narrativeReaction: '你把信放在抽屉里。如果这封信让你感到不安，你可以烧掉它。如果让你感到被看见——保留它。' },
      { text: '烧掉', effects: { mood: -5 }, narrativeReaction: '你划了一根火柴。纸很快烧完了。灰烬落在桌上。你假装什么都没发生。' },
    ],
  },
  {
    id: 'E-OB02', name: '观测者的第二封信', type: 'observer',
    narrative: '又一封信。同样的打字机。"你收集的信息是对的。系统确实有漏洞。但漏洞不是bug——它们是设计的一部分。问题是：你要用这些漏洞做什么？"',
    choices: [
      { text: '继续阅读', effects: { mood: 5 }, narrativeReaction: '信的背面有一个手写的序列号：#OBS-47-2024。你开始觉得——这不是随机的。' },
      { text: '忽略', effects: { mood: 0 }, narrativeReaction: '你把信放在一边。你有很多事要处理。这封——可以等。' },
    ],
  },
  // ===== 社区回报事件 =====
  {
    id: 'E-P07', name: '社区的回报', type: 'positive',
    narrative: '你门口放着一个信封。里面是几张皱巴巴的钞票。一张纸条："上次你帮了我。这次轮到我了。"没有署名。',
    triggerCondition: 'community_connection_high',
    choices: [
      { text: '收下', effects: { cash: 500, mood: 20, communityConnection: 1 }, narrativeReaction: '你数了数。$500。你不知道是谁。但你感觉到了——社区在看着你。' },
      { text: '放回门口', effects: { social: 10, mood: 15 }, narrativeReaction: '你把信封放回去。第二天它不见了。也许有人比你更需要。' },
    ],
  },
  // ===== 系统挤压事件 =====
  {
    id: 'system_pressure', name: '系统的全面挤压', type: 'high_pressure',
    narrative: '这个月不一样。不是一件事——是所有事同时来。催款信、工作压力、身体的不适、朋友的沉默。系统在从四面八方逼近。',
    choices: [
      { text: '优先处理经济', costHours: 3, effects: { stamina: -10, mood: -10 }, narrativeReaction: '你花了3小时整理账单。数字不好看。但至少——你知道自己站在哪里。' },
      { text: '优先处理身体', effects: { stamina: 10, mood: -5 }, narrativeReaction: '你选择了休息。身体说"谢谢"。但账单不会因为你休息就消失。' },
      { text: '优先处理关系', costHours: 2, effects: { social: 10, stamina: -5 }, narrativeReaction: '你打了几个电话。有人接了。有人没接。你做了你能做的。' },
    ],
  },
  // ===== 路线抉择事件 =====
  {
    id: 'route_choice', name: '最终抉择', type: 'high_pressure',
    narrative: '你必须选择。合规？灰色？还是放弃？这个选择将决定你最后两个月的方向。',
    choices: [
      { text: '合规路线——继续合法策略', effects: { mood: 10 }, narrativeReaction: '你选择了规则内的路。不容易——但至少，你还是你自己。' },
      { text: '灰色路线——深入灰色经济', effects: { mood: -5 }, narrativeReaction: '你选择了利奥的路。更快——但你已经不是进入游戏时的那个人了。' },
      { text: '放弃——减少努力', effects: { mood: -15 }, narrativeReaction: '你选择了不做选择。这本身就是一种选择。' },
    ],
  },
  // ===== 安娜(#7)专属事件 =====
  {
    id: 'E-CH07-01', name: '母亲的紧急电话', type: 'character',
    narrative: '凌晨5点。手机亮了。是洪都拉斯的号码。妈妈的声音在电话里很微弱——"医生说需要手术。"',
    choices: [
      { text: '多汇款', costMoney: 300, effects: { cash: -300, mood: -15 }, narrativeReaction: '你汇了$300。是你一周的收入。妈妈说"谢谢，mija"。你听不出她是在哭还是在笑。' },
      { text: '少汇款', costMoney: 100, effects: { cash: -100, mood: -10 }, narrativeReaction: '你汇了$100。你知道不够。但你也——不够。' },
      { text: '向罗莎借钱', effects: { social: 5, mood: -10 }, narrativeReaction: '罗莎借了你$200。"下个月还。"她说。你没问利息。' },
    ],
  },
  {
    id: 'E-CH07-02', name: '马特奥的问题', type: 'character',
    narrative: '"妈妈，为什么我们不能坐飞机去看外婆？"马特奥在学校学了地理，满脑子都是问题。他不知道有些问题没有安全的答案。',
    choices: [
      { text: '诚实回答', effects: { social: 5, mood: -5 }, narrativeReaction: '"妈妈需要一些文件。"他8岁。他应该不需要知道这些。' },
      { text: '转移话题', effects: { mood: -5 }, narrativeReaction: '"外婆下个月会打电话来。"你转移了话题。马特奥没有追问。但他看着你——他知道的比你说出来的多。' },
    ],
  },
  // ===== 瑞秋(#8)专属事件 =====
  {
    id: 'E-CH08-01', name: '抚养费没到', type: 'character',
    narrative: '又是一个月。前夫的抚养费又没到。你打了三个电话。第三个——他的新女朋友接的。',
    choices: [
      { text: '留言', effects: { mood: -10 }, narrativeReaction: '"请回电话。"你说了。你知道他不会回。但你需要留下记录——万一以后需要上法庭。' },
      { text: '找律师', costMoney: 200, effects: { cash: -200, mood: -15 }, narrativeReaction: '律师说"你可以申请强制执行。"但律师费$200。你算了算——两个孩子需要$200的食品。' },
      { text: '自己扛', effects: { stamina: -10, mood: -10 }, narrativeReaction: '你不打了。你选择——再撑一个月。你总是能再撑一个月。直到你撑不住。' },
    ],
  },
  {
    id: 'E-CH08-02', name: '莉莉的画', type: 'character',
    narrative: '莉莉在餐桌上画了一幅画。四个人。两个大人，两个小孩。其中一个大人被画在了纸的边缘——像是要掉出去。',
    choices: [
      { text: '抱住莉莉', effects: { social: 10, mood: 5 }, narrativeReaction: '你蹲下来抱住她。她把脸埋在你的围裙里。"妈妈，你累吗？"你不知道该怎么回答。' },
      { text: '问画的是谁', effects: { social: 5, mood: -5 }, narrativeReaction: '"这是爸爸。他在——外面。"你看着那张画。你没有说话。莉莉也没有。' },
    ],
  },
  // ===== 伊桑(#9)专属事件 =====
  {
    id: 'E-CH09-01', name: '投资人的电话', type: 'character',
    narrative: '一个VC想见面。你的App有了第一个付费用户——$9.99/月。投资人想看数据。你的数据：1个用户。',
    choices: [
      { text: '去见面', costHours: 4, effects: { stamina: -5, mood: 5 }, narrativeReaction: '投资人看了你的pitch。"有意思。但太早了。"他没有投。但他给了你名片。"有进展再联系。"' },
      { text: '先做产品', effects: { mood: -5 }, narrativeReaction: '你选择了不去。你需要更多用户——不是更多会议。你回到代码前。' },
    ],
  },
  {
    id: 'E-CH09-02', name: '合伙人想退出', type: 'character',
    narrative: '杰米说他想退出。"我撑不下去了。"他在沙发上说。你的心沉了下去。',
    choices: [
      { text: '说服他留下', costHours: 2, effects: { stamina: -5, social: 5, mood: -10 }, narrativeReaction: '你谈了两个小时。杰米说"再给我一周。"你知道——一周后他可能还是会走。' },
      { text: '让他走', effects: { mood: -15 }, narrativeReaction: '"好。"你说。杰米走了。你一个人坐在共享空间里。MacBook的屏幕还亮着。' },
    ],
  },
  // ===== 艾琳&马克(#10)专属事件 =====
  {
    id: 'E-CH10-01', name: '父母的催生', type: 'character',
    narrative: '感恩节。艾琳的妈妈又问了那个问题："什么时候要孩子？"马克在旁边假装没听到。',
    choices: [
      { text: '坚持立场', effects: { social: -5, mood: 5 }, narrativeReaction: '"我们决定了。不要孩子。"你妈的脸僵了一秒。然后她说"你们会改主意的。"你不会。' },
      { text: '转移话题', effects: { social: 0, mood: -5 }, narrativeReaction: '"工作太忙了。"你笑了笑。你妈也笑了笑。你们都知道这是借口。' },
    ],
  },
  // ===== 杰森(#11)专属事件 =====
  {
    id: 'E-CH11-01', name: '人情债', type: 'character',
    narrative: '一个帮过你的人需要回报。他介绍了一个客户给你——现在他想要你帮他处理一个"不太好公开"的交易。',
    choices: [
      { text: '回报', costHours: 3, effects: { stamina: -5, social: 5 }, narrativeReaction: '你花了3小时帮他。他不说谢谢——因为他觉得这是你应该做的。也许他是对的。' },
      { text: '推脱', effects: { social: -15, mood: -5 }, narrativeReaction: '"我这周太忙了。"你听到电话那头的沉默。你知道——你的人脉网络少了一个节点。' },
    ],
  },
  // ===== 凯瑟琳(#12)专属事件 =====
  {
    id: 'E-CH12-01', name: '转行的诱惑', type: 'character',
    narrative: '一份企业培训的工作。年薪$75K。是你在社区大学收入的4倍。但——你需要"简化"你的知识。',
    choices: [
      { text: '接受', effects: { mood: 10 }, narrativeReaction: '你想了三天。你接受了。$75K。你的学贷终于可以加速还了。但你会在深夜想起——你曾经想做学术。' },
      { text: '拒绝', effects: { mood: -5 }, narrativeReaction: '"不了。"你说。你回到社区大学。$1,800/月。但你的课——是完整的。' },
    ],
  },
  // ===== 奥斯卡(#13)专属事件 =====
  {
    id: 'E-CH13-01', name: '白天的机会', type: 'character',
    narrative: '一个白天工作的面试机会。物流公司的仓库主管。不用再上夜班。但面试在上午10点——你通常在睡觉。',
    choices: [
      { text: '去面试', costHours: 3, effects: { stamina: -10, mood: 5 }, narrativeReaction: '你没睡觉就去面试了。你的眼圈很黑。面试官说"你看起来很累。"你笑了。' },
      { text: '放弃', effects: { mood: -10 }, narrativeReaction: '你错过了。你告诉自己——夜班也挺好。至少不用面对白天的世界。' },
    ],
  },
  // ===== 卢娜(#14)专属事件 =====
  {
    id: 'E-CH14-01', name: '平台降权', type: 'character',
    narrative: '算法又变了。你的Uber评分下降了0.1。单量骤减60%。你不知道为什么——你做的和上周一样。',
    choices: [
      { text: '转战其他平台', costHours: 3, effects: { stamina: -5, mood: -5 }, narrativeReaction: '你注册了两个新平台。审核需要3天。这3天——你几乎没有收入。' },
      { text: '拼命跑单拉评分', effects: { stamina: -15, mood: -10 }, narrativeReaction: '你连续跑了14个小时。评分回了0.05。但你的手在抖。' },
    ],
  },
  // ===== 西蒙(#15)专属事件 =====
  {
    id: 'E-CH15-01', name: 'Pixel的退休', type: 'character',
    narrative: 'Pixel已经10岁了。她开始走得很慢。兽医说"她可能需要退休了。"一只新的服务犬需要$15,000。',
    choices: [
      { text: '让Pixel继续', effects: { mood: -10 }, narrativeReaction: '你看着Pixel。她看着你。你知道她在疼。但你负担不起新的。' },
      { text: '申请援助', costHours: 2, effects: { mood: 5 }, narrativeReaction: '你联系了一个服务犬援助组织。"排队等候——大约18个月。"18个月。Pixel能等18个月吗？' },
    ],
  },
  // ===== 菲利克斯(#16)专属事件 =====
  {
    id: 'E-CH16-01', name: '运气用完了', type: 'character',
    narrative: '连续三个负面事件。相机坏了。客户取消。房东涨租。你的"运气"——好像真的用完了。',
    choices: [
      { text: '卖掉相机', costMoney: 0, effects: { cash: 400, mood: -15 }, narrativeReaction: '你把老式胶片相机卖了$400。它曾经值$800。你告诉自己——"东西是可以替代的。"' },
      { text: '硬扛', effects: { stamina: -10, mood: -10 }, narrativeReaction: '你选择了不卖。也许明天会好转。也许。' },
    ],
  },
  // ===== 维多利亚(#17)专属事件 =====
  {
    id: 'E-CH17-01', name: '信托基金的条件', type: 'character',
    narrative: '律师来信。信托基金的条件——如果净资产低于$100K，"限制性条款"将激活。你的净资产正在逼近那条线。',
    choices: [
      { text: '调整投资策略', costHours: 3, effects: { mood: -5 }, narrativeReaction: '你花了3小时重新规划。也许——你该更保守。或者更激进。你不确定。' },
      { text: '忽略', effects: { mood: -10 }, narrativeReaction: '你把信放在一边。$100K。你还有余地。不是吗？' },
    ],
  },
  // ===== 特伦斯(#18)专属事件 =====
  {
    id: 'E-CH18-01', name: '父亲的电话', type: 'character',
    narrative: '爸爸的电话。每季度一次。"进展汇报。"他的声音在电话里很平。你26岁了。你不知道你在汇报什么。',
    choices: [
      { text: '"我在探索"', effects: { mood: -10 }, narrativeReaction: '"探索。"他重复了一遍。沉默了三秒。"探索到什么时候？"你不知道。' },
      { text: '"我需要时间"', effects: { mood: -5 }, narrativeReaction: '"时间。"他说。又沉默了。"好的。"电话挂了。你不确定他是在生气还是在失望。' },
    ],
  },
  // ===== 萨沙(#19)专属事件 =====
  {
    id: 'E-CH19-01', name: '塌房危机', type: 'character',
    narrative: '一个旧视频被翻出来了。你在里面说了一些不太恰当的话。评论区在燃烧。粉丝在掉。',
    choices: [
      { text: '道歉', effects: { social: 5, mood: -10 }, narrativeReaction: '你发了一条道歉视频。"对不起。"你说。评论区分成了两半。一半原谅了。一半没有。' },
      { text: '坚持立场', effects: { social: -10, mood: 5 }, narrativeReaction: '你选择了不道歉。你的"真实"粉丝更忠诚了。但你掉了5000个关注。' },
      { text: '危机公关', costMoney: 5000, effects: { cash: -5000, social: 10, mood: -5 }, narrativeReaction: '你花了$5,000请了公关。三天后——话题过去了。但你记住了那个数字：$5,000。' },
    ],
  },
  // ===== 马库斯W(#20)专属事件 =====
  {
    id: 'E-CH20-01', name: '面试邀请', type: 'character',
    narrative: '你的GitHub被一家公司看到了。他们发来面试邀请。"很impressive。"但他们问——"你是哪个学校毕业的？"',
    choices: [
      { text: '去面试', costHours: 3, effects: { stamina: -5, mood: 5 }, narrativeReaction: '你穿了你唯一一件没有补丁的衬衫。面试官看了你的代码——"很强"。然后问"CS学位？"你说了实话。他点了点头。' },
      { text: '放弃', effects: { mood: -15 }, narrativeReaction: '你没有去。你知道他们会问学历。你不想面对那个时刻。' },
    ],
  },
  // ===== 婚姻互动事件 =====
  {
    id: 'E-MAR-01', name: '伴侣互动', type: 'neutral',
    narrative: '玛丽亚注意到你这周回家很晚。她没有生气——只是担心。',
    triggerCondition: 'married',
    choices: [
      { text: '早点回家陪她', costHours: 2, effects: { social: 8, stamina: 5 }, narrativeReaction: '你提前两小时下班。玛丽亚做了你最喜欢的。你们在餐桌上聊了很久。' },
      { text: '解释原因', effects: { social: 3, mood: -5 }, narrativeReaction: '"工作太忙了。"你解释了。她点头。但她的眼神——你在她失望之前看到了理解。' },
      { text: '忽略', effects: { social: -10, mood: -5 }, narrativeReaction: '你没有回应。她也没有追问。但你知道——每一次忽略都在积累。' },
    ],
  },
  {
    id: 'E-MAR-02', name: '婚姻压力', type: 'negative',
    narrative: '"我们需要谈谈。"玛丽亚的声音很平静。但你知道这种平静——它在暴风雨之前。',
    triggerCondition: 'married_low_social',
    choices: [
      { text: '认真谈', costHours: 2, effects: { social: 10, stamina: -5 }, narrativeReaction: '你们谈了两个小时。有些话很痛。但至少——你们在说话。' },
      { text: '"现在不是时候"', effects: { social: -15, mood: -10 }, narrativeReaction: '你推开了。她看着你——然后走开了。你知道——每一次推开都在缩短某根绳子。' },
    ],
  },
  // ===== 育儿互动事件 =====
  {
    id: 'E-KID-01', name: '育儿时刻', type: 'neutral',
    narrative: '艾玛的数学下降了。老师建议补习。$200/月。你算了一下——这周的食物预算。',
    triggerCondition: 'has_child',
    choices: [
      { text: '花钱请补习', costMoney: 200, effects: { cash: -200, social: 8 }, narrativeReaction: '你付了$200。艾玛说"谢谢爸爸"。她的数学——慢慢在回升。' },
      { text: '自己辅导', costHours: 4, effects: { social: 5, stamina: -5 }, narrativeReaction: '你花了4小时辅导她。有些题你也忘了怎么做。但你们一起——找答案。' },
      { text: '"她会赶上的"', effects: { social: -8, mood: -5 }, narrativeReaction: '你没有做任何事。也许她会。也许不会。你选择了不去想。' },
    ],
  },
  {
    id: 'E-KID-02', name: '亲子危机', type: 'negative',
    narrative: '老师打电话来了。艾玛在学校——沉默了一整天。不说话。不看人。"我们需要见家长。"',
    triggerCondition: 'has_child_low_social',
    choices: [
      { text: '立刻去学校', costHours: 3, effects: { social: 10, stamina: -5, mood: -10 }, narrativeReaction: '你请了假去了。艾玛看到你的时候——哭了。你抱住她。"爸爸在。"' },
      { text: '让前妻去', effects: { social: -15, mood: -15 }, narrativeReaction: '你打了电话给凯伦。她去了。你不知道——这是对的选择还是逃避。' },
    ],
  },
  // ===== Boss关：报税日结果 =====
  {
    id: 'E-S04_result', name: '报税结果', type: 'boss',
    narrative: '信封打开了。数字在纸上。你盯着它——心跳在加速。',
    choices: [
      { text: '查看结果', effects: { cash: 0 }, narrativeReaction: '结果将在结算中显示。' },
    ],
  },
  // ===== Boss关：斩杀线扫描 =====
  {
    id: 'cutline_scan_boss', name: '斩杀线扫描', type: 'boss',
    narrative: '系统在扫描你。四条线——经济、体力、社交、存在。它找到了你最脆弱的那条。正在逼近。',
    choices: [
      { text: '面对它', effects: { mood: -10 }, narrativeReaction: '你无法控制它在扫描什么。你只能——承受。' },
    ],
  },
  // ===== Boss关：路线Boss =====
  {
    id: 'route_boss', name: '最后的考验', type: 'boss',
    narrative: '这是最后一步。你选择了你的路——现在你必须走到尽头。',
    choices: [
      { text: '继续', effects: { mood: -5 }, narrativeReaction: '你的选择已经做出了。现在——只是执行。' },
    ],
  },
];

// ===== 事件库汇总 =====
export const ALL_EVENTS: GameEvent[] = [
  ...POSITIVE_EVENTS,
  ...NEGATIVE_EVENTS,
  ...NEUTRAL_EVENTS,
  ...HIGH_PRESSURE_EVENTS,
  ...GRAY_EVENTS,
  ...SEASONAL_EVENTS,
  ...CHARACTER_EVENTS,
];

export function getEventById(id: string): GameEvent | undefined {
  return ALL_EVENTS.find(e => e.id === id);
}

export function getRandomEvents(pool: string[], count: number): GameEvent[] {
  const available = pool.map(id => getEventById(id)).filter(Boolean) as GameEvent[];
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
