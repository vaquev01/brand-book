export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#08090c] text-white overflow-x-hidden">
      {children}
    </div>
  )
}
