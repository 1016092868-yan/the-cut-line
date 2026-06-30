// 斩杀线状态机 —— 对齐统一参数表v1.2

import { CUTLINE_THRESHOLDS, type CutlineStatus } from '../data/gameConfig';

export interface CutlineState {
  economic: CutlineStatus;
  stamina: CutlineStatus;
  social: CutlineStatus;
  existence: CutlineStatus;
}

export function getCutlineStatus(
  dimension: 'economic' | 'stamina' | 'social' | 'existence',
  value: number,
  consecutiveNegativeMonths = 0,
  filesExpired = 0,
): CutlineStatus {
  const t = CUTLINE_THRESHOLDS[dimension];

  if (dimension === 'existence') {
    if (filesExpired >= 4) return 'triggered';
    if (filesExpired >= 3) return 'critical';
    if (filesExpired >= 2) return 'danger';
    if (filesExpired >= 1) return 'warning';
    return 'safe';
  }

  if (dimension === 'social') {
    if (value < 5 && consecutiveNegativeMonths >= 2) return 'triggered';
    if (value < 5) return 'critical';
    if (value < 10) return 'danger';
    if (value < 30) return 'warning';
    return 'safe';
  }

  // economic & stamina
  if (value < t.critical) return 'triggered';
  if (value < t.danger) return 'critical';
  if (value < t.warning) return 'danger';
  if (value < t.safe) return 'warning';
  return 'safe';
}

export function getCutlineNarrative(dimension: keyof CutlineState, status: CutlineStatus): string {
  const narratives: Record<string, Record<CutlineStatus, string>> = {
    economic: {
      safe: '银行App正常打开。信用卡还能用。',
      warning: '你开始看账户余额了。',
      danger: '收到第一封催款信（白色）。',
      critical: '催款信变成黄色。电话响了。',
      triggered: '门上贴了通知。红色。',
    },
    stamina: {
      safe: '睡醒有精神。不需要咖啡。',
      warning: '早上需要两个闹钟。',
      danger: '失眠。腰背持续疼痛。',
      critical: '爬楼梯喘气。',
      triggered: '无法起床。',
    },
    social: {
      safe: '手机有未读消息。有人约周末。',
      warning: '消息回复变慢了。',
      danger: '没有人主动联系。',
      critical: '电话簿已读不回。',
      triggered: '被社交圈排斥。',
    },
    existence: {
      safe: '驾照在钱包里。医保卡有效。',
      warning: '收到身份验证邮件。',
      danger: '医保被暂停。驾照过期。',
      critical: '身份验证失败。',
      triggered: '信件退回"查无此人"。',
    },
  };
  return narratives[dimension][status];
}

export function getCutlineEffect(dimension: keyof CutlineState, status: CutlineStatus): string {
  const effects: Record<string, Record<CutlineStatus, string>> = {
    economic: {
      safe: '', warning: '', danger: '贷款利率+2%', critical: '贷款利率+5%', triggered: '消费禁用',
    },
    stamina: {
      safe: '', warning: '加班收入-10%', danger: '加班收入-30%', critical: '加班不可用', triggered: '收入归零',
    },
    social: {
      safe: '', warning: '正面事件-10%', danger: '正面事件-30%', critical: '贵人禁用', triggered: '社交效果减半',
    },
    existence: {
      safe: '', warning: '', danger: '医疗费用×2', critical: '医疗费用×3', triggered: '系统不可用',
    },
  };
  return effects[dimension][status];
}
