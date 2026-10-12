import { describe, expect, it, vi, beforeEach } from "vitest";
const stubs = vi.hoisted(() => ({
  session: vi.fn(),
  findUser: vi.fn(),
  findInvitation: vi.fn(),
}));
vi.mock("next-auth", () => ({ getServerSession: stubs.session }));
vi.mock("@/lib/auth/options", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: stubs.findUser },
    invitation: { findFirst: stubs.findInvitation },
  },
}));
import { requireUser, requireAdmin } from "@/lib/auth/guards";
import { ownedInvitation } from "@/features/invitations/service";
beforeEach(() => {
  vi.resetAllMocks();
});
describe("Autorisasi server", () => {
  it("does not treat a JWT as proof of an active user", async () => {
    stubs.session.mockResolvedValue({
      user: { id: "user-a", sessionVersion: 0 },
    });
    stubs.findUser.mockResolvedValue({
      id: "user-a",
      sessionVersion: 1,
      emailVerified: new Date(),
      disabledAt: null,
      role: "USER",
    });
    await expect(requireUser()).rejects.toMatchObject({ status: 401 });
  });
  it("rejects disabled accounts and unverified users", async () => {
    stubs.session.mockResolvedValue({
      user: { id: "user-a", sessionVersion: 0 },
    });
    stubs.findUser.mockResolvedValue({
      sessionVersion: 0,
      emailVerified: new Date(),
      disabledAt: new Date(),
    });
    await expect(requireUser()).rejects.toMatchObject({ status: 401 });
  });
  it("checks admin role from the database", async () => {
    stubs.session.mockResolvedValue({
      user: { id: "user-a", sessionVersion: 0 },
    });
    stubs.findUser.mockResolvedValue({
      id: "user-a",
      sessionVersion: 0,
      emailVerified: new Date(),
      disabledAt: null,
      role: "USER",
    });
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
  it("scopes an invitation lookup to both user and invitation", async () => {
    stubs.findInvitation.mockResolvedValue(null);
    await expect(
      ownedInvitation("user-b", "invitation-a"),
    ).rejects.toMatchObject({ status: 404 });
    expect(stubs.findInvitation).toHaveBeenCalledWith({
      where: { id: "invitation-a", userId: "user-b" },
    });
  });
});
