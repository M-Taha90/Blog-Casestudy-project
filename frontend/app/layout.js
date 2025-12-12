import './globals.css'

export const metadata = {
  title: 'Blog & Case Study Platform',
  description: 'Collaborative blog and case study editor',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}

