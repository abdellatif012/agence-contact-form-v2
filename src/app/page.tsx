import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#EDEAE3] px-4 py-10 sm:px-8">
      <div className="w-full max-w-5xl">
        <ContactForm />
      </div>
    </main>
  );
}
