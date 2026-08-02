import React from 'react';
import { SKILLS } from '../../data/skills';
import { SkillData, SaveData, SkillRule } from '../../types/game';
import { Zap, X, Sparkles, CheckCircle2, Circle } from 'lucide-react';

interface SkillsWindowProps {
  saveData?: SaveData;
  onUpdateRules?: (newRules: SkillRule[]) => void;
  onClose: () => void;
}

export const SkillsWindow: React.FC<SkillsWindowProps> = ({ saveData, onUpdateRules, onClose }) => {
  const skillList = Object.values(SKILLS);
  const rules = saveData?.skillRules || [];

  const handleToggleRule = (ruleId: string) => {
    if (!onUpdateRules) return;
    const updated = rules.map(r => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    onUpdateRules(updated);
  };

  const handleChangeCondition = (ruleId: string, newCondition: SkillRule['condition']) => {
    if (!onUpdateRules) return;
    const updated = rules.map(r => (r.id === ruleId ? { ...r, condition: newCondition } : r));
    onUpdateRules(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-800/80 rounded-xl shadow-2xl text-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 px-4 py-3 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-amber-200">Habilidades e IA de Combate</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="p-3 sm:p-4 space-y-3 overflow-y-auto flex-1">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>As habilidades ativas são executadas automaticamente em combate de acordo com o SP e as regras de IA.</span>
          </div>

          {/* Regras de Execução de IA */}
          {rules.length > 0 && (
            <div className="space-y-2 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-amber-300 text-xs uppercase tracking-wider">Prioridade de Uso Automático</h3>
              {rules.map((rule, idx) => {
                const sData = SKILLS[rule.skillId];
                if (!sData) return null;

                return (
                  <div key={rule.id} className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 w-4">#{idx + 1}</span>
                      <button onClick={() => handleToggleRule(rule.id)} className="text-amber-400 hover:scale-110 transition-transform cursor-pointer">
                        {rule.enabled ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-600" />}
                      </button>
                      <span className="text-lg">{sData.icon}</span>
                      <div>
                        <div className="font-bold text-xs text-amber-200">{sData.name}</div>
                        <div className="text-[10px] text-sky-400 font-mono">SP: {sData.spCost}</div>
                      </div>
                    </div>

                    <select
                      value={rule.condition}
                      onChange={e => handleChangeCondition(rule.id, e.target.value as SkillRule['condition'])}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-amber-200 font-mono cursor-pointer"
                    >
                      <option value="ALWAYS">Sempre usar</option>
                      <option value="ENEMIES_GTE_2">Inimigos próximos ≥ 2</option>
                      <option value="ENEMIES_GTE_3">Inimigos próximos ≥ 3</option>
                      <option value="TARGET_LARGE">Alvo de tamanho Grande</option>
                      <option value="HP_BELOW_50">HP &lt; 50%</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}

          {/* Diretório de Habilidades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1">
            {skillList.map((skill: SkillData) => (
              <div
                key={skill.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-2 hover:border-amber-700/50 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-amber-800/50 flex items-center justify-center text-xl shrink-0">
                    {skill.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-amber-200 text-xs sm:text-sm truncate">{skill.name}</h3>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                        skill.type === 'ACTIVE' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {skill.type === 'ACTIVE' ? 'Ativa' : skill.type === 'BUFF' ? 'Melhoria' : 'Passiva'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800 leading-relaxed">
                  {skill.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Custo SP: <strong className="text-sky-300">{skill.spCost}</strong></span>
                  {skill.cooldown > 0 && <span>Recarga: <strong className="text-amber-300">{skill.cooldown}s</strong></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
