"use client";

import { useCalimero } from "@calimero-network/calimero-client";

import EditForm from "./_components/edit-form";

import "./style.scss";

export default function EditPage() {

  const { isAuthenticated } = useCalimero();

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-[56rem] mx-auto py-10 px-6">
        <p className="text-center text-neutral-500">
          Please log in to edit the document.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[56rem] mx-auto py-10 px-6">
      <EditForm />
    </div>
  );
}
