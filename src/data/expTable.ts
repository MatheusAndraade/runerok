// Base EXP table for Level 1 to 99 inspired by classic Ragnarok Online
const BASE_EXP_TABLE: number[] = [
  0,        // Lv 1
  10,       // Lv 2
  25,       // Lv 3
  50,       // Lv 4
  90,       // Lv 5
  150,      // Lv 6
  240,      // Lv 7
  370,      // Lv 8
  550,      // Lv 9
  800,      // Lv 10
  1150,     // Lv 11
  1600,     // Lv 12
  2200,     // Lv 13
  3000,     // Lv 14
  4000,     // Lv 15
  5200,     // Lv 16
  6800,     // Lv 17
  8800,     // Lv 18
  11200,    // Lv 19
  14200,    // Lv 20
  18000,    // Lv 21
  22800,    // Lv 22
  28800,    // Lv 23
  36200,    // Lv 24
  45200,    // Lv 25
  56000,    // Lv 26
  68800,    // Lv 27
  84000,    // Lv 28
  102000,   // Lv 29
  123000,   // Lv 30
  148000,   // Lv 31
  177000,   // Lv 32
  211000,   // Lv 33
  251000,   // Lv 34
  298000,   // Lv 35
  353000,   // Lv 36
  417000,   // Lv 37
  492000,   // Lv 38
  580000,   // Lv 39
  683000,   // Lv 40
  803000,   // Lv 41
  942000,   // Lv 42
  1103000,  // Lv 43
  1288000,  // Lv 44
  1500000,  // Lv 45
  1742000,  // Lv 46
  2017000,  // Lv 47
  2328000,  // Lv 48
  2678000,  // Lv 49
  3071000,  // Lv 50
  3511000,  // Lv 51
  4002000,  // Lv 52
  4548000,  // Lv 53
  5154000,  // Lv 54
  5824000,  // Lv 55
  6564000,  // Lv 56
  7378000,  // Lv 57
  8272000,  // Lv 58
  9252000,  // Lv 59
  10323000, // Lv 60
  11491000, // Lv 61
  12763000, // Lv 62
  14145000, // Lv 63
  15643000, // Lv 64
  17265000, // Lv 65
  19018000, // Lv 66
  20909000, // Lv 67
  22946000, // Lv 68
  25137000, // Lv 69
  27490000, // Lv 70
  30013000, // Lv 71
  32715000, // Lv 72
  35605000, // Lv 73
  38693000, // Lv 74
  41988000, // Lv 75
  45500000, // Lv 76
  49238000, // Lv 77
  53213000, // Lv 78
  57435000, // Lv 79
  61914000, // Lv 80
  66660000, // Lv 81
  71683000, // Lv 82
  76993000, // Lv 83
  82600000, // Lv 84
  88514000, // Lv 85
  94745000, // Lv 86
  101303000,// Lv 87
  108200000,// Lv 88
  115446000,// Lv 89
  123052000,// Lv 90
  131029000,// Lv 91
  139387000,// Lv 92
  148138000,// Lv 93
  157293000,// Lv 94
  166863000,// Lv 95
  176859000,// Lv 96
  187293000,// Lv 97
  198176000,// Lv 98
  209520000 // Lv 99 MAX
];

export function getExpForLevel(level: number): number {
  if (level <= 1) return BASE_EXP_TABLE[1];
  if (level >= 99) return BASE_EXP_TABLE[99];
  return BASE_EXP_TABLE[level] || BASE_EXP_TABLE[99];
}

export function getStatPointCost(currentValue: number): number {
  // RO Classic Stat Point Cost formula: Math.floor((currentValue - 1) / 10) + 2
  return Math.floor((currentValue - 1) / 10) + 2;
}
