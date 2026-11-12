export const xsollaProjectId = import.meta.env.VITE_XSOLLA_LOGIN_PROJECT_ID

export const xsollaConfig = xsollaProjectId
  ? {
      projectId: xsollaProjectId,
      preferredLocale: 'en_US',
      callbackUrl: window.location.origin,
    }
  : null

export const hasXsollaConfig = () => Boolean(xsollaConfig)
