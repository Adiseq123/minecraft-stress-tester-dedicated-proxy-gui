const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const mineflayer = require('mineflayer')
const { SocksClient } = require('socks')
const dns = require('dns')
const fs = require('fs')

let mainWindow = null
let activeBots = []
let activeTimers = []
let activeIntervals = []

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 800,
    minWidth: 850,
    minHeight: 650,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'Minecraft Stress Tester (Dedicated SOCKS5 & SRV Resolver)',
    autoHideMenuBar: true
  })

  mainWindow.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  stopAll()
  if (process.platform !== 'darwin') app.quit()
})

function logToGUI(msg) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('log-message', msg)
  }
}

function generateRandomUsername(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function formatKickReason(reason) {
  if (!reason) return 'Brak podanego powodu'
  if (typeof reason === 'string') return reason
  try {
    if (typeof reason === 'object') {
      if (reason.text) return reason.text
      return JSON.stringify(reason)
    }
  } catch (e) {
    return String(reason)
  }
  return String(reason)
}

function getHumanDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function parseProxies(proxyInputRaw) {
  const proxies = []
  
  if (proxyInputRaw && proxyInputRaw.trim()) {
    const lines = proxyInputRaw.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    lines.forEach(line => {
      const parts = line.split(':')
      if (parts.length >= 2 && parts[0] !== 'tu wpisz host') {
        proxies.push({
          host: parts[0],
          port: parseInt(parts[1], 10),
          userId: parts[2] || undefined,
          password: parts[3] || undefined
        })
      }
    })
  }

  if (proxies.length === 0 && fs.existsSync('proxies.txt')) {
    const content = fs.readFileSync('proxies.txt', 'utf-8')
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    lines.forEach(line => {
      const parts = line.split(':')
      if (parts.length >= 2 && parts[0] !== 'tu wpisz host') {
        proxies.push({
          host: parts[0],
          port: parseInt(parts[1], 10),
          userId: parts[2] || undefined,
          password: parts[3] || undefined
        })
      }
    })
    if (proxies.length > 0) {
      logToGUI(`[+] Wczytano ${proxies.length} proxy z pliku proxies.txt`)
    }
  }

  return proxies
}

function createBot(config, proxies, username, index) {
  const proxy = proxies.length > 0 ? proxies[index % proxies.length] : null

  const botOptions = {
    host: config.host,
    port: parseInt(config.port, 10),
    username: username,
    version: config.version || false,
    auth: 'offline'
  }

  if (proxy) {
    botOptions.connect = (client) => {
      if (config.useSrv) {
        dns.resolveSrv(`_minecraft._tcp.${config.host}`, (srvErr, addresses) => {
          const targetHost = (!srvErr && addresses && addresses.length > 0) ? addresses[0].name : config.host
          const targetPort = (!srvErr && addresses && addresses.length > 0) ? addresses[0].port : parseInt(config.port, 10)

          if (!srvErr && addresses && addresses.length > 0) {
            logToGUI(`[i] [${username}] Rozwiązano SRV: ${config.host} -> ${targetHost}:${targetPort}`)
          }

          connectThroughSocks(client, proxy, targetHost, targetPort, username)
        })
      } else {
        connectThroughSocks(client, proxy, config.host, parseInt(config.port, 10), username)
      }
    }
  }

  function connectThroughSocks(client, proxyObj, targetHost, targetPort, usernameStr) {
    SocksClient.createConnection({
      proxy: {
        host: proxyObj.host,
        port: proxyObj.port,
        type: 5,
        userId: proxyObj.userId,
        password: proxyObj.password
      },
      command: 'connect',
      destination: {
        host: targetHost,
        port: targetPort
      },
      timeout: 20000
    }, (err, info) => {
      if (err) {
        logToGUI(`[X] [${usernameStr}] Błąd SOCKS5 Proxy (${proxyObj.host}:${proxyObj.port}): ${err.message}`)
        client.emit('error', err)
        return
      }
      client.setSocket(info.socket)
      client.emit('connect')
    })
  }

  let bot
  try {
    bot = mineflayer.createBot(botOptions)
  } catch (err) {
    logToGUI(`[X] [${username}] Błąd tworzenia bota: ${err.message}`)
    return
  }

  activeBots.push(bot)
  const botIntervals = []
  let isRateLimited = false
  let hasAttemptedRegister = false
  let hasAttemptedLogin = false

  function safeSetInterval(fn, ms) {
    const timer = setInterval(fn, ms)
    botIntervals.push(timer)
    activeIntervals.push(timer)
    return timer
  }

  function cleanup() {
    botIntervals.forEach(clearInterval)
    const idx = activeBots.indexOf(bot)
    if (idx !== -1) activeBots.splice(idx, 1)
  }

  bot.on('message', (jsonMsg) => {
    const text = jsonMsg.toString().toLowerCase()

    if ((text.includes('/register') || text.includes('zarejestruj')) && !hasAttemptedRegister) {
      hasAttemptedRegister = true
      const delay = getHumanDelay(config.minDelay, config.maxDelay)
      logToGUI(`[i] [${username}] Rejestracja wykryta. Wpisywanie za ${(delay / 1000).toFixed(1)}s...`)
      const timer = setTimeout(() => {
        if (bot && bot.entity) {
          bot.chat(`/register ${config.botPassword} ${config.botPassword}`)
        }
      }, delay)
      activeTimers.push(timer)
    } else if ((text.includes('/login') || text.includes('zaloguj')) && !hasAttemptedLogin) {
      hasAttemptedLogin = true
      const delay = getHumanDelay(config.minDelay, config.maxDelay)
      logToGUI(`[i] [${username}] Logowanie wykryte. Wpisywanie za ${(delay / 1000).toFixed(1)}s...`)
      const timer = setTimeout(() => {
        if (bot && bot.entity) {
          bot.chat(`/login ${config.botPassword}`)
        }
      }, delay)
      activeTimers.push(timer)
    }
  })

  bot.once('spawn', () => {
    const proxyMsg = proxy ? ` [Proxy IP: ${proxy.host}]` : ' [Bezpośrednie]'
    logToGUI(`[+] [${username}] Zalogowano pomyślnie.${proxyMsg}`)

    const regTimer = setTimeout(() => {
      if (!hasAttemptedRegister && !hasAttemptedLogin) {
        hasAttemptedRegister = true
        bot.chat(`/register ${config.botPassword} ${config.botPassword}`)
      }
    }, getHumanDelay(3000, 7000))
    activeTimers.push(regTimer)

    safeSetInterval(() => {
      if (!bot.entity) return
      const directions = ['forward', 'back', 'left', 'right']
      const randomDirection = directions[Math.floor(Math.random() * directions.length)]

      bot.setControlState('sprint', Math.random() > 0.4)
      bot.setControlState('jump', Math.random() > 0.5)
      bot.setControlState('sneak', Math.random() > 0.8)

      bot.setControlState(randomDirection, true)
      setTimeout(() => {
        if (bot && bot.entity) {
          bot.setControlState(randomDirection, false)
        }
      }, 500 + Math.random() * 1000)

      if (Math.random() > 0.3) {
        bot.swingArm('mainhand')
      }
    }, parseInt(config.actionIntervalMs, 10) + Math.random() * 2000)

    safeSetInterval(() => {
      if (!bot.entity) return
      const yaw = (Math.random() * Math.PI * 2) - Math.PI
      const pitch = (Math.random() * Math.PI) - (Math.PI / 2)
      bot.look(yaw, pitch, true).catch(() => {})
    }, 1500 + Math.random() * 1000)

    safeSetInterval(() => {
      if (!bot.entity) return
      if (config.messages.length > 0 && Math.random() < 0.7) {
        const msg = config.messages[Math.floor(Math.random() * config.messages.length)]
        bot.chat(`${msg} [${Math.floor(Math.random() * 8999 + 1000)}]`)
      } else if (config.commands.length > 0) {
        const cmd = config.commands[Math.floor(Math.random() * config.commands.length)]
        bot.chat(cmd)
      }
    }, parseInt(config.chatIntervalMs, 10) + Math.random() * 4000)
  })

  bot.on('kicked', (reason) => {
    const parsedReason = formatKickReason(reason)
    logToGUI(`[!] [${username}] Wyrzucony: ${parsedReason}`)
    if (parsedReason.toLowerCase().includes('zbyt często') || parsedReason.toLowerCase().includes('frequently')) {
      isRateLimited = true
    }
  })

  bot.on('error', (err) => {
    logToGUI(`[X] [${username}] Błąd: ${err.message}`)
  })

  bot.once('end', () => {
    cleanup()
    const waitTime = isRateLimited
      ? 20000 + Math.random() * 5000
      : parseInt(config.reconnectDelayMs, 10) + (index * 500)

    logToGUI(`[-] [${username}] Rozłączono. Ponowne łączenie za ${Math.round(waitTime / 1000)}s...`)
    const timer = setTimeout(() => {
      createBot(config, proxies, generateRandomUsername(10), index)
    }, waitTime)
    activeTimers.push(timer)
  })
}

function stopAll() {
  activeTimers.forEach(clearTimeout)
  activeTimers = []
  activeIntervals.forEach(clearInterval)
  activeIntervals = []
  activeBots.forEach(bot => {
    try { bot.quit() } catch (e) {}
  })
  activeBots = []
}

ipcMain.on('start-stress-test', (event, config) => {
  stopAll()
  logToGUI('=== ROZPOCZYNANIE TESTU (SOCKS5 / SRV) ===')
  
  const proxies = parseProxies(config.proxyInputRaw)
  logToGUI(`[+] Wczytana liczba serwerów Proxy SOCKS5: ${proxies.length}`)

  let botCount = parseInt(config.botCount, 10)
  if (config.autoBotCount && proxies.length > 0) {
    botCount = proxies.length
    logToGUI(`[i] Tryb 1 Bot = 1 Proxy: Ustawiono liczbę botów na ${botCount}`)
  }

  if (botCount <= 0) {
    logToGUI('[X] Liczba botów wynosi 0! Podaj proxy w polu wyżej lub odznacz opcję "1 Bot = 1 Proxy" i ustaw liczbę ręcznie.')
    return
  }

  const spawnDelay = parseInt(config.spawnDelayMs, 10)

  for (let i = 0; i < botCount; i++) {
    const timer = setTimeout(() => {
      const randomNick = generateRandomUsername(10)
      createBot(config, proxies, randomNick, i)
    }, i * spawnDelay)
    activeTimers.push(timer)
  }
})

ipcMain.on('stop-stress-test', () => {
  stopAll()
  logToGUI('=== ZATRZYMANO TESTOWANIE ===')
})