import React, { useMemo, useState } from "react";

const USER_STATES = {
  "我今天很累": { intensity: 0.72, recoveryNeed: "high", preferredStyle: "recovery", timeDelta: -4, coachTone: "今天不需要硬撑，恢复训练就能算一次成功。" },
  "我只有 5 分钟": { intensity: 0.78, recoveryNeed: "high", preferredStyle: "reset", timeDelta: -6, hardCap: 5, coachTone: "时间很少也没关系，目标是不断线，而不是做满一节课。" },
  "我只有 10 分钟": { intensity: 0.95, recoveryNeed: "medium", preferredStyle: "balanced", timeDelta: 0, hardCap: 10, coachTone: "10 分钟足够完成一次低冲击燃脂，保持节奏最重要。" },
  "我想出汗": { intensity: 1.12, recoveryNeed: "low", preferredStyle: "energizing", timeDelta: 3, coachTone: "今天可以认真一点，但仍然保持低冲击和可持续。" },
  "我只想拉伸": { intensity: 0.68, recoveryNeed: "medium", preferredStyle: "stretch", timeDelta: -3, coachTone: "今天用拉伸恢复身体，降低压力，也是非常有效的一次行动。" },
  "我今天压力很大": { intensity: 0.7, recoveryNeed: "high", preferredStyle: "reset", timeDelta: -5, coachTone: "先把身体从压力里拉回来，完成几分钟就很好。" },
};

const PHASES = {
  Restart: { label: "Restart", cn: "重启期", days: "Day 1-7", baseMinutes: 7, min: 4, max: 10, focus: "建立重新开始的信心", reviewDay: 7 },
  Build: { label: "Build", cn: "养成期", days: "Day 8-14", baseMinutes: 10, min: 6, max: 14, focus: "稳定微运动习惯", reviewDay: 14 },
  Upgrade: { label: "Upgrade", cn: "老手模式", days: "Day 15-21+", baseMinutes: 14, min: 8, max: 20, focus: "提升运动效率并接近真实减重", reviewDay: 21 },
};

const GOALS = {
  Sustainable: { label: "可持续减重", baseCalories: 95 },
  Restart: { label: "重新开始运动", baseCalories: 70 },
  Tone: { label: "轻塑形", baseCalories: 85 },
};

const WORKOUT_LIBRARY = {
  reset: ["1 分钟呼吸放松", "肩颈舒展", "坐姿抬膝", "床边伸展", "原地轻走", "手臂画圈"],
  recovery: ["睡前拉伸", "猫牛式伸展", "站姿体侧拉伸", "髋部打开", "缓步走动", "低强度核心激活"],
  stretch: ["颈肩放松", "胸椎打开", "腿后侧拉伸", "靠墙小腿拉伸", "髋部环绕", "深呼吸放松"],
  balanced: ["椅子深蹲", "站姿核心收紧", "墙面俯卧撑", "低冲击开合步", "臀桥", "原地快走"],
  energizing: ["深蹲", "站姿提膝", "低冲击波比替代", "核心卷腹替代动作", "交替后撤箭步蹲", "快节奏原地走"],
};

const ADVANCED_WORKOUT_LIBRARY = {
  balanced: ["深蹲 + 提踵组合", "墙面俯卧撑进阶", "臀桥单腿交替", "快节奏原地走", "站姿核心抗旋", "低冲击登山者替代"],
  energizing: ["低冲击循环深蹲", "后撤箭步蹲", "站姿提膝加速", "平板支撑触肩", "低冲击 HIIT 组合", "核心燃脂收尾"],
  strength: ["下肢力量循环", "臀腿强化组合", "核心稳定训练", "上肢推墙进阶", "低冲击间歇训练", "全身代谢收尾"],
};

const MEALS = {
  Sustainable: {
    low: { title: "减重日 · 高状态平衡饮食", breakfast: "希腊酸奶/鸡蛋 + 全麦吐司 + 水果", lunch: "鸡胸肉/豆腐 + 糙米/土豆 + 大量蔬菜", dinner: "鱼类/瘦肉 + 沙拉 + 适量复合碳水", snack: "坚果或无糖酸奶", principle: "保持轻微热量缺口，但不极端节食。" },
    medium: { title: "减重日 · 低压力稳定饮食", breakfast: "鸡蛋 + 燕麦/全麦面包 + 水果", lunch: "蛋白质 + 蔬菜 + 适量主食", dinner: "七分饱，优先蛋白质和蔬菜", snack: "水果/酸奶", principle: "重点是规律和稳定，而不是吃得很少。" },
    high: { title: "减重日 · 恢复型健康饮食", breakfast: "燕麦 + 牛奶/豆奶 + 香蕉", lunch: "鸡肉/豆类 + 米饭 + 熟蔬菜", dinner: "汤类 + 蛋白质 + 蔬菜", snack: "健康加餐，避免过饿", principle: "高压力日不要极端控卡，优先稳定血糖和食欲。" },
  },
  Restart: {
    low: { title: "重启日 · 规律饮食版", breakfast: "鸡蛋 + 全麦主食 + 水果", lunch: "蛋白质 + 蔬菜 + 主食", dinner: "正常吃晚餐，避免运动后不吃", snack: "健康小零食", principle: "先恢复规律和信心，不追求严格控卡。" },
    medium: { title: "重启日 · 轻负担版", breakfast: "简单高蛋白早餐", lunch: "均衡便当，减少油炸和含糖饮料", dinner: "份量适中，吃到舒服为止", snack: "酸奶/坚果", principle: "把节奏找回来，比体重变化更重要。" },
    high: { title: "重启日 · 恢复优先版", breakfast: "燕麦粥 + 鸡蛋", lunch: "热食优先，减少高油食物", dinner: "清淡但完整，保证蛋白质和碳水", snack: "允许健康加餐", principle: "身体恢复时，饮食目标是支持重新开始。" },
  },
  Tone: {
    low: { title: "塑形日 · 高蛋白均衡版", breakfast: "鸡蛋/酸奶 + 全麦主食 + 水果", lunch: "优质蛋白 + 复合碳水 + 蔬菜", dinner: "保证蛋白质，减少空热量", snack: "训练后酸奶/蛋白奶昔", principle: "塑形日注意蛋白质和恢复，不靠挨饿。" },
    medium: { title: "塑形日 · 轻强度版", breakfast: "高蛋白早餐 + 适量主食", lunch: "平衡搭配，避免高盐高油", dinner: "蛋白质优先 + 蔬菜 + 主食", snack: "水果或坚果", principle: "支持轻运动恢复，避免营养不足。" },
    high: { title: "塑形日 · 恢复支持版", breakfast: "温和早餐 + 足量水分", lunch: "蛋白质 + 温和碳水 + 蔬菜", dinner: "清淡但完整，不只吃沙拉", snack: "精力差可加健康加餐", principle: "恢复日也要吃够营养，避免代偿性进食。" },
  },
};

const FRIENDS = [
  { name: "Emma", text: "完成了 4 分钟恢复训练", badge: "Reset Win", emoji: "🌱" },
  { name: "Lucas", text: "连续打卡 15 天，解锁老手模式", badge: "Pro Mode", emoji: "🔥" },
  { name: "Mia", text: "完成了进阶核心训练", badge: "Advanced", emoji: "⭐" },
];

const RESET_OPTIONS = [
  { key: "soft", title: "4 分钟恢复训练", minutes: 4, style: "reset", desc: "适合中断后不想运动、压力大或睡前恢复。" },
  { key: "sweat", title: "10 分钟轻出汗训练", minutes: 10, style: "balanced", desc: "适合想找回节奏，但不想太累。" },
  { key: "back", title: "15 分钟重新进入计划", minutes: 15, style: "energizing", desc: "适合状态不错，想直接回到原计划。" },
];

const RESET_REASONS = {
  "工作太忙": { option: "soft", insight: "你不是不想坚持，而是时间被挤压了。今天先用 4 分钟恢复连续性。", reminder: "工作日傍晚改成更短提醒，减少负担。" },
  "身体不舒服": { option: "soft", insight: "身体不舒服时不适合强推训练，先做低冲击恢复和拉伸。", reminder: "未来检测到睡眠差或酸痛高时，自动切到保护版。" },
  "没看到效果": { option: "sweat", insight: "体重没变化不代表没进步，今天用 10 分钟轻出汗训练找回反馈感。", reminder: "优先展示围度、步数、完成次数和身体轻盈感。" },
  "情绪不好": { option: "soft", insight: "情绪低落时先降低开始成本，用 4 分钟完成一次成功重启。", reminder: "减少压力话术，增加鼓励式 Coach 消息。" },
  "想重新认真开始": { option: "back", insight: "你已经准备好回到计划，可以用 15 分钟重新进入节奏。", reminder: "未来保持进阶提醒，但保留一键降级。" },
};

const AI_VISION_TIPS = {
  "椅子深蹲": { score: 86, tip: "膝盖方向基本正确，注意下蹲时臀部向后坐，避免膝盖内扣。" },
  "墙面俯卧撑": { score: 82, tip: "肩、髋、脚跟保持一条直线，推起时不要耸肩。" },
  "低冲击开合步": { score: 90, tip: "节奏稳定，落脚轻一点，可以减少膝盖压力。" },
  "深蹲": { score: 78, tip: "动作略快，建议降低速度，保持核心收紧。" },
  "睡前拉伸": { score: 94, tip: "动作很好，保持自然呼吸，不需要追求拉伸幅度。" },
};

const MOOD_LABELS = { 1: "低落", 2: "有压力", 3: "平稳", 4: "不错", 5: "积极" };
const SLEEP_LABELS = { 1: "很差", 2: "偏差", 3: "一般", 4: "不错", 5: "很好" };

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function recoveryBucket(state, mood, energy, sleepQuality, soreness) {
  const base = USER_STATES[state]?.recoveryNeed || "medium";
  if (mood <= 2 || energy <= 2 || sleepQuality <= 2 || soreness >= 4) return "high";
  if (mood >= 4 && energy >= 4 && sleepQuality >= 4 && soreness <= 2 && base === "low") return "low";
  if (base === "high") return "high";
  return "medium";
}
function workoutCount(minutes) { return minutes <= 5 ? 3 : minutes <= 8 ? 4 : minutes <= 12 ? 5 : 6; }
function inferPhase({ activeDays, streak, interruptions, completionRate }) {
  if (interruptions >= 4 || completionRate < 45) return { phase: "Restart", reason: "最近中断较多或完成率偏低，系统先降低门槛，优先帮你恢复节奏。" };
  if ((activeDays >= 21 || streak >= 14) && completionRate >= 70 && interruptions <= 2) return { phase: "Upgrade", reason: "你已经稳定坚持一段时间且中断较少，可以开启老手模式，提高训练效率。" };
  if ((activeDays >= 8 || streak >= 7) && completionRate >= 55 && interruptions <= 3) return { phase: "Build", reason: "你已经完成了基础重启，可以进入养成期，逐步增加动作密度。" };
  return { phase: "Restart", reason: "当前仍以低门槛重启为主，先让行动稳定发生。" };
}
function inferDifficulty({ phase, activeDays, streak, interruptions, completionRate, injuryRisk }) {
  if (injuryRisk === "膝盖/腰背不适") return { level: "保护版", score: 1, desc: "检测到身体风险，优先低冲击和安全动作，暂不升级跳跃或高强度。" };
  if (phase === "Upgrade" && activeDays >= 28 && streak >= 21 && completionRate >= 80 && interruptions <= 1) return { level: "老手强化", score: 4, desc: "连续性很好，可加入更高密度的力量和低冲击间歇训练。" };
  if (phase === "Upgrade") return { level: "老手入门", score: 3, desc: "已解锁老手模式，动作从基础版升级为进阶低冲击训练。" };
  if (phase === "Build") return { level: "进阶基础", score: 2, desc: "开始增加训练密度，但仍保留可完成性。" };
  return { level: "轻量重启", score: 1, desc: "先降低门槛，避免一开始因强度太高而放弃。" };
}
function healthScore({ mood, energy, sleepQuality, soreness, water, protein, vegetables, snacks, stepsBase, waistChange, lightness }) {
  const waterScore = clamp((water / 8) * 16, 0, 16);
  const proteinScore = clamp((protein / 3) * 10, 0, 10);
  const vegetableScore = clamp((vegetables / 3) * 10, 0, 10);
  const snackPenalty = clamp(snacks * 5, 0, 30);
  const recoveryScore = (mood + energy + sleepQuality + lightness) * 4;
  const sorenessPenalty = Math.max(0, soreness - 2) * 6;
  const movementScore = clamp((stepsBase / 8000) * 16, 0, 16);
  const waistBonus = waistChange < 0 ? 8 : waistChange === 0 ? 3 : 0;
  return clamp(Math.round(waterScore + proteinScore + vegetableScore + recoveryScore + movementScore + waistBonus - sorenessPenalty - snackPenalty), 20, 100);
}
function timeAdjustmentDetail({ phase, state, mood, energy, sleepQuality, soreness, injuryRisk, difficulty, health }) {
  const phaseBase = PHASES[phase].baseMinutes;
  const stateDelta = USER_STATES[state]?.timeDelta || 0;
  const moodDelta = mood >= 4 ? 1 : mood <= 2 ? -2 : 0;
  const energyDelta = energy >= 4 ? 2 : energy <= 2 ? -3 : 0;
  const sleepDelta = sleepQuality >= 4 ? 1 : sleepQuality <= 2 ? -3 : 0;
  const sorenessDelta = soreness >= 4 ? -4 : soreness <= 2 ? 1 : 0;
  const difficultyDelta = difficulty.score >= 4 ? 3 : difficulty.score === 3 ? 1 : difficulty.score === 2 ? 1 : 0;
  const healthDelta = health >= 80 ? 2 : health < 50 ? -3 : 0;
  const riskDelta = injuryRisk === "膝盖/腰背不适" ? -4 : 0;
  const hardCap = USER_STATES[state]?.hardCap || null;
  const raw = phaseBase + stateDelta + moodDelta + energyDelta + sleepDelta + sorenessDelta + difficultyDelta + healthDelta + riskDelta;
  let finalMinutes = clamp(raw, PHASES[phase].min, PHASES[phase].max);
  if (hardCap) finalMinutes = Math.min(finalMinutes, hardCap);
  if (injuryRisk === "膝盖/腰背不适") finalMinutes = Math.min(finalMinutes, 8);
  return { finalMinutes: Math.round(finalMinutes), items: [
    ["阶段基础", phaseBase], ["状态调整", stateDelta], ["心情调整", moodDelta], ["精力调整", energyDelta], ["睡眠调整", sleepDelta], ["酸痛调整", sorenessDelta], ["健康程度", healthDelta], ["难度等级", difficultyDelta], ["风险保护", riskDelta],
  ] };
}
function workoutStyle(state, mood, energy, phase, difficulty, sleepQuality, soreness) {
  const preferred = USER_STATES[state]?.preferredStyle || "balanced";
  if (mood <= 2 || energy <= 2 || sleepQuality <= 2 || soreness >= 4) return state === "我今天很累" ? "recovery" : "reset";
  if (phase === "Upgrade" && difficulty?.score >= 4) return "strength";
  if (phase === "Upgrade" && (preferred === "balanced" || preferred === "energizing")) return preferred;
  return preferred;
}
function chooseExercises(style, difficulty, minutes) {
  const useAdvanced = difficulty?.score >= 3 && ADVANCED_WORKOUT_LIBRARY[style];
  const library = useAdvanced ? ADVANCED_WORKOUT_LIBRARY[style] : WORKOUT_LIBRARY[style];
  return (library || WORKOUT_LIBRARY.balanced).slice(0, workoutCount(minutes));
}
function inferUserType({ reason, emotionalEating, timeAvailable, foundation, goal }) {
  if (emotionalEating === "经常") return { type: "情绪进食型", insight: "你真正的难点不是不懂减重，而是在压力和情绪波动时容易被饮食打乱节奏。" };
  if (timeAvailable === "5分钟" || reason === "没时间") return { type: "时间碎片型", insight: "你需要的不是完整训练课，而是能插进日常生活的 5-10 分钟微行动。" };
  if (foundation === "几乎不运动" || reason === "懒得开始") return { type: "低动力重启型", insight: "你不是没有目标，而是开始成本太高。EaseFit 会先帮你把门槛降下来。" };
  if (goal === "Sustainable") return { type: "久坐轻运动型", insight: "你适合从久坐激活、低冲击动作和稳定饮食节奏开始。" };
  return { type: "久坐轻运动型", insight: "你需要一个低压力但能逐步升级的计划，而不是一开始就高强度训练。" };
}
function getPhaseReview(day, completionRate, weightChanged, interruptions, activeDays, streak) {
  if (interruptions >= 3) return { title: `Day ${day} 复盘：先强化重启机制`, advice: "你最近经常中断，所以系统会继续降低任务门槛，把计划控制在 4-8 分钟，并优先推送 Reset Coach。", action: "继续 Restart + 开启 7-Day Reset" };
  if ((activeDays >= 21 || streak >= 14) && completionRate >= 70 && interruptions <= 2) return { title: `Day ${day} 复盘：已满足老手模式条件`, advice: "你的坚持时间、完成率和中断控制都达标。下一阶段将提升动作密度，加入进阶低冲击力量和核心训练。", action: "解锁老手模式 + 进阶运动难度" };
  if (completionRate >= 70 && !weightChanged) return { title: `Day ${day} 复盘：行动很好，开始提高减重效率`, advice: "你的完成率不错，但体重变化不明显。下一阶段建议加入饮食轻记录、提高动作密度，或增加基础力量训练。", action: "加入饮食轻记录 + 升级训练密度" };
  if (completionRate >= 70 && weightChanged) return { title: `Day ${day} 复盘：可以进入更明确的减重阶段`, advice: "你已经形成初步习惯，可以从轻量行动进入更有目标的减重计划，但仍然保持低冲击和可持续。", action: "进入 Build / Upgrade" };
  return { title: `Day ${day} 复盘：继续保持低压力完成`, advice: "你已经开始行动，但还不需要急着升级。先把完成率稳定下来，系统会继续给你更容易完成的计划。", action: "维持当前阶段" };
}
function buildPlan({ goal, phase, state, mood, energy, injuryRisk, sittingHours, resetOverride, difficulty, sleepQuality, soreness, health }) {
  const safeMood = clamp(Number(mood) || 3, 1, 5);
  const safeEnergy = clamp(Number(energy) || 3, 1, 5);
  const bucket = recoveryBucket(state, safeMood, safeEnergy, sleepQuality, soreness);
  const chosenReset = RESET_OPTIONS.find((r) => r.key === resetOverride);
  const adjustment = timeAdjustmentDetail({ phase, state, mood: safeMood, energy: safeEnergy, sleepQuality, soreness, injuryRisk, difficulty, health });
  const minutes = chosenReset ? chosenReset.minutes : adjustment.finalMinutes;
  const style = chosenReset ? chosenReset.style : workoutStyle(state, safeMood, safeEnergy, phase, difficulty, sleepQuality, soreness);
  const exercises = chosenReset ? WORKOUT_LIBRARY[style].slice(0, workoutCount(minutes)) : chooseExercises(style, difficulty, minutes);
  const selectedGoal = GOALS[goal] || GOALS.Sustainable;
  const phaseFactor = phase === "Restart" ? 0.85 : phase === "Build" ? 1 : 1.18;
  const difficultyFactor = difficulty?.score === 4 ? 1.18 : difficulty?.score === 3 ? 1.1 : difficulty?.score === 2 ? 1.04 : 1;
  const riskPenalty = injuryRisk === "膝盖/腰背不适" ? 0.85 : 1;
  const sedentaryBoost = sittingHours >= 8 ? 1.05 : 1;
  const calories = Math.round(selectedGoal.baseCalories * USER_STATES[state].intensity * (0.75 + (safeMood + safeEnergy) / 20) * phaseFactor * difficultyFactor * (minutes / 10) * riskPenalty * sedentaryBoost);
  return {
    minutes, style, exercises, calories, bucket, timeAdjustment: adjustment,
    meal: MEALS[goal][bucket],
    riskTag: injuryRisk === "膝盖/腰背不适" ? "低冲击保护版" : sittingHours >= 8 ? "久坐激活版" : "标准轻运动版",
    coach: chosenReset ? "欢迎回来。中断不是失败，这次行动会被记录为一次成功重启。" : safeMood <= 2 || safeEnergy <= 2 || sleepQuality <= 2 ? "今天先做轻恢复版就够了，目标是完成，而不是拼强度。" : USER_STATES[state].coachTone,
  };
}
function getProgressMetrics({ completed, difficulty, sittingHours, mood, energy, sleepQuality, lightness, waist, lastWaist, weeklyBaseMinutes }) {
  const weeklyMinutes = weeklyBaseMinutes + (completed ? 12 : 0) + Math.max(0, difficulty.score - 1) * 8;
  const completionCount = completed ? 6 : 5;
  const stepsImprove = sittingHours >= 8 ? 18 : 10;
  const waistChange = Number((waist - lastWaist).toFixed(1));
  return {
    weeklyMinutes,
    completionCount,
    stepsImprove,
    moodState: MOOD_LABELS[mood],
    sleepFeeling: SLEEP_LABELS[sleepQuality],
    lightnessLabel: lightness >= 4 ? "明显更轻" : lightness === 3 ? "有一点改善" : "仍在恢复",
    waistChange,
    processMessage: "体重是结果指标，行动和状态是过程指标。体重下降前，你也正在发生变化。",
  };
}
function recommendResetOption({ reason, daysAway, completionRate, weightChanged, mood, energy, sleepQuality }) {
  const mapped = RESET_REASONS[reason] || RESET_REASONS["工作太忙"];
  let option = mapped.option;
  if (daysAway >= 5 || mood <= 2 || energy <= 2 || sleepQuality <= 2) option = "soft";
  if (reason === "没看到效果" && completionRate >= 70 && !weightChanged) option = "sweat";
  if (reason === "想重新认真开始" && mood >= 4 && energy >= 4) option = "back";
  return { ...mapped, option, plan: RESET_OPTIONS.find((item) => item.key === option) };
}
function detectChurnPattern({ daysAway, interruptions, weightChanged, completionRate, mood }) {
  if (daysAway >= 2 && interruptions >= 2) return "你最近呈现“中断后回归困难”的模式，系统会提前推送 4 分钟 Reset，而不是等你完全流失。";
  if (!weightChanged && completionRate >= 70) return "你属于“行动做了但体重反馈慢”的风险，系统会优先展示围度、步数和身体轻盈感。";
  if (mood <= 2) return "你在情绪低时更容易中断，系统会减少压力提醒，改成温柔陪伴话术。";
  return "当前流失风险可控，系统会保持轻提醒和阶段反馈。";
}
function getVisionFeedback(exercise, postureMode) {
  const base = AI_VISION_TIPS[exercise] || { score: 84, tip: "动作整体稳定，继续保持慢速和低冲击。" };
  if (postureMode === "需要纠正") return { score: Math.max(62, base.score - 18), tip: `AI 检测到动作需要调整：${base.tip}` };
  if (postureMode === "动作标准") return { score: Math.min(98, base.score + 6), tip: `动作质量不错：${base.tip}` };
  return base;
}
function runSelfTests() {
  const t = inferUserType({ reason: "没时间", emotionalEating: "偶尔", timeAvailable: "5分钟", foundation: "一般", goal: "Restart" });
  console.assert(t.type === "时间碎片型", "Onboarding 类型判断失败");
  const growth = inferPhase({ activeDays: 22, streak: 16, interruptions: 1, completionRate: 78 });
  console.assert(growth.phase === "Upgrade", "坚持时间长且中断少应进入老手模式");
  const fallback = inferPhase({ activeDays: 30, streak: 2, interruptions: 4, completionRate: 42 });
  console.assert(fallback.phase === "Restart", "中断次数高应回到重启策略");
  const diff = inferDifficulty({ phase: "Upgrade", activeDays: 30, streak: 22, interruptions: 1, completionRate: 85, injuryRisk: "无明显不适" });
  console.assert(diff.level === "老手强化", "高坚持用户应进入老手强化");
  const lowHealthPlan = buildPlan({ goal: "Restart", phase: "Restart", state: "我今天压力很大", mood: 1, energy: 2, injuryRisk: "无明显不适", sittingHours: 8, difficulty: { score: 1 }, sleepQuality: 2, soreness: 4, health: 42 });
  console.assert(lowHealthPlan.minutes <= 5 && lowHealthPlan.style === "reset", "低健康状态应减少时间并进入 reset");
  const healthyFoodScore = healthScore({ mood: 4, energy: 4, sleepQuality: 4, soreness: 1, water: 7, protein: 3, vegetables: 3, snacks: 0, stepsBase: 7000, waistChange: -0.5, lightness: 4 });
  const highSnackScore = healthScore({ mood: 4, energy: 4, sleepQuality: 4, soreness: 1, water: 7, protein: 3, vegetables: 3, snacks: 5, stepsBase: 7000, waistChange: -0.5, lightness: 4 });
  console.assert(highSnackScore < healthyFoodScore, "高糖零食次数增加应降低健康值");
  const highHealthPlan = buildPlan({ goal: "Tone", phase: "Upgrade", state: "我想出汗", mood: 5, energy: 5, injuryRisk: "无明显不适", sittingHours: 6, difficulty: { score: 4 }, sleepQuality: 5, soreness: 1, health: 88 });
  console.assert(highHealthPlan.minutes >= 18 && highHealthPlan.style === "strength", "高健康老手强化应增加时间并进入 strength");
  const progress = getProgressMetrics({ completed: true, difficulty: { score: 3 }, sittingHours: 8, mood: 4, energy: 4, sleepQuality: 3, lightness: 4, waist: 72.5, lastWaist: 73.2, weeklyBaseMinutes: 52 });
  console.assert(progress.waistChange < 0 && progress.weeklyMinutes > 52, "进度指标应包含围度变化和本周分钟数");
  const reset = recommendResetOption({ reason: "没看到效果", daysAway: 3, completionRate: 80, weightChanged: false, mood: 3, energy: 3, sleepQuality: 3 });
  console.assert(reset.option === "sweat", "没看到效果且完成率高时应推荐 10 分钟轻出汗训练");
  const vision = getVisionFeedback("椅子深蹲", "需要纠正");
  console.assert(vision.score < 80, "AI 影像识别到动作需要纠正时分数应下降");
}
runSelfTests();

function Card({ children, className = "" }) { return <div className={`rounded-[28px] border border-slate-100 bg-white shadow-sm ${className}`}>{children}</div>; }
function Button({ children, active = false, className = "", ...props }) { return <button className={`rounded-2xl px-4 py-2 text-sm font-bold transition active:scale-[0.98] ${active ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50"} ${className}`} {...props}>{children}</button>; }
function Bar({ label, value }) { return <div><div className="mb-2 flex justify-between text-sm"><span className="font-bold">{label}</span><span className="text-slate-500">{value}%</span></div><div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${value}%` }} /></div></div>; }
function StatCard({ label, value, sub, tone = "slate" }) { const bg = tone === "green" ? "bg-emerald-50 text-emerald-900" : tone === "orange" ? "bg-orange-50 text-orange-900" : "bg-slate-50 text-slate-900"; return <div className={`rounded-2xl p-4 ${bg}`}><p className="text-xs font-bold opacity-70">{label}</p><p className="mt-1 text-2xl font-black">{value}</p>{sub && <p className="mt-1 text-xs opacity-70">{sub}</p>}</div>; }
function Stepper({ label, value, setValue, min = 0, max = 10, suffix = "" }) { return <div className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-black">{label}</p><p className="mt-1 text-2xl font-black text-emerald-600">{value}{suffix}</p></div><div className="flex gap-2"><button onClick={() => setValue((v) => clamp(Number((v - 1).toFixed(1)), min, max))} className="h-9 w-9 rounded-xl bg-white font-black shadow-sm">−</button><button onClick={() => setValue((v) => clamp(Number((v + 1).toFixed(1)), min, max))} className="h-9 w-9 rounded-xl bg-emerald-600 font-black text-white">+</button></div></div></div>; }
function BottomNav({ tab, setTab }) { const items = [["today", "🏠", "今日"], ["coach", "🤖", "教练"], ["progress", "📈", "进度"], ["community", "👥", "社区"], ["profile", "👤", "我的"]]; return <div className="fixed bottom-4 left-1/2 z-40 grid w-[calc(100%-32px)] max-w-xl -translate-x-1/2 grid-cols-5 rounded-[28px] border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur md:hidden">{items.map(([key, icon, label]) => <button key={key} onClick={() => setTab(key)} className={`rounded-2xl py-2 text-xs font-bold ${tab === key ? "bg-emerald-600 text-white" : "text-slate-500"}`}><div className="text-lg">{icon}</div>{label}</button>)}</div>; }
function SideNav({ tab, setTab, onboardingDone }) { const items = [["today", "🏠", "Today"], ["coach", "🤖", "AI Coach"], ["progress", "📈", "Progress"], ["community", "👥", "Community"], ["profile", "👤", "Profile"], ["premium", "👑", "Premium"]]; return <aside className="hidden w-64 shrink-0 border-r border-slate-100 bg-white p-5 md:block"><div className="mb-8 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-600 text-xl font-black text-white">E</div><div><p className="text-xl font-black">EaseFit</p><p className="text-xs text-slate-500">Reset gently</p></div></div>{!onboardingDone && <div className="mb-4 rounded-3xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">先完成 2 分钟轻量 Onboarding</div>}<div className="space-y-2">{items.map(([key, icon, label]) => <button key={key} onClick={() => setTab(key)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold ${tab === key ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}><span>{icon}</span>{label}</button>)}</div></aside>; }
function ChoiceGroup({ title, options, value, onChange }) { return <div><p className="mb-2 text-sm font-bold">{title}</p><div className="flex flex-wrap gap-2">{options.map((item) => <Button key={item.value || item} active={value === (item.value || item)} onClick={() => onChange(item.value || item)}>{item.label || item}</Button>)}</div></div>; }
function DifficultyBadge({ phase, difficulty }) { return <div className={`rounded-3xl p-4 ${phase === "Upgrade" ? "bg-orange-50 text-orange-900" : "bg-emerald-50 text-emerald-900"}`}><p className="text-xs font-black uppercase tracking-[0.15em]">Auto Growth</p><p className="mt-1 text-xl font-black">{PHASES[phase].label} · {difficulty.level}</p><p className="mt-2 text-sm leading-6 opacity-80">{difficulty.desc}</p></div>; }

export default function EaseFitProductApp() {
  const [tab, setTab] = useState("today");
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [goal, setGoal] = useState("Sustainable");
  const [timeAvailable, setTimeAvailable] = useState("10分钟");
  const [failureReason, setFailureReason] = useState("懒得开始");
  const [foundation, setFoundation] = useState("几乎不运动");
  const [emotionalEating, setEmotionalEating] = useState("偶尔");
  const [reminderStyle, setReminderStyle] = useState("温柔鼓励");
  const [state, setState] = useState("我今天很累");
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [soreness, setSoreness] = useState(2);
  const [lightness, setLightness] = useState(3);
  const [sittingHours, setSittingHours] = useState(8);
  const [injuryRisk, setInjuryRisk] = useState("无明显不适");
  const [completed, setCompleted] = useState(false);
  const [water, setWater] = useState(4);
  const [protein, setProtein] = useState(2);
  const [vegetables, setVegetables] = useState(2);
  const [snacks, setSnacks] = useState(1);
  const [fasting, setFasting] = useState(false);
  const [streak, setStreak] = useState(5);
  const [activeDays, setActiveDays] = useState(9);
  const [daysAway, setDaysAway] = useState(3);
  const [resetOverride, setResetOverride] = useState(null);
  const [resetReason, setResetReason] = useState("工作太忙");
  const [selectedExercise, setSelectedExercise] = useState("椅子深蹲");
  const [cameraOn, setCameraOn] = useState(false);
  const [postureMode, setPostureMode] = useState("动作标准");
  const [completionRate, setCompletionRate] = useState(72);
  const [weightChanged, setWeightChanged] = useState(false);
  const [interruptions, setInterruptions] = useState(1);
  const [weeklyBaseMinutes, setWeeklyBaseMinutes] = useState(52);
  const [stepsBase, setStepsBase] = useState(6800);
  const [lastWaist, setLastWaist] = useState(73.2);
  const [waist, setWaist] = useState(72.5);
  const [hip, setHip] = useState(96.0);
  const [chat, setChat] = useState(["早上好，我会根据你今天的状态、睡眠、酸痛和健康记录自动调整运动时间，不需要你硬撑。"]);
  const [coachInput, setCoachInput] = useState("");

  const userType = useMemo(() => inferUserType({ reason: failureReason, emotionalEating, timeAvailable, foundation, goal }), [failureReason, emotionalEating, timeAvailable, foundation, goal]);
  const autoGrowth = useMemo(() => inferPhase({ activeDays, streak, interruptions, completionRate }), [activeDays, streak, interruptions, completionRate]);
  const phase = autoGrowth.phase;
  const difficulty = useMemo(() => inferDifficulty({ phase, activeDays, streak, interruptions, completionRate, injuryRisk }), [phase, activeDays, streak, interruptions, completionRate, injuryRisk]);
  const health = useMemo(() => healthScore({ mood, energy, sleepQuality, soreness, water, protein, vegetables, snacks, stepsBase, waistChange: waist - lastWaist, lightness }), [mood, energy, sleepQuality, soreness, water, protein, vegetables, snacks, stepsBase, waist, lastWaist, lightness]);
  const plan = useMemo(() => buildPlan({ goal, phase, state, mood, energy, injuryRisk, sittingHours, resetOverride, difficulty, sleepQuality, soreness, health }), [goal, phase, state, mood, energy, injuryRisk, sittingHours, resetOverride, difficulty, sleepQuality, soreness, health]);
  const phaseReview = useMemo(() => getPhaseReview(PHASES[phase].reviewDay, completionRate, weightChanged, interruptions, activeDays, streak), [phase, completionRate, weightChanged, interruptions, activeDays, streak]);
  const progressMetrics = useMemo(() => getProgressMetrics({ completed, difficulty, sittingHours, mood, energy, sleepQuality, lightness, waist, lastWaist, weeklyBaseMinutes }), [completed, difficulty, sittingHours, mood, energy, sleepQuality, lightness, waist, lastWaist, weeklyBaseMinutes]);
  const resetRecommendation = useMemo(() => recommendResetOption({ reason: resetReason, daysAway, completionRate, weightChanged, mood, energy, sleepQuality }), [resetReason, daysAway, completionRate, weightChanged, mood, energy, sleepQuality]);
  const churnPattern = useMemo(() => detectChurnPattern({ daysAway, interruptions, weightChanged, completionRate, mood }), [daysAway, interruptions, weightChanged, completionRate, mood]);
  const visionFeedback = useMemo(() => getVisionFeedback(selectedExercise, postureMode), [selectedExercise, postureMode]);
  const riskScore = injuryRisk === "膝盖/腰背不适" ? 72 : sittingHours >= 8 ? 54 : 28;
  const habit = phase === "Restart" ? 42 : phase === "Build" ? 68 : 86;
  const confidence = completed ? 76 : 58;
  const mobility = phase === "Upgrade" ? 82 : phase === "Build" ? 63 : 39;
  const unlockProgress = clamp(Math.round(((streak / 14) * 45) + ((activeDays / 21) * 35) + ((completionRate / 100) * 20) - interruptions * 8), 0, 100);

  function finishWorkout() {
    setCompleted(true);
    setStreak((s) => s + 1);
    setActiveDays((d) => d + 1);
    setWeeklyBaseMinutes((m) => m + plan.minutes);
    setStepsBase((s) => s + Math.round(plan.minutes * 75));
    setLightness((v) => clamp(v + 1, 1, 5));
    setDaysAway(0);
    setChat((list) => [...list, phase === "Upgrade" ? "完成得很好。今天的进阶训练会计入老手模式成长值。" : "完成得很好。今天记录的是一次成功行动，不是体重数字。"]);
  }
  function chooseReset(key) {
    setResetOverride(key);
    setTab("today");
    setDaysAway(0);
    setChat((list) => [...list, "欢迎回来。我们不会清零你的进度，这次会记录为一次成功重启。"]);
  }
  function sendCoachMessage() { if (!coachInput.trim()) return; const reply = health < 50 ? "你的健康程度偏低，今天我会减少运动时间，优先恢复、补水和睡眠，不会强推高强度。" : phase === "Upgrade" ? "你已经进入老手模式，但我仍会根据状态调节时间。如果睡眠差或酸痛高，会自动降级。" : "你今天可以按推荐计划完成，结束后记录一个非体重进步，比如精神更清醒、步数提升或围度变化。"; setChat((list) => [...list, coachInput, reply]); setCoachInput(""); }

  return (
    <div className="min-h-screen bg-[#F6F8F3] text-slate-900">
      <div className="flex min-h-screen">
        <SideNav tab={tab} setTab={setTab} onboardingDone={onboardingDone} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 md:px-8 md:pb-10">
          <div className="mb-6 flex items-center justify-between md:hidden"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-emerald-600 font-black text-white">E</div><div><p className="font-black">EaseFit</p><p className="text-xs text-slate-500">AI companion</p></div></div><button onClick={() => setTab("premium")} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Premium</button></div>

          {!onboardingDone && <Card className="mb-6 overflow-hidden border-emerald-100"><div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]"><div><p className="text-sm font-bold text-emerald-700">2-min Onboarding</p><h1 className="mt-2 text-3xl font-black">先判断你的减重困难类型</h1><p className="mt-3 leading-7 text-slate-600">EaseFit 不会一开始收集大量信息，只快速理解你为什么过去没坚持下来，再给你一个更容易开始的计划。</p><div className="mt-5 rounded-3xl bg-emerald-50 p-5"><p className="text-sm font-bold text-emerald-700">当前判断</p><p className="mt-1 text-2xl font-black text-emerald-900">{userType.type}</p><p className="mt-2 text-sm leading-6 text-emerald-800">{userType.insight}</p></div></div><div className="space-y-5"><ChoiceGroup title="你的目标是什么？" value={goal} onChange={setGoal} options={Object.entries(GOALS).map(([value, item]) => ({ value, label: item.label }))} /><ChoiceGroup title="每天通常有多少时间？" value={timeAvailable} onChange={setTimeAvailable} options={["5分钟", "10分钟", "15分钟"]} /><ChoiceGroup title="过去为什么没有坚持？" value={failureReason} onChange={setFailureReason} options={["没时间", "懒得开始", "压力大", "看不到变化"]} /><ChoiceGroup title="当前运动基础" value={foundation} onChange={setFoundation} options={["几乎不运动", "偶尔运动", "有一点基础"]} /><ChoiceGroup title="是否容易情绪性进食？" value={emotionalEating} onChange={setEmotionalEating} options={["很少", "偶尔", "经常"]} /><ChoiceGroup title="希望如何提醒你？" value={reminderStyle} onChange={setReminderStyle} options={["温柔鼓励", "明确提醒", "少提醒"]} /><button onClick={() => setOnboardingDone(true)} className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white">完成 Onboarding，进入今日计划</button></div></div></Card>}

          {tab === "today" && <div className="space-y-6">{daysAway >= 2 && <Card className="border-orange-100 bg-orange-50 p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="font-black text-orange-900">你已经 {daysAway} 天没打开 EaseFit</p><p className="mt-1 text-sm text-orange-800">这不是失败。要不要用 4 分钟重新开始？</p></div><button onClick={() => setTab("coach")} className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black text-white">打开 Reset Coach</button></div></Card>}
            <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"><Card className="overflow-hidden bg-slate-950 text-white"><div className="p-6 md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-emerald-200">Today · {PHASES[phase].label} {PHASES[phase].cn} · {difficulty.level}</p><h1 className="mt-2 text-3xl font-black md:text-5xl">{plan.minutes} 分钟{phase === "Upgrade" ? "进阶" : "微"}运动</h1><p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">{plan.coach}</p></div><div className="rounded-3xl bg-white/10 p-4 text-4xl">{phase === "Upgrade" ? "⚡" : "🌿"}</div></div><div className="mt-6 grid gap-3 sm:grid-cols-4"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-emerald-100">健康程度</p><p className="mt-1 font-black">{health}/100</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-emerald-100">预计消耗</p><p className="mt-1 font-black">{plan.calories} kcal</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-emerald-100">本周运动</p><p className="mt-1 font-black">{progressMetrics.weeklyMinutes} min</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-emerald-100">策略</p><p className="mt-1 font-black">{plan.riskTag}</p></div></div></div></Card><Card className="p-6"><p className="text-sm font-bold text-slate-500">今天你的状态是？</p><div className="mt-4 space-y-4"><div className="flex flex-wrap gap-2">{Object.keys(USER_STATES).map((item) => <Button key={item} active={state === item} onClick={() => { setState(item); setResetOverride(null); }}>{item}</Button>)}</div><div><p className="mb-2 text-sm font-bold">心情 {mood}/5 · {MOOD_LABELS[mood]}</p><input type="range" min="1" max="5" value={mood} onChange={(e) => setMood(Number(e.target.value))} className="w-full" /></div><div><p className="mb-2 text-sm font-bold">精力 {energy}/5</p><input type="range" min="1" max="5" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full" /></div><div><p className="mb-2 text-sm font-bold">睡眠 {sleepQuality}/5 · {SLEEP_LABELS[sleepQuality]}</p><input type="range" min="1" max="5" value={sleepQuality} onChange={(e) => setSleepQuality(Number(e.target.value))} className="w-full" /></div><div><p className="mb-2 text-sm font-bold">身体酸痛 {soreness}/5</p><input type="range" min="1" max="5" value={soreness} onChange={(e) => setSoreness(Number(e.target.value))} className="w-full" /></div></div></Card></section>
            <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><Card className="p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-bold text-slate-500">Daily Plan · {difficulty.level}</p><h2 className="text-2xl font-black">今日动作</h2></div><Button active={completed} onClick={finishWorkout}>{completed ? "已完成 ✓" : "完成训练"}</Button></div><DifficultyBadge phase={phase} difficulty={difficulty} /><div className="mt-4 rounded-3xl bg-slate-50 p-4"><p className="text-sm font-black">为什么今天是 {plan.minutes} 分钟？</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{plan.timeAdjustment.items.map(([label, value]) => <div key={label} className="rounded-2xl bg-white p-3 text-sm"><p className="text-slate-500">{label}</p><p className={`font-black ${value > 0 ? "text-emerald-600" : value < 0 ? "text-orange-600" : "text-slate-600"}`}>{value > 0 ? `+${value}` : value} min</p></div>)}</div></div><div className="mt-4 space-y-3">{plan.exercises.map((item, i) => <button key={item} onClick={() => setSelectedExercise(item)} className={`flex w-full items-center justify-between rounded-2xl p-4 text-left ${phase === "Upgrade" ? "bg-orange-50" : "bg-emerald-50"}`}><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-2xl font-black text-white ${phase === "Upgrade" ? "bg-orange-600" : "bg-emerald-600"}`}>{i + 1}</div><div><p className="font-black">{item}</p><p className="text-xs text-slate-500">{phase === "Upgrade" ? "进阶低冲击 · 强度升级 · 可降级" : "低冲击 · 居家完成 · 可中断恢复"}</p></div></div><p className="text-sm font-bold text-slate-400">{Math.max(1, Math.round(plan.minutes / plan.exercises.length))}m</p></button>)}</div><div className="mt-4 rounded-3xl bg-slate-950 p-5 text-white"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-emerald-200">AI 影像动作指导</p><h3 className="mt-1 text-xl font-black">{selectedExercise}</h3></div><button onClick={() => setCameraOn(!cameraOn)} className={`rounded-2xl px-4 py-2 text-sm font-black ${cameraOn ? "bg-emerald-500" : "bg-white/10"}`}>{cameraOn ? "摄像头 ON" : "开启影像"}</button></div><div className="mt-4 grid gap-3 md:grid-cols-[0.8fr_1.2fr]"><div className="flex min-h-40 items-center justify-center rounded-3xl bg-white/10 text-center"><div><p className="text-5xl">{cameraOn ? "📷" : "🎥"}</p><p className="mt-2 text-sm text-slate-300">{cameraOn ? "AI 正在识别动作角度" : "开启后模拟识别姿势"}</p></div></div><div className="space-y-3"><ChoiceGroup title="动作模拟" value={postureMode} onChange={setPostureMode} options={["动作标准", "需要纠正"]} /><div className="rounded-2xl bg-white/10 p-4"><p className="text-sm text-emerald-100">动作评分</p><p className="mt-1 text-3xl font-black">{visionFeedback.score}/100</p><p className="mt-2 text-sm leading-6 text-slate-200">{visionFeedback.tip}</p></div></div></div></div></Card><Card className="p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-slate-500">Healthy Meal Plan</p><h2 className="text-2xl font-black">{plan.meal.title}</h2></div><button onClick={() => setFasting(!fasting)} className={`rounded-2xl px-4 py-2 text-sm font-bold ${fasting ? "bg-emerald-600 text-white" : "bg-slate-100"}`}>轻记录 {fasting ? "ON" : "OFF"}</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><p className="font-black">早餐</p><p className="mt-1 text-sm text-slate-600">{plan.meal.breakfast}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="font-black">午餐</p><p className="mt-1 text-sm text-slate-600">{plan.meal.lunch}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="font-black">晚餐</p><p className="mt-1 text-sm text-slate-600">{plan.meal.dinner}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><p className="font-black text-emerald-800">原则</p><p className="mt-1 text-sm text-emerald-700">{plan.meal.principle}</p></div></div></Card></section></div>}

          {tab === "coach" && <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><Card className="p-6"><h1 className="text-3xl font-black">AI Reset Coach</h1><p className="mt-3 leading-7 text-slate-600">AI 会先理解中断原因，再结合历史训练、步数、体重趋势和中断模式，推荐低压力重启方案，而不是用“你落后了”制造压力。</p><div className="mt-5 rounded-3xl bg-orange-50 p-4"><p className="font-black text-orange-900">温柔召回</p><p className="mt-2 text-sm leading-6 text-orange-800">这几天可能有点忙，要不要用 4 分钟重新开始？中断不会清零，回来也是进步。</p></div><div className="mt-6"><ChoiceGroup title="这次中断主要是因为什么？" value={resetReason} onChange={setResetReason} options={Object.keys(RESET_REASONS)} /></div><div className="mt-5 rounded-3xl bg-emerald-50 p-5"><p className="text-sm font-bold text-emerald-700">AI 推荐</p><h2 className="mt-1 text-2xl font-black text-emerald-900">{resetRecommendation.plan.title}</h2><p className="mt-2 text-sm leading-6 text-emerald-800">{resetRecommendation.insight}</p><button onClick={() => chooseReset(resetRecommendation.option)} className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-black text-white">按推荐方案重启</button></div><div className="mt-5 space-y-3">{RESET_OPTIONS.map((item) => <button key={item.key} onClick={() => chooseReset(item.key)} className={`w-full rounded-3xl p-4 text-left hover:bg-emerald-50 ${resetRecommendation.option === item.key ? "bg-emerald-50 ring-2 ring-emerald-400" : "bg-slate-50"}`}><p className="font-black">{item.title}</p><p className="mt-1 text-sm text-slate-600">{item.desc}</p></button>)}</div></Card><Card className="flex min-h-[640px] flex-col p-6"><div className="grid gap-4 md:grid-cols-2"><div className="rounded-3xl bg-slate-50 p-4"><p className="text-sm font-bold text-slate-500">历史流失模式学习</p><p className="mt-2 text-sm leading-6 text-slate-700">{churnPattern}</p></div><div className="rounded-3xl bg-slate-50 p-4"><p className="text-sm font-bold text-slate-500">下次提前干预</p><p className="mt-2 text-sm leading-6 text-slate-700">{resetRecommendation.reminder}</p></div></div><h2 className="mt-5 text-2xl font-black">Coach Chat</h2><div className="mt-4 flex-1 space-y-3 overflow-auto rounded-3xl bg-slate-50 p-4">{chat.map((m, i) => <div key={i} className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 ${i % 2 === 0 ? "bg-white text-slate-700" : "ml-auto bg-emerald-600 text-white"}`}>{m}</div>)}</div><div className="mt-4 flex gap-2"><input value={coachInput} onChange={(e) => setCoachInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendCoachMessage()} placeholder="告诉 Coach 你今天的状态..." className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" /><button onClick={sendCoachMessage} className="rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white">发送</button></div></Card></div>}

          {tab === "progress" && <div className="space-y-5"><div><h1 className="text-3xl font-black">Progress Beyond Weight</h1><p className="mt-2 text-slate-600">{progressMetrics.processMessage}</p></div><div className="grid gap-4 md:grid-cols-4"><StatCard label="本周累计运动" value={`${progressMetrics.weeklyMinutes} min`} sub="行动指标" tone="green" /><StatCard label="完成次数" value={`${progressMetrics.completionCount} 次`} sub="过程指标" /><StatCard label="步数提升" value={`+${progressMetrics.stepsImprove}%`} sub={`当前约 ${stepsBase} 步/日`} /><StatCard label="围度变化" value={`${progressMetrics.waistChange > 0 ? "+" : ""}${progressMetrics.waistChange} cm`} sub="不等于体重，但能看到身体变化" tone={progressMetrics.waistChange <= 0 ? "green" : "orange"} /></div><div className="grid gap-5 lg:grid-cols-3"><Card className="p-6"><p className="text-sm font-bold text-slate-500">自动阶段判断</p><h2 className="mt-2 text-2xl font-black">{PHASES[phase].label} · {difficulty.level}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{autoGrowth.reason}</p><p className="mt-3 text-sm leading-6 text-slate-600">{difficulty.desc}</p><div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="mb-2 text-sm font-bold">老手模式解锁进度</p><Bar label="综合成长值" value={unlockProgress} /></div></Card><Card className="space-y-5 p-6 lg:col-span-2"><div className="grid gap-3 sm:grid-cols-3"><StatCard label="情绪状态" value={progressMetrics.moodState} sub={`${mood}/5`} /><StatCard label="睡眠感受" value={progressMetrics.sleepFeeling} sub={`${sleepQuality}/5`} /><StatCard label="身体轻盈感" value={progressMetrics.lightnessLabel} sub={`${lightness}/5`} tone="green" /></div><Bar label="习惯养成" value={habit} /><Bar label="运动信心" value={confidence} /><Bar label="身体轻盈感" value={mobility} /><div className="rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-800">{completed ? "今日成就：完成一次身体重启。" : "完成今日计划后会解锁一个非体重成就。"}</div></Card></div><Card className="p-6"><h2 className="text-2xl font-black">成长系统模拟</h2><p className="mt-2 text-sm text-slate-500">调节下面参数，可以看到阶段是否自动进入老手模式，以及运动时间如何随健康程度、状态和阶段增加或减少。</p><div className="mt-4 grid gap-5 md:grid-cols-5"><div><p className="mb-2 text-sm font-bold">坚持天数 {activeDays}</p><input type="range" min="0" max="35" value={activeDays} onChange={(e) => setActiveDays(Number(e.target.value))} className="w-full" /></div><div><p className="mb-2 text-sm font-bold">连续打卡 {streak}</p><input type="range" min="0" max="30" value={streak} onChange={(e) => setStreak(Number(e.target.value))} className="w-full" /></div><div><p className="mb-2 text-sm font-bold">完成率 {completionRate}%</p><input type="range" min="20" max="100" value={completionRate} onChange={(e) => setCompletionRate(Number(e.target.value))} className="w-full" /></div><div><p className="mb-2 text-sm font-bold">中断次数 {interruptions}</p><input type="range" min="0" max="6" value={interruptions} onChange={(e) => setInterruptions(Number(e.target.value))} className="w-full" /></div><ChoiceGroup title="体重是否变化" value={weightChanged ? "有变化" : "无变化"} onChange={(v) => setWeightChanged(v === "有变化")} options={["无变化", "有变化"]} /></div><div className="mt-5 rounded-3xl bg-orange-50 p-5"><p className="font-black text-orange-900">{phaseReview.title}</p><p className="mt-2 text-sm leading-6 text-orange-800">{phaseReview.advice}</p><p className="mt-3 rounded-2xl bg-white p-3 text-sm font-black text-orange-900">{phaseReview.action}</p></div></Card></div>}

          {tab === "community" && <div className="space-y-5"><div><h1 className="text-3xl font-black">Light Social</h1><p className="mt-2 text-slate-600">只展示打卡、鼓励和阶段升级，不展示体重排名。</p></div><div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]"><Card className="p-6"><h2 className="text-2xl font-black">好友动态</h2><div className="mt-4 space-y-3">{FRIENDS.map((f) => <div key={f.name} className="flex items-center gap-4 rounded-3xl bg-slate-50 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-100 text-2xl">{f.emoji}</div><div className="flex-1"><p className="font-black">{f.name}</p><p className="text-sm text-slate-500">{f.text}</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{f.badge}</span></div>)}</div></Card><Card className="p-6"><h2 className="text-2xl font-black">小组挑战</h2><div className="mt-4 rounded-3xl bg-slate-950 p-5 text-white"><p className="text-sm text-emerald-200">7-Day Reset</p><p className="mt-2 text-3xl font-black">3/7 days</p><p className="mt-2 text-sm text-slate-300">每天完成一次 4-8 分钟低压力运动。</p><button className="mt-4 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-950">邀请好友</button></div></Card></div></div>}

          {tab === "profile" && <div className="space-y-5"><h1 className="text-3xl font-black">Profile & Health Records</h1><div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><Card className="p-6"><p className="text-sm font-bold text-slate-500">用户画像</p><h2 className="mt-2 text-2xl font-black">{userType.type} · {GOALS[goal].label}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{userType.insight}</p><p className="mt-3 text-sm text-slate-600">风险评分：<span className="font-black text-orange-600">{riskScore}/100</span> · 健康程度：<span className="font-black text-emerald-600">{health}/100</span></p><div className="mt-5 space-y-4"><ChoiceGroup title="目标" value={goal} onChange={setGoal} options={Object.entries(GOALS).map(([value, item]) => ({ value, label: item.label }))} /><ChoiceGroup title="身体风险" value={injuryRisk} onChange={setInjuryRisk} options={["无明显不适", "膝盖/腰背不适"]} /><div><p className="mb-2 text-sm font-bold">久坐 {sittingHours}h</p><input type="range" min="2" max="12" value={sittingHours} onChange={(e) => setSittingHours(Number(e.target.value))} className="w-full" /></div></div></Card><Card className="p-6"><h2 className="text-2xl font-black">健康记录</h2><p className="mt-2 text-sm text-slate-500">这些记录会影响健康程度，并进一步增加或减少今日运动时间；高糖零食次数越多，健康程度会下降。</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><Stepper label="饮水" value={water} setValue={setWater} min={0} max={8} suffix="/8" /><Stepper label="蛋白质份数" value={protein} setValue={setProtein} min={0} max={5} suffix="" /><Stepper label="蔬菜份数" value={vegetables} setValue={setVegetables} min={0} max={5} suffix="" /><Stepper label="高糖零食次数" value={snacks} setValue={setSnacks} min={0} max={6} suffix="" /><Stepper label="腰围" value={waist} setValue={setWaist} min={50} max={120} suffix="cm" /><Stepper label="臀围" value={hip} setValue={setHip} min={70} max={140} suffix="cm" /></div><div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">当前健康程度 {health}/100：{health >= 80 ? "状态好，系统可以适度增加运动时间。" : health < 50 ? "恢复优先，系统会减少运动时间。" : "保持稳定，系统会推荐中等时长。"}</div></Card></div></div>}

          {tab === "premium" && <div className="space-y-5"><h1 className="text-3xl font-black">Premium</h1><div className="grid gap-5 lg:grid-cols-3"><Card className="p-6"><p className="text-sm font-bold text-slate-500">Free</p><h2 className="mt-2 text-3xl font-black">$0</h2><p className="mt-2 text-slate-600">基础计划、打卡、轻社交。</p><button className="mt-5 w-full rounded-2xl border border-slate-200 py-3 font-bold">当前版本</button></Card><Card className="p-6 ring-2 ring-emerald-500"><p className="text-sm font-bold text-emerald-700">Premium</p><h2 className="mt-2 text-3xl font-black">$9.99/mo</h2><p className="mt-2 text-slate-600">阶段课程、趋势复盘、饮食轻记录。</p><button className="mt-5 w-full rounded-2xl bg-emerald-600 py-3 font-bold text-white">升级 Premium</button></Card><Card className="p-6"><p className="text-sm font-bold text-orange-700">AI Coach Plus</p><h2 className="mt-2 text-3xl font-black">$14.99/mo</h2><p className="mt-2 text-slate-600">深度陪伴、7-Day Reset、中断召回。</p><button className="mt-5 w-full rounded-2xl bg-slate-950 py-3 font-bold text-white">解锁 AI Coach</button></Card></div></div>}
        </main>
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
