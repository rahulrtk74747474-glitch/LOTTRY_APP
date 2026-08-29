import { ensureMember, getMemberTickets } from "@/lib/members";
import { AuthGateway } from "./auth-gateway";
import { chatGPTSignInPath, getChatGPTUser } from "./chatgpt-auth";
import { FairDrawApp } from "./fairdraw-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();

  if (!user) {
    return <AuthGateway signInPath={chatGPTSignInPath("/")} />;
  }

  const member = await ensureMember(user);
  const tickets = await getMemberTickets(member.id);
  return <FairDrawApp member={member} initialTickets={tickets} />;
}
