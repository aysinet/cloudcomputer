module.exports = function(ctx) {
  const { app, authMiddleware } = ctx;
  const os = require('os');

  let prevCpuInfo = null;
  function getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) totalTick += cpu.times[type];
      totalIdle += cpu.times.idle;
    }
    const result = { totalIdle, totalTick, count: cpus.length, model: cpus[0].model };
    if (prevCpuInfo) {
      const idleDiff = totalIdle - prevCpuInfo.totalIdle;
      const totalDiff = totalTick - prevCpuInfo.totalTick;
      result.usage = totalDiff > 0 ? Math.round((1 - idleDiff / totalDiff) * 10000) / 100 : 0;
    } else {
      result.usage = 0;
    }
    prevCpuInfo = { totalIdle, totalTick };
    return result;
  }

  return {
    routes: [
      {
        method: 'get',
        path: '/api/system/stats',
        handlers: [authMiddleware, (req, res) => {
          const cpu = getCpuUsage();
          const totalMem = os.totalmem();
          const freeMem = os.freemem();
          const usedMem = totalMem - freeMem;
          res.json({
            cpu: {
              usage: cpu.usage,
              cores: cpu.count,
              model: cpu.model
            },
            memory: {
              total: totalMem,
              used: usedMem,
              free: freeMem,
              usagePercent: Math.round(usedMem / totalMem * 10000) / 100
            },
            uptime: os.uptime(),
            platform: os.platform(),
            hostname: os.hostname(),
            arch: os.arch()
          });
        }]
      }
    ]
  };
};
