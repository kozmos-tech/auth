// Invite feature is disabled until it can be fully implemented.
// The component and its `inviteUser` server action are commented out for now;
// re-enable this file, the `inviteUser` action in lib/actions.ts, and the
// <InviteUserDialog /> usage in users-table.tsx to bring the feature back.

export {};

// "use client";
//
// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";
// import { Plus } from "lucide-react";
//
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Modal } from "@/components/ui/modal";
// import { Select } from "@/components/ui/select";
// import { inviteUser } from "@/lib/actions";
//
// export function InviteUserDialog({ projectId }: { projectId: string }) {
//   const router = useRouter();
//   const [open, setOpen] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [pending, startTransition] = useTransition();
//
//   function onSubmit(formData: FormData) {
//     setError(null);
//     startTransition(async () => {
//       const result = await inviteUser(projectId, {
//         name: String(formData.get("name") ?? ""),
//         email: String(formData.get("email") ?? ""),
//         role: String(formData.get("role") ?? "member"),
//       });
//       if ("error" in result) {
//         setError(result.error);
//         return;
//       }
//       setOpen(false);
//       router.refresh();
//     });
//   }
//
//   return (
//     <>
//       <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
//         <Plus className="size-4" />
//         Invite user
//       </Button>
//
//       <Modal
//         open={open}
//         onClose={() => setOpen(false)}
//         title="Invite user"
//         description="Add a user to this project. They'll start with an invited status."
//       >
//         <form action={onSubmit} className="space-y-4">
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Full name</label>
//             <Input name="name" placeholder="Ada Lovelace" autoFocus required />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Email</label>
//             <Input
//               name="email"
//               type="email"
//               placeholder="ada@example.com"
//               required
//             />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Role</label>
//             <Select name="role" defaultValue="member">
//               <option value="member">Member</option>
//               <option value="admin">Admin</option>
//               <option value="owner">Owner</option>
//             </Select>
//           </div>
//
//           {error && <p className="text-sm text-destructive">{error}</p>}
//
//           <div className="flex items-center justify-end gap-2 pt-1">
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               onClick={() => setOpen(false)}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" size="sm" disabled={pending}>
//               {pending ? "Inviting…" : "Send invite"}
//             </Button>
//           </div>
//         </form>
//       </Modal>
//     </>
//   );
// }
