import type { AppTheme, MythicData } from '../types/mythic';

interface ScientificData {
  kpIndex: number;
  windSpeed: number;
  bz?: number;
  dst?: number;
}

/**
 * Mythic Translator - Converts raw scientific data into themed flavor text
 */
export function translateToMythic(
  theme: AppTheme,
  data: ScientificData
): MythicData {
  const { kpIndex, windSpeed, bz = 0, dst = 0 } = data;

  if (theme === 'NORSE') {
    return translateToNorse(kpIndex, windSpeed, bz, dst);
  } else {
    return translateToSciFi(kpIndex, windSpeed, bz, dst);
  }
}

function translateToNorse(
  kp: number,
  wind: number,
  _bz: number,
  _dst: number
): MythicData {
  // Heimdall Protocol (CME/Storm Warning)
  if (wind > 700 || kp >= 8) {
    return {
      title: '🎺 HEIMDALL SOUNDS THE GJALLARHORN',
      message: `The Watchman sees fire in the void. Sköll hunts at ${wind} km/s. Shockwave arrival imminent. The Bifröst trembles!`,
      icon: '🎺',
      color: '#ff6b35',
      sound: 'horn_blast',
    };
  }

  if (wind > 600 || kp >= 7) {
    return {
      title: '⚡ BIFRÖST UNSTABLE',
      message: `The Valkyries ride tonight. Sköll velocity: ${wind} km/s. The rainbow bridge flickers between worlds.`,
      icon: '⚡',
      color: '#ffd700',
      sound: 'thunder',
    };
  }

  if (wind > 500 || kp >= 6) {
    return {
      title: '🐺 SKÖLL IS HUNTING',
      message: `The wolf closes on the Sun. Speed: ${wind} km/s. Yggdrasil's branches sway. Prepare for the storm.`,
      icon: '🐺',
      color: '#ff8c00',
    };
  }

  if (wind > 450 || kp >= 5) {
    return {
      title: '🌩️ THE AESIR STIR',
      message: `Thunder echoes from Asgard. Wind speed: ${wind} km/s. Thor's hammer gleams in the vault of heaven.`,
      icon: '🌩️',
      color: '#00d4ff',
    };
  }

  if (wind < 350) {
    return {
      title: '🌙 THE WOLF SLEEPS',
      message: `All is calm in the Nine Realms. Solar wind: ${wind} km/s. The Bifröst stands strong and steady.`,
      icon: '🌙',
      color: '#4a90e2',
    };
  }

  return {
    title: '⚔️ MIDGARD PROTECTED',
    message: `The shield holds. Wind speed: ${wind} km/s, Kp ${kp}. Heimdall watches from the edge of the void.`,
    icon: '⚔️',
    color: '#00d4ff',
  };
}

function translateToSheikah(
  kp: number,
  wind: number,
  _bz: number,
  _dst: number
): MythicData {
  // Calamity Detection
  if (wind > 700 || kp >= 8) {
    return {
      title: '🔴 CALAMITY DETECTED',
      message: `Malice levels critical: ${wind} km/s. Ancient seals weakening. The blood moon rises. Corruption spreads.`,
      icon: '🔴',
      color: '#ff6600',
      sound: 'guardian_alert',
    };
  }

  if (wind > 600 || kp >= 7) {
    return {
      title: '⚠️ GUARDIAN NETWORK ALERT',
      message: `High energy signature: ${wind} km/s. Sheikah Slate detecting anomalies. Divine Beasts on standby.`,
      icon: '⚠️',
      color: '#ff8800',
      sound: 'sheikah_beep',
    };
  }

  if (wind > 500 || kp >= 6) {
    return {
      title: '🔷 MALICE SURGE',
      message: `Corruption rising. Wind velocity: ${wind} km/s. Ancient technology resonating. Shrines pulsing.`,
      icon: '🔷',
      color: '#ff6600',
    };
  }

  if (wind > 450 || kp >= 5) {
    return {
      title: '📡 SHEIKAH TOWER ACTIVATED',
      message: `Energy flux detected: ${wind} km/s. Towers scanning. Map updating. Prepare for disturbance.`,
      icon: '📡',
      color: '#00d9ff',
    };
  }

  if (wind < 350) {
    return {
      title: '✨ SEALS STABLE',
      message: `All shrines dormant. Solar wind: ${wind} km/s. The slate reads: "Peace in Hyrule."`,
      icon: '✨',
      color: '#4a90e2',
    };
  }

  return {
    title: '🔵 MONITORING',
    message: `Sheikah network operational. Wind: ${wind} km/s, Kp ${kp}. Guardians on patrol. No threats detected.`,
    icon: '🔵',
    color: '#00d9ff',
  };
}

function translateToSciFi(
  kp: number,
  wind: number,
  bz: number,
  _dst: number
): MythicData {
  if (wind > 700 || kp >= 8) {
    return {
      title: '⚠️ SEVERE GEOMAGNETIC STORM',
      message: `G4-G5 conditions. Solar wind: ${wind} km/s, Kp ${kp}. CME impact imminent. Power grid at risk.`,
      icon: '⚠️',
      color: '#ff0000',
      sound: 'alert',
    };
  }

  if (wind > 600 || kp >= 7) {
    return {
      title: '🌩️ MAJOR STORM WARNING',
      message: `G3 geomagnetic storm. Wind: ${wind} km/s, Kp ${kp}. Aurora visible to mid-latitudes. Satellite disruption possible.`,
      icon: '🌩️',
      color: '#ff6600',
    };
  }

  if (wind > 500 || kp >= 6) {
    return {
      title: '⚡ MODERATE STORM',
      message: `G2 conditions. Wind speed: ${wind} km/s, Kp ${kp}. Aurora activity increasing. Minor disruptions expected.`,
      icon: '⚡',
      color: '#ffa500',
    };
  }

  if (wind > 450 || kp >= 5) {
    return {
      title: '🌟 MINOR STORM',
      message: `G1 geomagnetic storm. Wind: ${wind} km/s, Kp ${kp}. Aurora visible at high latitudes.`,
      icon: '🌟',
      color: '#ffd700',
    };
  }

  if (wind < 350) {
    return {
      title: '✅ QUIET CONDITIONS',
      message: `Solar wind nominal: ${wind} km/s, Kp ${kp}. Magnetosphere stable. All systems normal.`,
      icon: '✅',
      color: '#00ff00',
    };
  }

  return {
    title: '📊 MONITORING',
    message: `Solar wind: ${wind} km/s, Kp ${kp}, Bz: ${bz} nT. Standard operations. No warnings.`,
    icon: '📊',
    color: '#00ffff',
  };
}

/**
 * Sköll & Hati Status (Solar Wind Speed)
 */
export function getSkollStatus(windSpeed: number): string {
  if (windSpeed < 350) return '🌙 The Wolf Sleeps';
  if (windSpeed < 450) return '🐺 Sköll Stirs';
  if (windSpeed < 550) return '🏃 Sköll Runs';
  if (windSpeed < 650) return '⚡ Sköll Hunts!';
  return '🔥 SKÖLL DEVOURS THE SUN!';
}

/**
 * Get wolf animation speed (for running wolf graphic)
 */
export function getSkollSpeed(windSpeed: number): number {
  // Map wind speed (300-800) to animation speed (0.5-3.0)
  const normalized = Math.max(0, Math.min(1, (windSpeed - 300) / 500));
  return 0.5 + normalized * 2.5;
}
