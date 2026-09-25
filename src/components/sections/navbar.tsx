import { buttonClass } from "@/components/ui/controls";
import { SectionLink } from "@/components/ui/section-link";
import { getSessionUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { NavbarFrame } from "./navbar-frame";

/** The site navbar: `NavbarFrame` plus the signed-in state from the session. */
export async function Navbar() {
  const user = await getSessionUser();

  const account = user ? (
    <>
      <span className="hidden max-w-[16ch] truncate text-sm font-bold text-ink sm:block">
        {user.displayName}
      </span>
      {user.isStudent && (
        <span
          title="Mahasiswa: email kampus (.ac.id) terkonfirmasi"
          className="hidden rounded-full bg-blue/10 px-3 py-1.5 text-xs font-extrabold text-blue sm:block"
        >
          Mahasiswa
        </span>
      )}
      <form action={signOut}>
        <button type="submit" className={buttonClass("soft", "sm")}>
          Keluar
        </button>
      </form>
    </>
  ) : (
    <SectionLink
      href="/#login"
      className={buttonClass("dark", "sm", "max-sm:hidden")}
    >
      Masuk
    </SectionLink>
  );

  return <NavbarFrame account={account} signedIn={Boolean(user)} />;
}
