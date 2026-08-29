import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fairdraw.app",
  appName: "FairDraw",
  webDir: "dist/client",
  server: {
    url: process.env.CAPACITOR_SERVER_URL ?? "https://fairdraw-lottery.rahul-rtk2222.chatgpt.site",
    cleartext: false,
    allowNavigation: ["fairdraw-lottery.rahul-rtk2222.chatgpt.site"],
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
