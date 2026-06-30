// 20角色完整参数 —— 对齐统一参数表v1.2

export interface Character {
  id: number;
  name: string;
  nameEn: string;
  tagline: string;
  age: number;
  gender: string;
  race: string;
  occupation: string;
  attributes: { stamina: string; social: string; education: string; wealth: string; career: string };
  hourlyWage: number;
  startingCash: number;
  studentLoan: number;
  monthlyBills: { rent: number; studentLoan: number; childcare: number; insurance: number; other: number };
  monthlyExpenseTotal: number;
  overtimeMax: number;
  socialMax: number;
  learningMultiplier: number;
  restMultiplier: number;
  grayAvailable: boolean;
  grayMaxHours: number;
  cutlineVulnerability: string;
  staminaMax: number;       // 体力上限（默认100，西蒙65）
  isMarried: boolean;       // 是否已婚
  hasChild: boolean;        // 是否有孩子
  wageType: 'fixed' | 'random'; // 时薪类型（卢娜=random）
  special?: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 1, name: '马库斯·陈', nameEn: 'Marcus Chen', tagline: '标准开局。真正的普通人——不靠天赋，全靠选择。',
    age: 42, gender: '男', race: '亚裔', occupation: 'M-7物流中心配送员',
    attributes: { stamina: 'B', social: 'B', education: 'B', wealth: 'B', career: 'B' },
    hourlyWage: 36.67, startingCash: 3000, studentLoan: 0,
    monthlyBills: { rent: 850, studentLoan: 0, childcare: 500, insurance: 0, other: 520 },
    monthlyExpenseTotal: 1870, overtimeMax: 20, socialMax: 15, learningMultiplier: 1, restMultiplier: 1,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'economic',
    staminaMax: 100, isMarried: false, hasChild: true, wageType: "fixed",
  },
  {
    id: 2, name: '佐伊·威尔逊', nameEn: 'Zoe Wilson', tagline: '最优等毕业。知识改变命运——但命运还没收到通知。',
    age: 24, gender: '女', race: '白人', occupation: '三份零工（咖啡师/代驾/问卷）',
    attributes: { stamina: 'C', social: 'B', education: 'S', wealth: 'B', career: 'A' },
    hourlyWage: 35.78, startingCash: 2000, studentLoan: 10000,
    monthlyBills: { rent: 650, studentLoan: 920, childcare: 0, insurance: 0, other: 300 },
    monthlyExpenseTotal: 1870, overtimeMax: 15, socialMax: 15, learningMultiplier: 2, restMultiplier: 1,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'economic',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
  },
  {
    id: 3, name: '德里克·约翰逊', nameEn: 'Derek Johnson', tagline: '前运动健将。膝盖不行了——但还能站着。',
    age: 26, gender: '男', race: '非裔', occupation: '高中体育教练+健身房前台',
    attributes: { stamina: 'S', social: 'B', education: 'C', wealth: 'C', career: 'C' },
    hourlyWage: 30.00, startingCash: 1500, studentLoan: 40000,
    monthlyBills: { rent: 550, studentLoan: 0, childcare: 0, insurance: 0, other: 250 },
    monthlyExpenseTotal: 1350, overtimeMax: 10, socialMax: 15, learningMultiplier: 1, restMultiplier: 1.5,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'stamina',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
  },
  {
    id: 4, name: '詹姆斯·米勒', nameEn: 'James Miller', tagline: '退伍军人。战场换成了邮局——但战争从未结束。',
    age: 32, gender: '男', race: '白人', occupation: '邮政局分拣员',
    attributes: { stamina: 'A', social: 'C', education: 'C', wealth: 'B', career: 'B' },
    hourlyWage: 46.67, startingCash: 8000, studentLoan: 0,
    monthlyBills: { rent: 700, studentLoan: 0, childcare: 0, insurance: 0, other: 400 },
    monthlyExpenseTotal: 1600, overtimeMax: 20, socialMax: 10, learningMultiplier: 1, restMultiplier: 1,
    grayAvailable: false, grayMaxHours: 0, cutlineVulnerability: 'social',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
  },
  {
    id: 5, name: '艾玛·刘易斯', nameEn: 'Emma Lewis', tagline: '极简主义者。三件衬衫。两条裤子。够了。',
    age: 29, gender: '女', race: '白人', occupation: '图书馆管理员+自由撰稿人',
    attributes: { stamina: 'B', social: 'C', education: 'B', wealth: 'B', career: 'B' },
    hourlyWage: 35.00, startingCash: 5000, studentLoan: 35000,
    monthlyBills: { rent: 350, studentLoan: 0, childcare: 0, insurance: 0, other: 200 },
    monthlyExpenseTotal: 950, overtimeMax: 15, socialMax: 10, learningMultiplier: 1, restMultiplier: 1,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'social',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
  },
  {
    id: 6, name: '卡洛斯·罗德里格斯', nameEn: 'Carlos Rodriguez', tagline: '工会成员。团结是最后一道防线。',
    age: 38, gender: '男', race: '拉丁裔', occupation: 'M-7物流中心仓库管理员（工会代表）',
    attributes: { stamina: 'A', social: 'B', education: 'B', wealth: 'B', career: 'A' },
    hourlyWage: 50.00, startingCash: 4000, studentLoan: 35000,
    monthlyBills: { rent: 900, studentLoan: 0, childcare: 400, insurance: 0, other: 500 },
    monthlyExpenseTotal: 2400, overtimeMax: 20, socialMax: 15, learningMultiplier: 1, restMultiplier: 1,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'economic',
    staminaMax: 100, isMarried: true, hasChild: true, wageType: "fixed",
  },
  {
    id: 7, name: '安娜·瓦斯奎兹', nameEn: 'Anna Vasquez', tagline: '移民梦想家。每跨过一个障碍，她就变得更强。',
    age: 28, gender: '女', race: '拉丁裔', occupation: '清洁工+周末洗碗',
    attributes: { stamina: 'A', social: 'C', education: 'B', wealth: 'D', career: 'B' },
    hourlyWage: 26.67, startingCash: 1000, studentLoan: 0,
    monthlyBills: { rent: 500, studentLoan: 0, childcare: 0, insurance: 0, other: 700 },
    monthlyExpenseTotal: 1200, overtimeMax: 20, socialMax: 10, learningMultiplier: 1, restMultiplier: 1,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'existence',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
  },
  {
    id: 8, name: '瑞秋·汤普森', nameEn: 'Rachel Thompson', tagline: '单亲家长。一个人带孩子。一个人付账单。',
    age: 35, gender: '女', race: '白人', occupation: '远程客服代表',
    attributes: { stamina: 'A', social: 'B', education: 'B', wealth: 'C', career: 'B' },
    hourlyWage: 40.00, startingCash: 2000, studentLoan: 50000,
    monthlyBills: { rent: 850, studentLoan: 500, childcare: 400, insurance: 0, other: 350 },
    monthlyExpenseTotal: 2100, overtimeMax: 15, socialMax: 10, learningMultiplier: 1, restMultiplier: 1,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'stamina',
    staminaMax: 100, isMarried: true, hasChild: true, wageType: "fixed",
  },
  {
    id: 9, name: '伊桑·布莱克', nameEn: 'Ethan Blake', tagline: '大学辍学生。所有赌注压在一张牌上。',
    age: 23, gender: '男', race: '白人', occupation: '创业者（AI教育App）',
    attributes: { stamina: 'B', social: 'B', education: 'D', wealth: 'C', career: 'A' },
    hourlyWage: 0, startingCash: 5000, studentLoan: 5000,
    monthlyBills: { rent: 400, studentLoan: 0, childcare: 0, insurance: 0, other: 300 },
    monthlyExpenseTotal: 1200, overtimeMax: 0, socialMax: 10, learningMultiplier: 1.5, restMultiplier: 1,
    grayAvailable: true, grayMaxHours: 60, cutlineVulnerability: 'economic',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
    special: '工作收入$0，灰色上限60h替代工作',
  },
  {
    id: 10, name: '艾琳&马克', nameEn: 'Erin & Mark', tagline: '丁克夫妇。不要孩子。有彼此。有自由。',
    age: 34, gender: '女+男', race: '亚裔+白人', occupation: 'UX设计师+数据工程师',
    attributes: { stamina: 'B', social: 'A', education: 'A', wealth: 'A', career: 'A' },
    hourlyWage: 62.50, startingCash: 25000, studentLoan: 60000,
    monthlyBills: { rent: 2000, studentLoan: 0, childcare: 0, insurance: 500, other: 1500 },
    monthlyExpenseTotal: 4500, overtimeMax: 15, socialMax: 20, learningMultiplier: 1.2, restMultiplier: 1,
    grayAvailable: false, grayMaxHours: 0, cutlineVulnerability: 'existence',
    staminaMax: 100, isMarried: true, hasChild: false, wageType: "fixed",
  },
  {
    id: 11, name: '杰森·杨', nameEn: 'Jason Yang', tagline: '人脉达人。通讯录比简历长。',
    age: 36, gender: '男', race: '亚裔', occupation: '商业地产经纪人',
    attributes: { stamina: 'C', social: 'S', education: 'B', wealth: 'B', career: 'A' },
    hourlyWage: 66.67, startingCash: 10000, studentLoan: 60000,
    monthlyBills: { rent: 1800, studentLoan: 0, childcare: 0, insurance: 300, other: 900 },
    monthlyExpenseTotal: 3500, overtimeMax: 10, socialMax: 20, learningMultiplier: 1, restMultiplier: 0.8,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'social',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
  },
  {
    id: 12, name: '凯瑟琳·帕克博士', nameEn: 'Dr. Catherine Parker', tagline: '博士。读了十年书。欠了$80K。',
    age: 33, gender: '女', race: '白人', occupation: '社区大学兼职讲师（历史学）',
    attributes: { stamina: 'D', social: 'C', education: 'S', wealth: 'D', career: 'A' },
    hourlyWage: 30.00, startingCash: 1000, studentLoan: 80000,
    monthlyBills: { rent: 650, studentLoan: 800, childcare: 0, insurance: 0, other: 250 },
    monthlyExpenseTotal: 1700, overtimeMax: 5, socialMax: 10, learningMultiplier: 3, restMultiplier: 0.5,
    grayAvailable: false, grayMaxHours: 0, cutlineVulnerability: 'stamina',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
  },
  {
    id: 13, name: '奥斯卡·里维拉', nameEn: 'Oscar Rivera', tagline: '夜班工人。别人在阳光下——他在月光下。',
    age: 31, gender: '男', race: '拉丁裔', occupation: '医院夜班清洁工+周末搬运',
    attributes: { stamina: 'A', social: 'D', education: 'C', wealth: 'C', career: 'B' },
    hourlyWage: 43.33, startingCash: 3000, studentLoan: 30000,
    monthlyBills: { rent: 500, studentLoan: 0, childcare: 0, insurance: 0, other: 600 },
    monthlyExpenseTotal: 1800, overtimeMax: 20, socialMax: 5, learningMultiplier: 1, restMultiplier: 1.2,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'social',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
  },
  {
    id: 14, name: '卢娜·马丁内斯', nameEn: 'Luna Martinez', tagline: '零工经济者。她没有"工作"——她有一百个"活儿"。',
    age: 27, gender: '女', race: '拉丁裔', occupation: '多平台零工（Uber/Instacart等）',
    attributes: { stamina: 'B', social: 'C', education: 'C', wealth: 'D', career: 'A' },
    hourlyWage: 30, startingCash: 500, studentLoan: 20000, // 时薪随机$15-$45，取中值$30
    monthlyBills: { rent: 450, studentLoan: 0, childcare: 0, insurance: 0, other: 450 },
    monthlyExpenseTotal: 1400, overtimeMax: 20, socialMax: 10, learningMultiplier: 1, restMultiplier: 1,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'economic',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "random",
    special: '时薪每月随机$15-$45/h',
  },
  {
    id: 15, name: '西蒙·阿德耶米', nameEn: 'Simon Adeyemi', tagline: '残障专业人士。体力有限——但大脑没有限制。',
    age: 30, gender: '男', race: '非裔', occupation: '远程IT安全顾问',
    attributes: { stamina: 'D', social: 'B', education: 'A', wealth: 'B', career: 'A' },
    hourlyWage: 75.00, startingCash: 15000, studentLoan: 35000,
    monthlyBills: { rent: 1200, studentLoan: 0, childcare: 0, insurance: 400, other: 800 },
    monthlyExpenseTotal: 2800, overtimeMax: 10, socialMax: 15, learningMultiplier: 1.5, restMultiplier: 0.8,
    grayAvailable: false, grayMaxHours: 0, cutlineVulnerability: 'stamina',
    staminaMax: 65, isMarried: false, hasChild: false, wageType: "fixed",
    special: '体力上限65',
  },
  {
    id: 16, name: '菲利克斯·贝尔', nameEn: 'Felix Bell', tagline: '幸运儿。好事总是发生在他身上——但运气会守恒。',
    age: 25, gender: '男', race: '混血', occupation: '自由摄影师',
    attributes: { stamina: 'B', social: 'B', education: 'B', wealth: 'B', career: 'B' },
    hourlyWage: 33.33, startingCash: 3000, studentLoan: 40000,
    monthlyBills: { rent: 650, studentLoan: 0, childcare: 0, insurance: 0, other: 550 },
    monthlyExpenseTotal: 1800, overtimeMax: 15, socialMax: 15, learningMultiplier: 1, restMultiplier: 1,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'economic',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
  },
  {
    id: 17, name: '维多利亚·斯特林', nameEn: 'Victoria Sterling', tagline: '传承者。继承了$300K——和$300K的期望。',
    age: 29, gender: '女', race: '白人', occupation: '家族基金会管理员',
    attributes: { stamina: 'B', social: 'B', education: 'B', wealth: 'A', career: 'B' },
    hourlyWage: 58.33, startingCash: 50000, studentLoan: 0,
    monthlyBills: { rent: 1500, studentLoan: 0, childcare: 0, insurance: 300, other: 500 },
    monthlyExpenseTotal: 2500, overtimeMax: 15, socialMax: 15, learningMultiplier: 1, restMultiplier: 1,
    grayAvailable: false, grayMaxHours: 0, cutlineVulnerability: 'existence',
    staminaMax: 100, isMarried: true, hasChild: false, wageType: "fixed",
  },
  {
    id: 18, name: '特伦斯·阿姆斯特朗三世', nameEn: 'Trent Armstrong III', tagline: '信托基金宝宝。出生在终点线——但不知道起点在哪里。',
    age: 26, gender: '男', race: '白人', occupation: '无（"在探索可能性"）',
    attributes: { stamina: 'C', social: 'B', education: 'B', wealth: 'S', career: 'D' },
    hourlyWage: 0, startingCash: 200000, studentLoan: 0,
    monthlyBills: { rent: 2500, studentLoan: 0, childcare: 0, insurance: 400, other: 2100 },
    monthlyExpenseTotal: 5000, overtimeMax: 0, socialMax: 20, learningMultiplier: 1, restMultiplier: 1.5,
    grayAvailable: false, grayMaxHours: 0, cutlineVulnerability: 'career',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
    special: '工作收入$0，被动收入$800/月，自动奢侈消费$5000/月，净资产<$100K断供',
  },
  {
    id: 19, name: '萨沙·林', nameEn: 'Sasha Lin', tagline: '网红。50万粉丝。人设即资产——但人设是会塌的。',
    age: 24, gender: '女', race: '亚裔', occupation: '生活方式博主/内容创作者',
    attributes: { stamina: 'C', social: 'A', education: 'C', wealth: 'B', career: 'B' },
    hourlyWage: 33.33, startingCash: 15000, studentLoan: 25000,
    monthlyBills: { rent: 1500, studentLoan: 0, childcare: 0, insurance: 200, other: 1300 },
    monthlyExpenseTotal: 3500, overtimeMax: 10, socialMax: 20, learningMultiplier: 1, restMultiplier: 0.8,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'social',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
  },
  {
    id: 20, name: '马库斯·韦斯特', nameEn: 'Marcus West', tagline: '自学天才。没有学历。没有社交。只有一只猫和一个GitHub。',
    age: 28, gender: '男', race: '非裔', occupation: '自由软件开发者',
    attributes: { stamina: 'B', social: 'D', education: 'D', wealth: 'C', career: 'S' },
    hourlyWage: 41.67, startingCash: 3000, studentLoan: 0,
    monthlyBills: { rent: 350, studentLoan: 0, childcare: 0, insurance: 0, other: 250 },
    monthlyExpenseTotal: 1000, overtimeMax: 20, socialMax: 5, learningMultiplier: 2, restMultiplier: 1,
    grayAvailable: true, grayMaxHours: 15, cutlineVulnerability: 'social',
    staminaMax: 100, isMarried: false, hasChild: false, wageType: "fixed",
  },
];

export const STARTER_CHARACTERS = CHARACTERS.filter(c => c.id <= 6);
