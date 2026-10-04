/** Optional skin controls; display preferences only, no sessions or model data. */
export function installSkinAppearance(ctx: any): void {
  ctx.inject(['theme'], (scope: any) => {
    scope.effect(() => {
      const key = 'dsh.arcade.enabled'
      const nameKey = 'dsh.arcade.character-name'
      const theme = scope.theme
      const hasBuiltin = theme.getTheme().themes.some((item: any) => item.id === 'arcade')
      const unregister = hasBuiltin ? () => {} : theme.register({ id: 'arcade', colorScheme: 'dark', tokens: {} })
      const read = (key: string) => { try { return localStorage.getItem(key) ?? '' } catch { return '' } }
      let cube: HTMLButtonElement | undefined
      let panel: HTMLElement | undefined
      const sync = (snapshot: any) => {
        const active = snapshot.active.id === 'arcade'
        document.body.toggleAttribute('data-dsh-arcade', active)
        cube?.setAttribute('aria-pressed', String(active))
        try { localStorage.setItem(key, active ? '1' : '0') } catch {}
      }
      const disposeTheme = scope.on('theme/change', sync)
      if (!hasBuiltin && read(key) === '1') theme.setTheme('arcade')
      sync(theme.getTheme())
      const mount = () => {
        const last = document.querySelector<HTMLButtonElement>('[role="dialog"] button[class*="themeCube"]:last-child')
        if (!last || last.closest('[data-skin-appearance]')) return
        // Integrated Harness already renders its own fourth choice; never duplicate it.
        if (!hasBuiltin && !last.parentElement?.querySelector('[data-skin-arcade-choice]')) {
          cube = document.createElement('button')
          cube.type = 'button'
          cube.className = last.className
          cube.dataset.skinArcadeChoice = ''
          cube.textContent = '像素霓虹'
          cube.setAttribute('aria-pressed', String(theme.getTheme().active.id === 'arcade'))
          cube.addEventListener('click', () => theme.setTheme('arcade'))
          last.parentElement?.append(cube)
        }
        const group = last.parentElement?.parentElement
        if (!group || group.querySelector('[data-skin-appearance]')) return
        panel = document.createElement('label')
        panel.dataset.skinAppearance = ''
        panel.textContent = '鲸鱼娘的自定义名字 '
        const input = document.createElement('input')
        input.type = 'text'; input.maxLength = 24; input.placeholder = '鲸鱼娘'
        input.setAttribute('aria-label', '鲸鱼娘的自定义名字（外观设置）')
        input.value = read(nameKey)
        input.addEventListener('input', () => {
          try { localStorage.setItem(nameKey, input.value) } catch {}
          window.dispatchEvent(new Event('dsh-character-name-change'))
        })
        panel.append(input); group.append(panel)
      }
      // Only observes element mounts; edits stay in plugin-owned controls.
      const observer = new MutationObserver(mount)
      observer.observe(document.body, {childList:true,subtree:true})
      mount()
      return () => { observer.disconnect(); cube?.remove(); panel?.remove(); if (typeof disposeTheme === 'function') disposeTheme(); unregister(); if (!hasBuiltin) document.body.removeAttribute('data-dsh-arcade') }
    }, 'digital-arcade: optional theme and local display-name controls')
  })
}
