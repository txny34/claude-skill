export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mx-auto max-w-2xl p-6">{children}</div>;
}
