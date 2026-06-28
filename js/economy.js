// ============================================================
// economy.js — 经济系统（收入/支出/净资产）
// ============================================================

const Economy = {

  update(dt) {
    const gd = GameState.gameData;

    // 每秒收入累计
    gd.cycleIncome += gd.incomePerSec * dt;
    gd.cash += gd.incomePerSec * dt;

    // 净资产 = 现金 + 负债（负债为负）
    gd.netWorth = gd.cash + gd.loan;

    // 经济斩杀线检查
    if (gd.netWorth < 0 && gd.cutlineTriggered.economic === false) {
      gd.negativeEventStreak++;
      if (gd.negativeEventStreak >= 3) {
        gd.cutlineTriggered.economic = true;
        gd.loanRateMod += 0.02; // 利率翻倍效果
        Settlement.showWarning('经济斩杀线触发！信贷冻结', 'Economic Cut Line! Credit Frozen');
      }
    } else if (gd.netWorth >= 0) {
      gd.negativeEventStreak = 0;
    }
  },

  // 500m结算周期
  settle() {
    const gd = GameState.gameData;

    // 计算当期支出
    let expense = 0;
    const details = [];

    // 学贷利息
    const loanInterest = Math.abs(gd.loan) * 0.04 / 24;
    expense += loanInterest;
    details.push({ label: '学贷利息 Loan Int', amount: -loanInterest });

    // 车贷
    if (gd.assets.includes('car_used')) {
      expense += 200;
      details.push({ label: '车贷 Car Loan', amount: -200 });
    }
    if (gd.assets.includes('car_new')) {
      expense += 500;
      details.push({ label: '车贷 Car Loan', amount: -500 });
    }

    // 房贷
    if (gd.assets.includes('house_suburban')) {
      expense += 1200;
      details.push({ label: '房贷 Mortgage', amount: -1200 });
    }
    if (gd.assets.includes('house_villa')) {
      expense += 2300;
      details.push({ label: '房贷 Mortgage', amount: -2300 });
    }

    // 保险
    gd.insurances.forEach(ins => {
      const costs = { health: 250, auto: 100, home: 150, life: 180, umbrella: 450 };
      expense += costs[ins] || 0;
      details.push({ label: `保险 Insurance (${ins})`, amount: -(costs[ins] || 0) });
    });

    // 健身
    const fitnessCosts = [0, 50, 150, 350, 650];
    if (gd.fitnessLevel > 0) {
      expense += fitnessCosts[gd.fitnessLevel];
      details.push({ label: '健身 Fitness', amount: -fitnessCosts[gd.fitnessLevel] });
    }

    // 育儿
    if (gd.children >= 1) { expense += 750; details.push({ label: '育儿 Child 1', amount: -750 }); }
    if (gd.children >= 2) { expense += 600; details.push({ label: '育儿 Child 2', amount: -600 }); }

    gd.cycleExpense = expense;
    gd.cash -= expense;

    // 被动收入
    let passiveIncome = 0;
    if (gd.assets.includes('house_suburban')) passiveIncome += 400;
    if (gd.assets.includes('house_villa')) passiveIncome += 1200;
    passiveIncome *= gd.passiveIncomeMult;
    gd.cash += passiveIncome;
    details.push({ label: '被动收入 Passive', amount: passiveIncome });

    gd.netWorth = gd.cash + gd.loan;

    const cycleNet = gd.cycleIncome - expense + passiveIncome;

    // 返回结算数据
    return {
      income: gd.cycleIncome,
      expense: expense,
      passive: passiveIncome,
      net: cycleNet,
      netWorth: gd.netWorth,
      stamina: gd.stamina,
      details: details
    };

    // 重置周期收入
    gd.cycleIncome = 0;
  }
};
