const DECK_ID = 'dsh-code-console-deck'
const MISSION_ID = 'dsh-code-console-mission'
const SIGNAL_ID = 'dsh-code-console-signal'
const HUD_LABEL_ID = 'dsh-code-console-hud-label'

function removeDecoration(id) {
  document.getElementById(id)?.remove()
}

function readRuntimeStatus() {
  const modelButton = document.querySelector('[aria-label^="选择模型"]')
  const accessButton = document.querySelector('[aria-label^="访问模式"]')
  const hudText = document.querySelector('.PGx6Ra_root')?.textContent?.replace(/\s+/g, ' ').trim() || ''
  const statNodes = [...document.querySelectorAll('[class*="avexCG_root"]')]
  const latestStat = statNodes.at(-1)?.textContent?.replace(/\s+/g, ' ').trim()
    || hudText.match(/[^|]*tok\/s/)?.[0]?.trim()
    || ''
  const selectedSession = document.querySelector("[aria-selected='true']")?.textContent?.replace(/\s+/g, ' ').trim()
  const title = selectedSession?.replace(/\d+\s*(?:秒|分钟|小时|天|周|月|年)(?:前)?/g, '').trim()
    || document.querySelector('.YirWKq_titleCluster')?.textContent?.replace(/\s+/g, ' ').trim()
    || 'CURRENT SESSION'
  const model = modelButton?.getAttribute('aria-label')?.match(/当前\s+(.+?)(?:，|,|$)/)?.[1]
    || modelButton?.textContent?.replace(/\s+/g, ' ').trim()
    || 'AUTO'
  const access = accessButton?.getAttribute('aria-label')?.match(/当前：\s*(.+)$/)?.[1]
    || accessButton?.textContent?.replace(/\s+/g, ' ').trim()
    || 'DEFAULT'
  const cache = hudText.match(/缓存命中\s*([\d.]+%)/)?.[1] || '--'
  const rounds = hudText.match(/([\d,]+)\s*轮/)?.[1] || '--'
  const steps = hudText.match(/([\d,]+)\s*步/)?.[1] || '--'
  const running = Boolean(document.querySelector('[aria-label*="停止"], [aria-label*="stop" i]'))

  return { access, cache, latestStat, model, rounds, running, steps, title }
}

function syncRuntimeStatus() {
  if (!document.body?.hasAttribute('data-dsh-code-console')) return

  const root = document.getElementById(DECK_ID)
  const mission = document.getElementById(MISSION_ID)
  if (!root || !mission) return

  const status = readRuntimeStatus()
  const setText = (selector, value, parent = root) => {
    const element = parent.querySelector(selector)
    if (element) element.textContent = value
  }

  setText('[data-runtime="state"]', status.running ? 'RUNNING' : 'READY')
  setText('[data-runtime="model"]', status.model)
  setText('[data-runtime="access"]', status.access)
  setText('[data-runtime="cache"]', status.cache)
  setText('[data-runtime="rounds"]', `${status.rounds} R / ${status.steps} S`, root)
  setText('[data-runtime="stat"]', status.latestStat || 'WAITING FOR OUTPUT', root)
  setText('[data-runtime="title"]', status.title, root)
  setText('[data-runtime="progress"]', status.running ? 'PROCESSING' : 'ONLINE', mission)
  setText('[data-runtime="progress-bar"]', '', mission)
  const progress = mission.querySelector('[data-runtime="progress-bar"]')
  if (progress) progress.style.width = status.running ? '78%' : '100%'
}

function ensureDecorations() {
  if (!document.body?.hasAttribute('data-dsh-code-console')) return

  const main = document.querySelector('.YirWKq_root')
  const sidebar = document.querySelector("[class*='sidebarCol']")
  const header = document.querySelector('.YirWKq_header')
  const hud = document.querySelector('.PGx6Ra_root')
  if (!main || !sidebar) return

  const activeHeader = header && !header.classList.contains('YirWKq_headerHidden')
  if (activeHeader) {
    main.removeAttribute('data-dsh-console-home')
  } else {
    main.setAttribute('data-dsh-console-home', 'true')
  }

  if (!document.getElementById(DECK_ID)) {
    const deck = document.createElement('div')
    deck.id = DECK_ID
    deck.setAttribute('aria-hidden', 'true')
    deck.innerHTML = `
      <div class="dsh-console-target">
        <div class="dsh-console-eyebrow">RUNTIME STATUS</div>
        <div class="dsh-console-runtime-state"><i></i><strong data-runtime="state">READY</strong></div>
        <div class="dsh-console-runtime-row"><span>MODEL</span><b data-runtime="model">AUTO</b></div>
        <div class="dsh-console-runtime-row"><span>ACCESS</span><b data-runtime="access">DEFAULT</b></div>
        <div class="dsh-console-runtime-row"><span>CACHE</span><b data-runtime="cache">--</b></div>
        <div class="dsh-console-signal-bars"><i></i><i></i><i></i><i></i><i></i></div>
        <span class="dsh-console-lock">CONNECTED</span>
      </div>
      <div class="dsh-console-quest">
        <div class="dsh-console-eyebrow">CURRENT TASK</div>
        <strong data-runtime="title">CURRENT SESSION</strong>
        <span>LAST OUTPUT</span>
        <b data-runtime="stat">WAITING FOR OUTPUT</b>
        <em data-runtime="rounds">-- R / -- S</em>
      </div>
      <div class="dsh-console-readout">MODE // STANDARD&nbsp;&nbsp; TASKS 02</div>
    `
    main.append(deck)
  }

  if (!document.getElementById(MISSION_ID)) {
    const mission = document.createElement('div')
    mission.id = MISSION_ID
    mission.setAttribute('aria-hidden', 'true')
    mission.innerHTML = `
      <div class="dsh-console-eyebrow">WORKSPACE STATUS</div>
      <strong>DEEPSEEK-HARNESS</strong>
      <div class="dsh-console-progress"><i data-runtime="progress-bar"></i></div>
      <div class="dsh-console-progress-meta"><b>LIVE</b><span data-runtime="progress">ONLINE</span></div>
      <div class="dsh-console-mission-stats"><span><b>02</b> PLUGINS</span><span><b>04</b> TOOLS</span><span><b>99%</b> SYNC</span></div>
    `
    sidebar.append(mission)
  }

  const signalHost = activeHeader ? header : main
  const existingSignal = document.getElementById(SIGNAL_ID)
  if (!existingSignal) {
    const signal = document.createElement('div')
    signal.id = SIGNAL_ID
    signal.setAttribute('aria-hidden', 'true')
    signal.innerHTML = '<i></i><b>RIZEN SIGNAL CONSOLE</b><span>v0.2 // LOCAL PREVIEW</span>'
    signalHost.append(signal)
  } else if (existingSignal.parentElement !== signalHost) {
    signalHost.append(existingSignal)
  }

  if (hud && !document.getElementById(HUD_LABEL_ID)) {
    const label = document.createElement('span')
    label.id = HUD_LABEL_ID
    label.setAttribute('aria-hidden', 'true')
    label.textContent = 'ZONE // DEEPSEEK-HARNESS'
    hud.append(label)
  } else if (hud && document.getElementById(HUD_LABEL_ID)?.parentElement !== hud) {
    hud.append(document.getElementById(HUD_LABEL_ID))
  } else if (!hud) {
    removeDecoration(HUD_LABEL_ID)
  }

  syncRuntimeStatus()
}

function removeDecorations() {
  removeDecoration(DECK_ID)
  removeDecoration(MISSION_ID)
  removeDecoration(SIGNAL_ID)
  removeDecoration(HUD_LABEL_ID)
}

function applyMode(theme) {
  const active = theme.getTheme().preference === 'code-console'
  if (document.body) {
    if (active) {
      document.body.setAttribute('data-dsh-code-console', 'true')
    } else {
      document.body.removeAttribute('data-dsh-code-console')
    }
  }
  if (active) {
    window.requestAnimationFrame(ensureDecorations)
  } else {
    removeDecorations()
  }
}

export const name = 'dsh-skin-code-console/client'

export const inject = ['theme']

export function apply(ctx) {
  const theme = ctx.get('theme')
  ctx.effect(() => theme.register({ id: 'code-console', colorScheme: 'dark', tokens: {} }), 'code-console skin: appearance option')
  applyMode(theme)

  ctx.effect(() => {
    let queued = false
    const sync = () => {
      if (queued) return
      queued = true
      window.requestAnimationFrame(() => {
        queued = false
        if (document.body?.hasAttribute('data-dsh-code-console')) ensureDecorations()
      })
    }
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    const statusTimer = window.setInterval(syncRuntimeStatus, 1200)
    sync()
    return () => {
      observer.disconnect()
      window.clearInterval(statusTimer)
      removeDecorations()
    }
  }, 'code-console skin: live decorations')

  ctx.effect(() => ctx.on('theme/change', () => {
    applyMode(theme)
  }), 'code-console skin: theme compatibility')

}
