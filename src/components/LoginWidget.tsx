import { useEffect } from 'react'
import { Widget } from '@xsolla/login-sdk'
import { xsollaConfig } from '../auth/xsolla'

export function LoginWidget() {
  useEffect(() => {
    if (!xsollaConfig) return

    const container = document.getElementById('xl_auth')
    if (!container) return

    const widget = new Widget(xsollaConfig)
    widget.mount('xl_auth')

    const openWidget = () => {
      container.style.display = 'block'
      widget.open()
    }
    window.addEventListener('xsolla-login-open', openWidget)
    return () => {
      window.removeEventListener('xsolla-login-open', openWidget)
      widget.unmount()
    }
  }, [])

  return <div id="xl_auth" style={{ display: 'none' }} />
}
