export type AgreementType = "about" | "manual" | "privacy";

export const AGREEMENT_TITLE: Record<AgreementType, string> = {
  about: "关于来因",
  manual: "用户协议",
  privacy: "隐私政策",
};

export const AGREEMENT_HTML: Record<AgreementType, string> = {
  about: `
    <p>来因社区是一个记录生活、发现同好的内容社区。</p>
    <p>你可以浏览、搜索和发布图文笔记，并与其他用户互动交流。</p>
    <p>开源版本仅供学习与交流使用。</p>
  `,
  manual: `
    <p>欢迎使用来因社区。</p>
    <p>请合理使用本服务，不得发布违法、侵权或不良内容。我们有权对违规内容进行处理。</p>
    <p>本服务按现状提供。开源版本仅供学习交流，请勿用于未授权的商业转售。</p>
  `,
  privacy: `
    <p>我们会收集你的账号（手机号）以及你主动发布的内容，用于登录、内容展示与互动。</p>
    <p>密码将加密存储。未经你同意，我们不会向第三方出售个人信息。</p>
    <p>你可以通过退出登录清除本地登录态。</p>
  `,
};
