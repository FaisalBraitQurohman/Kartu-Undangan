// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthScreen } from "@/components/auth-screen";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
describe("Form akun", () => {
  it("shows Indonesian validation before sending registration", async () => {
    render(<AuthScreen mode="register" />);
    fireEvent.change(screen.getByLabelText("Nama lengkap"), {
      target: { value: "Alya" },
    });
    fireEvent.change(screen.getByLabelText("Alamat email"), {
      target: { value: "alya@example.test" },
    });
    fireEvent.change(screen.getByLabelText("Kata sandi"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buat akun" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "Kata sandi minimal 12 karakter",
      ),
    );
  });
});
