import RoleLoginPage from "@/components/auth/RoleLoginPage";

// Initial entry point of the application. Everything downstream is
// gated behind role selection here: Admin -> /admin, Doctor -> /doctor,
// Patient -> /patient (which continues into the existing /language ->
// /consultation-type -> ... clinical intake flow, unchanged).
export default function RootPage() {
  return <RoleLoginPage />;
}
