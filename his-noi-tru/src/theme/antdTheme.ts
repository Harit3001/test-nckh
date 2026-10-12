import { ThemeConfig } from 'antd';

export const medicalTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0891b2', // Medical Cyan / Teal
    colorPrimaryHover: '#06b6d4',
    colorPrimaryActive: '#0e7490',
    colorSuccess: '#059669', // Emerald health green
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorInfo: '#0284c7',
    colorBgBase: '#f8fafc', // Light slate neutral
    colorBgContainer: '#ffffff',
    colorTextBase: '#0f172a', // Slate 900 for high WCAG AA contrast
    colorTextSecondary: '#475569', // Slate 600
    colorBorder: '#e2e8f0', // Slate 200
    colorBorderSecondary: '#f1f5f9',
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 38,
      fontWeight: 500,
      primaryShadow: '0 2px 4px 0 rgba(8, 145, 178, 0.25)',
    },
    Card: {
      borderRadiusLG: 12,
      headerBg: '#ffffff',
      headerFontSize: 16,
      boxShadowTertiary: '0 1px 3px 0 rgba(15, 23, 42, 0.05)',
    },
    Table: {
      headerBg: '#f1f5f9',
      headerColor: '#1e293b',
      rowHoverBg: '#f8fafc',
      borderRadius: 8,
    },
    Modal: {
      borderRadiusLG: 14,
      headerBg: '#ffffff',
    },
    Input: {
      controlHeight: 38,
      borderRadius: 8,
    },
    Select: {
      controlHeight: 38,
      borderRadius: 8,
    },
    Timeline: {
      itemPaddingBottom: 24,
    },
    Tag: {
      borderRadiusSM: 4,
    },
  },
};
