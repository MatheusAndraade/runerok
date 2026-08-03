export type GuildService = 'shop' | 'forge' | 'missions';

export const GUILD_NPCS: Array<{
  id: string;
  x: number;
  y: number;
  name: string;
  role: string;
  sprite: string;
  height: number;
  service: GuildService;
}> = [
  { id: 'kafra', x: 142, y: 273, name: 'Mercadora Kafra', role: 'Compra e venda', sprite: 'kafra-merchant', height: 82, service: 'shop' },
  { id: 'blacksmith', x: 651, y: 278, name: 'Hollgrehenn', role: 'Forja e refino', sprite: 'blacksmith', height: 91, service: 'forge' },
  { id: 'missions', x: 401, y: 132, name: 'Agente de Missões', role: 'Contratos da guilda', sprite: 'mission-clerk', height: 84, service: 'missions' }
];
