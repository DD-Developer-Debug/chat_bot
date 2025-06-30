import si from 'systeminformation';

export async function getSystemStats() {
  try {
    const mem = await si.mem();
    const cpu = await si.currentLoad();
    
    return {
      ramUsage: Math.round((mem.used / mem.total) * 100),
      cpuUsage: Math.round(cpu.currentLoad),
      totalMemory: Math.round(mem.total / 1024 / 1024 / 1024), // GB
      usedMemory: Math.round(mem.used / 1024 / 1024 / 1024) // GB
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return {
      ramUsage: 0,
      cpuUsage: 0,
      totalMemory: 0,
      usedMemory: 0
    };
  }
}